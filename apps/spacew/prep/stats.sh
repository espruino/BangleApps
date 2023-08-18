#!/bin/bash
zoom() {
    echo "Zoom $1"
    cat delme/z$1-* | wc -c
    echo "M..k..."
}

echo "Total data"
cat delme/* | wc -c
echo "M..k..."
zoom 18
zoom 17
zoom 16
zoom 15
zoom 14
zoom 13
zoom 12
zoom 11
zoom 10
echo "Zoom 1..9"
cat delme/z?-* | wc -c
echo "M..k..."
