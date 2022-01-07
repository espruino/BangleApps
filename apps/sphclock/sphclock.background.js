exports.drawBannerLeft = function(y, height, width) {
    x = 0;
    orig_y = y;
    g.setColor("#F00");
    half_height = Math.round(height/2);
  
    g.fillPoly([x, y, x += width, y, x -= half_height, y += half_height, x += half_height, y += half_height, x -= width, y]);
  
    x = 0;
    y = orig_y + 2;
    g.setColor("#FFF");
    g.drawPoly([x, y, x += width - 5, y, x -= half_height - 2, y += half_height - 2, x += half_height - 2, y += half_height - 2, x -= width - 5, y]);
  
    y = orig_y;
    g.setColor("#000");
    g.drawLine(0, y += 2 * half_height, width - 1, y);
    g.drawLine(x = width - half_height, y -= half_height, x += half_height, y -= half_height,);
  
  }
  
  exports.drawBackground = function() {
    g.setColor("#000");
    g.fillRect(0, 0, 175, 175);
    g.setColor("#FFF");
    g.fillRect(3, 3, 172, 172);
  }
  
  