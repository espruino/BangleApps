# Trail Rail ![](app.png)

Simple app to follow GPX track

Written by: [Pavel Machek](https://github.com/pavelmachek)

After GPS fix is acquired, it displays familiar arrow with road in
front of you. It never stores whole track in memory, so it should work
with fairly large files.

GPX files can be obtained from various services, www.mapy.cz is one of
them (actually uses openstreetmap data for most of the world).

## Preparing data

"gpx2egt.sh < file.gpx > t.name.egt" can be used to prepare data, then
upload it to watch.

