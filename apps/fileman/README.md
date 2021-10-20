# FileManager

A small file manager, mostly written for debugging issues on the watch.
Upon opening, the app will display a list of all the files in storage (it will contract the sub-components of a StorageFile into one entry).
When selecting a file the following options appear (depending on file type detected by extension):

- Length: file size in bytes
- Display file: print out file contents on screen (will attempt to add back newlines for minimized JS code)
- Load file [*.js files only, no widgets]: load and execute javascript file
- Display image [*.img files only]: attempt to render file contents as image on screen
- Delete file: delete file (asks for confirmation first, will delete all components of a StorageFile)
