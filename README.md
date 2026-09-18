# Bali Flight Explorer

Playable A330 flight over **real Bali DEM** (Terrarium/Mapzen) draped with **ESRI World Imagery** satellite tiles.

## Play

https://raw.githack.com/mengtahsu/bali-explorer/main/docs/index.html

## Notes

- Terrain is elevation mesh + satellite texture (not Google Earth / Cesium 3D building meshes).
- Satellite tiles load at runtime from ESRI (needs network; CORS usually OK).
- Coordinated-turn model: bank → turn only; pitch → climb/descent only (no L/R altitude asymmetry).
- Embedded DEM is 256×160 Int16 gzip for GitHub text limits; fine for cruise-scale flying.
