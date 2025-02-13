#!/bin/bash
if [ ".$1" == ".-f" ]; then
    wget https://raw.githubusercontent.com/martynafford/natural-earth-geojson/master/10m/cultural/ne_10m_admin_0_sovereignty.json
    wget https://raw.githubusercontent.com/martynafford/natural-earth-geojson/master/10m/cultural/ne_10m_admin_0_label_points.json
    wget https://raw.githubusercontent.com/martynafford/natural-earth-geojson/master/10m/cultural/ne_10m_populated_places_simple.json
fi
rm delme.json
rm -r delme/; mkdir delme
./split.js --world
./minitar.js
ls -lS delme/*.json  | head -20
cat delme/* | wc -c
ls -l delme.mtar

