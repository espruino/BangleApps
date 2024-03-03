{let buzzTimeout;
setWatch((e)=>{
  if (e.state) buzzTimeout = setTimeout(()=>{Bangle.buzz(80,0.40);setTimeout(Bangle.showClock,150);}, 250);
  if (!e.state && buzzTimeout) clearTimeout(buzzTimeout);},
BTN,{repeat:true,edge:'both'});}
