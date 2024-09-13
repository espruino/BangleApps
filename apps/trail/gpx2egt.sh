#!/bin/bash
grep "trkpt lat" | sed 's/.*trkpt.lat=.//' | sed 's/. lon=./ /' | sed 's/".$//'
