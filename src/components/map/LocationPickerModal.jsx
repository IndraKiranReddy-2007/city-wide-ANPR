import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, X, Check } from 'lucide-react';

// Custom SVG marker icon for location picker
const pickerIcon = L.divIcon({
  className: 'custom-picker-pin',
  html: `<div style="background-color:#06b6d4;width:24px;height:24px;border-radius:50%;border:3px solid #ffffff;box-shadow:0 0 12px #06b6d4;display:flex;align-items:center;justify-content:center;">
    <div style="width:6px;height:6px;background-color:#000;border-radius:50%;"></div>
  </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationPickerModal({ isOpen, onClose, onConfirm, initialLat = 21.1458, initialLng = 79.0882 }) {
  const [selectedPos, setSelectedPos] = useState({ lat: initialLat, lng: initialLng });

  if (!isOpen) return null;

  const handleSelect = (lat, lng) => {
    setSelectedPos({ lat: parseFloat(lat.toFixed(6)), lng: parseFloat(lng.toFixed(6)) });
  };

  const handleConfirm = () => {
    onConfirm(selectedPos.lat, selectedPos.lng);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-3xl bg-command-surface border border-command-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-command-border bg-command-card/80">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-command-accent" />
            <span className="text-sm font-bold font-heading text-white tracking-wide">
              Pick Camera Location on Tactical Map
            </span>
          </div>
          <button onClick={onClose} className="text-command-muted hover:text-white p-1 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Container */}
        <div className="h-96 w-full relative">
          <MapContainer
            center={[selectedPos.lat, selectedPos.lng]}
            zoom={13}
            scrollWheelZoom={true}
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[selectedPos.lat, selectedPos.lng]} icon={pickerIcon} />
            <MapClickHandler onLocationSelect={handleSelect} />
          </MapContainer>

          <div className="absolute top-3 right-3 z-[1000] bg-command-surface/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-command-border text-xs font-mono text-command-cyan shadow-lg">
            Click anywhere on map to reposition pin
          </div>
        </div>

        {/* Coordinates Preview Bar */}
        <div className="p-4 border-t border-command-border bg-command-card/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-xs font-mono text-command-textDim">
            <div>
              <span className="text-command-muted">Latitude:</span> <span className="text-white font-bold">{selectedPos.lat}</span>
            </div>
            <div>
              <span className="text-command-muted">Longitude:</span> <span className="text-white font-bold">{selectedPos.lng}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-command-card hover:bg-command-cardHover border border-command-border text-xs font-medium text-command-textDim hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-command-accent hover:bg-cyan-400 text-black text-xs font-semibold font-heading transition-all shadow-md shadow-cyan-500/20"
            >
              <Check className="w-4 h-4 stroke-[2.5]" /> Set Coordinates
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
