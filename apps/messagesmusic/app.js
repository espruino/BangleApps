// don't define artist/etc here so we don't wipe them out of memory if they were stored from before
setTimeout(()=>require('messages').openGUI({"t":"add","id":"music","state":"show","new":true}));
