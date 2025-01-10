# Space Race

Compare GPS with Baido and Glonass

This turns GNSS receiver into mode with all three systems enabled, and
displays debug info from all of them. Click into top left corner to
switch navigation systems. Clicks in bottom half of screen switch info
pages.

GNSS acquisition has few phases, and this software is assuming you are
not doing a cold start. GNSS fix needs 4 or 5 satellites with
reasonable signal strength, and then holding the same place for 40 or
so seconds.

Uxx -- satellites are known but not being received

S1..S4 -- not enough satellites being decoded (5 needed)

XXdB -- this is strength of 5th strongest satellite

