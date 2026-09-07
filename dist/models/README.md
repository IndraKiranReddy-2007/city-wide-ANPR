Place an optimized glTF / GLB model at `public/models/car.glb`.

Recommendations:
- Use a single `.glb` file exported from Blender or glTF-Pipeline.
- Reduce texture sizes and compress using `gltfpack` or `draco`.
- Aim for < 2MB for fast loading; use KTX or basis for textures.

If you don't have a model, you can download a permissively licensed car GLB from sources like:
- Sketchfab (check license)
- Poly Haven / CC0 assets

After placing the file, rebuild or refresh the app. The 3D viewer will attempt to preload `/models/car.glb`.