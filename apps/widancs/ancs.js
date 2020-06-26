(() => {

  var s = require("Storage").readJSON("widancs.json",1)||{settings:{enabled:false, category:[1,2,4]}};
  var ENABLED = s.settings.enabled;
  var CATEGORY = s.settings.category;

  function advert(){
  NRF.setAdvertising([
      0x02, //length
      0x01, //flags
      0x06, //
      0x11, //length
      0x15, //solicited Service UUID
      0xD0,0x00,0x2D,0x12,0x1E,0x4B,
      0x0F,0xA4,
      0x99,0x4E,
      0xCE,0xB5,
      0x31,0xF4,0x05,0x79],{connectable:true,discoverable:true,interval:375});
  }
  
  var state = {
      gatt:null,
      ancs:null,
      current:{cat:0,uid:0},
      notqueue:[],
      msgTO:undefined,
      com:new Uint8Array([0,0,0,0,0,1,20,0,3,100,0]),
      buf:new Uint8Array(132),
      inp:0,
      store:function(b){
          var i = this.inp;
          if (i+b.length<=132){
              this.buf.set(b,i);
              this.inp+=b.length;
          }
      },
      gotmsg:function(){
          var n = this.inp;
          var vw = DataView(this.buf.buffer);
          if (n<8) return null;
          var tn=vw.getUint16(6,true);
          if (n<(tn+8)) return null;
          var mn=vw.getUint16(9+tn,true);
          if (n<(mn+tn+11)) return null;
          return {tlen:tn, mlen:mn}; 
      }
  };  

  //stop advertising when peripheral link disconnected
  if (!NRF.getGattforCentralServer && ENABLED && typeof SCREENACCESS!='undefined') 
  NRF.on('disconnect',function(reason){
      NRF.sleep();
  });

  if (ENABLED && typeof SCREENACCESS!='undefined') 
  NRF.on('connect',function(addr){
    if(NRF.getGattforCentralServer)
      do_bond(NRF.getGattforCentralServer(addr));
    else
      NRF.connect(addr).then(do_bond);
  });
        
  function do_bond(g) {
      var tval, ival;
      state.gatt = g;
      function cleanup(){
        drawIcon(0); //disconnect from iPhone
        delete state.gatt;
        delete state.ancs;
        if(!NRF.getGattforCentralServer) NRF.disconnect();
        setTimeout(()=>{NRF.wake();},500);
      }
      drawIcon(1); //connect from iPhone
      state.gatt.device.on('gattserverdisconnected', function(reason) {
         if (ival) clearInterval(ival);
         if (tval) clearInterval(tval); 
        cleanup();
      });
      E.on("kill",function(){
        state.gatt.disconnect().then(function(){NRF.sleep();});
      });      
      NRF.setSecurity({passkey:"123456",mitm:1,display:1});
      tval = setTimeout(function(){
          if (ival) clearInterval(ival);
          state.gatt.disconnect().then(cleanup);
      },10000);        
      state.gatt.startBonding().then(function(){
        ival = setInterval(function(){
            var sec = state.gatt.getSecurityStatus();
            if (!sec.connected) {clearInterval(ival); clearTimeout(tval); return;}
            if (sec.connected && sec.encrypted){
              clearInterval(ival);  
              clearTimeout(tval);
              drawIcon(2); //bonded to iPhone
              do_ancs(); 
              return;
            }
        },1000);
      }).catch(function(e){
        Terminal.println("ERROR "+e);
      });
  }
  
  function do_ancs() {
    state.ancs = {primary:null, notify:null, control:null, data:null};
    state.gatt.getPrimaryService("7905F431-B5CE-4E99-A40F-4B1E122D00D0").then(function(s) {
      state.ancs.primary=s;
      return s.getCharacteristic("9FBF120D-6301-42D9-8C58-25E699A21DBD");
    }).then(function(c) {
      state.ancs.notify=c;
      return state.ancs.primary.getCharacteristic("69D1D8F3-45E1-49A8-9821-9BBDFDAAD9D9");      
    }).then(function(c) {
      state.ancs.control=c;
      return state.ancs.primary.getCharacteristic("22EAC6E9-24D6-4BB5-BE44-B36ACE7C7BFB");
    }).then(function(c) {
      state.ancs.data =c;
      drawIcon(3);//got remote services
      state.ancs.notify.on('characteristicvaluechanged', function(ev) {
        getnotify(ev.target.value);
      });
      state.ancs.data.on('characteristicvaluechanged', function(e) {
        state.store(e.target.value.buffer);
        var inds = state.gotmsg();
        if (inds) printmsg(state.buf,inds);        
      });
      state.ancs.notify.startNotifications().then(function(){
           state.ancs.data.startNotifications().then(function(){
              drawIcon(4); //ready for messages
           });  
      });
    }).catch(function(e){
        Terminal.println("ERROR "+e);
    });
  }
  
  function wordwrap(s){
    var txt = s.split("\n");
    var MAXCHARS = 18;
    for (var i = 0; i < txt.length; i++) {
      txt[i] = txt[i].trim();
      var l = txt[i];
      if (l.length > MAXCHARS) {
        var p = MAXCHARS;
        while (p > MAXCHARS - 8 && !" \t-_".includes(l[p]))
          p--;
        if (p == MAXCHARS - 8) p = MAXCHARS;
        txt[i] = l.substr(0, p);
        txt.splice(i + 1, 0, l.substr(p));
      }
    }
    return txt.join("\n");
  }
  
  
  var buzzing =false;  
  var screentimeout = undefined;
  var inalert = false;
  
  function release_screen(){
    screentimeout= setTimeout(() => { 
        SCREENACCESS.release(); 
        screentimeout = undefined; 
        inalert=false; 
        next_notify();
    }, 500);
  } 

  function printmsg(buf,inds){

    function send_action(tf){
      var bb = new Uint8Array(6);
      var v = DataView(bb.buffer);
      v.setUint8(0,2);
      v.setUint32(1,state.current.uid,true);
      v.setUint8(5,tf?0:1 );
      state.ancs.control.writeValue(bb).then(release_screen);        
    }

    if (state.msgTO) clearTimeout(state.msgTO); 
    var title="";
    for (var i=8;i<8+inds.tlen; ++i) title+=String.fromCharCode(buf[i]);
    var message = "";
    for (var j=11+inds.tlen;j<11+inds.tlen+inds.mlen;++j) { 
      message+=String.fromCharCode(buf[j]);
    } 
    message = wordwrap(message);
    //we may already be displaying a prompt, so clear it
    E.showPrompt();
    if (screentimeout) clearTimeout(screentimeout);
    Bangle.setLCDPower(true);
    SCREENACCESS.request();
    if (!buzzing){
        buzzing=true;
        Bangle.buzz(500).then(()=>{buzzing=false;});
    }
    if (state.current.cat!=1){
      E.showAlert(message,title).then(send_action.bind(null,false));
    } else {
      E.showPrompt(message,{title:title,buttons:{"Accept":true,"Cancel":false}}).then(send_action);
    }
  }

  var notifyTO;
  function getnotify(d){
    var eid = d.getUint8(0);
    var ct = d.getUint8(2);
    var id = d.getUint32(4,true);
    if (eid>1) return;
    if (notifyTO) clearTimeout(notifyTO);
    if(!CATEGORY.includes(ct)) return; 
    var len = state.notqueue.length;
    if (ct == 1) { // it's a call so pre-empt
        if (inalert) {state.notqueue.push(state.current); inalert=false;}
        state.notqueue.push({cat:ct, uid:id});
    } else if (len<16)
        state.notqueue[len] = {cat:ct, uid:id};
    notifyTO = setTimeout(next_notify,1000);
  }

  function next_notify(){
      if(state.notqueue.length==0 || inalert) return;
      inalert=true;
      state.current = state.notqueue.pop();
      var v = DataView(state.com.buffer);
      if (state.current.cat==6) v.setUint8(8,2); else v.setUint8(8,3);//get email title
      v.setUint32(1,state.current.uid,true);
       state.inp=0;
       state.ancs.control.writeValue(state.com).then(function(){
            state.msgTO=setTimeout(()=>{
               inalert=false;
               state.msgTO=undefined;
               next_notify();
               },1000);
       });
  }

  var stage = 5;    
  //grey, pink, lightblue, yellow, green
  function draw(){
    var colors = new Uint16Array([0xc618,0xf818,0x3ff,0xffe0,0x07e0,0x0000]);
    var img = E.toArrayBuffer(atob("GBgBAAAABAAADgAAHwAAPwAAf4AAP4AAP4AAP4AAHwAAH4AAD8AAB+AAA/AAAfgAAf3gAH/4AD/8AB/+AA/8AAf4AAHwAAAgAAAA"));
    g.setColor(colors[stage]);
    g.drawImage(img,this.x,this.y);
  }
    
  WIDGETS["ancs"] ={area:"tl", width:24,draw:draw};
    
  function drawIcon(id){
    stage = id;
    WIDGETS["ancs"].draw();
  }
  
  if (ENABLED && typeof SCREENACCESS!='undefined') {
    stage = 0;
    NRF.setServices(undefined,{uart:false});
    NRF.sleep();
    NRF.wake();
    advert();
  }
  
  })();
  
  
  