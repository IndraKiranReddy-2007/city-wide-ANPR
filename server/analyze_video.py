"""Analyze a traffic video with YOLO and EasyOCR.

Usage:
  python server/analyze_video.py path/to/video.mp4

The script writes one JSON document to stdout so the Node API can consume it.
Install the optional runtime dependencies with:
  pip install ultralytics easyocr opencv-python
"""

import json
import os
import sys


def main():
    if len(sys.argv) != 2:
        raise ValueError("A video path is required.")

    import cv2
    import easyocr
    from ultralytics import YOLO

    video_path = sys.argv[1]
    model = YOLO(os.getenv("TRACK_MODEL", os.getenv("YOLO_MODEL", "yolo11n-seg.pt")))
    gpu_setting = os.getenv("EASYOCR_GPU", "false").lower()
    reader = easyocr.Reader(["en"], gpu=gpu_setting == "true")
    capture = cv2.VideoCapture(video_path)

    if not capture.isOpened():
        raise RuntimeError("Could not open the uploaded video.")

    frame_stride = max(1, int(os.getenv("VIDEO_FRAME_STRIDE", "3")))
    max_frames = max(1, int(os.getenv("VIDEO_MAX_FRAMES", "300")))
    vehicles = []
    processed_tracks = {}
    frame_number = 0
    analyzed_frames = 0

    while analyzed_frames < max_frames:
        ok, frame = capture.read()
        if not ok:
            break
        frame_number += 1
        if frame_number % frame_stride != 0:
            continue
        analyzed_frames += 1

        for result in model.track(frame, persist=True, tracker="bytetrack.yaml", verbose=False):
            names = result.names
            track_ids = result.boxes.id.int().cpu().tolist() if result.boxes.id is not None else [None] * len(result.boxes)
            for box, track_id in zip(result.boxes, track_ids):
                confidence = float(box.conf[0])
                if confidence < 0.35:
                    continue
                class_id = int(box.cls[0])
                vehicle_type = str(names.get(class_id, "Vehicle"))
                height, width = frame.shape[:2]
                x1, y1, x2, y2 = [int(value) for value in box.xyxy[0]]
                x1, y1 = max(0, x1), max(0, y1)
                x2, y2 = min(width, x2), min(height, y2)
                crop = frame[y1:y2, x1:x2]
                plate = ""
                if crop.size:
                    enlarged = cv2.resize(crop, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
                    gray = cv2.cvtColor(enlarged, cv2.COLOR_BGR2GRAY)
                    enhanced = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
                    text = reader.readtext(enhanced, detail=0, paragraph=False, allowlist="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")
                    plate = "".join(str(item).upper() for item in text if str(item).strip())
                    plate = "".join(character for character in plate if character.isalnum())

                if track_id is not None and track_id in processed_tracks:
                    continue
                key = plate or f"{vehicle_type}:{x1 // 40}:{y1 // 40}"
                if track_id is None and key in processed_tracks:
                    continue
                processed_tracks[track_id if track_id is not None else key] = plate or "Unreadable"
                vehicles.append({
                    "type": vehicle_type.title(),
                    "plate": plate or "Unreadable",
                    "color": "Unknown",
                    "confidence": round(confidence, 3),
                    "trackId": track_id,
                    "frame": frame_number
                })

    capture.release()
    print(json.dumps({
        "vehicles": vehicles,
        "framesAnalyzed": analyzed_frames,
        "summary": f"Analyzed {analyzed_frames} sampled frames with YOLO tracking and EasyOCR."
    }))


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(json.dumps({"error": str(error)}))
        sys.exit(1)
