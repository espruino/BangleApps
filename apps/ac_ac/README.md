# AC-AC - A Configurable Analog Clock #

This app implements an analog clock with various faces, hands and complications
to choose from before uploading to a Bangle.js 2.

It is based on the [Analog Clock Construction Kit (ACCK)](https://github.com/rozek/banglejs-2-analog-clock-construction-kit)
and makes most of the currently implemented parts available with a few mouse
clicks - just click on "Upload" and you will be directed to a web form where
you compose your very own, personal analog clock.

You currently have the choice between

* 2 different clock sizes,
* 5 different clock faces,
* 5 different clock hands and
* 5 different complications

Alternatively, you may specify the GitHub URL of ACCK compatible modules for
external clock sizes, faces, hands or complications.

Additionally, you may use the currently configured global theme or configure
your own colors for clock fore- and background and second hands.

Consequently, even without external modules you already have the choice between
218880 combinations!

<!--
  1 + (8 Fg colors * 7 Bg colors) * 2 sizes * 5(8) faces * 5(6) hands *
  8 positions * 5 complications (w/o placeholder)
-->

## License ##

[MIT License](LICENSE)
