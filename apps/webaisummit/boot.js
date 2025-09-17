{
  // delay loading so that users see the WebAI splash screen!
  let t=getTime();
  g.drawRect(40,136,136,152);
  while (getTime() < t+1) {
    g.fillRect(44,140,44+(getTime()-t)*88,148).flip();
  }
}