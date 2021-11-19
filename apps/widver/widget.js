WIDGETS["version"] = { area: "tr", width: 28, draw: function() {
  var ver = process.env.VERSION.split('.');
	// Example: if ver is 2v11 instead of 2v10.142 write "Rel" (Release) instead of Build number
  if(typeof ver[1] === 'undefined') ver[1] = "Rel";

  g.reset().setColor((g.getBPP()<8)?(g.theme.dark?"#0ff":"#00f"):"#08f").setFont("6x8");
  g.drawString(ver[0], this.x + 2, this.y + 4, true);
  g.setFontAlign(0, -1, 0).drawString(ver[1], this.x + this.width / 2, this.y + 14, true);
} };
