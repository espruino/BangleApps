# ViewSTL

A simple viewer to render 3D models on-screen. The STL files have to be of the ASCII (non-binary) type. The rendering process can become quite slow
for models with more than ~200-300 facets.

The app contains a number of inlined C routines and makes use of the microcontroller's FPU. Therefore, the app installed on the watch contains a base64 encoded binary
blob with those routines. The full C code is provided on github.

## Controls

The app supports 4 different rendering modes, swiping right-to-left on the touch screen cycles through them:
- shaded polygons
- shaded polygons with edge highlighting
- wireframe, only edges between non-coplanar facets visible
- wireframe, all facet (triangle) edges visible

There are three different rotation modes that slightly alter the function of buttons 1 and 3, swiping left-to-right cycles through the modes:
- free rotation: button 1 zooms in, button 3 out
- Z-axis (vertical axis) rotation: buttons 1 and 3 tilt the Z-axis
- align rotation with compass and accelerometer readings: button 1 zooms in, button 3 out

There is currently no interface to upload STL files to the watch, the web IDE storage icon can be used instead.


