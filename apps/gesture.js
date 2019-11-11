Bangle.on('aiGesture',(gesture)=>{
  E.showMessage(gesture?gesture:"Unknown");
  setTimeout(()=>g.clear(), 2000);
});
E.showMessage("Wave your hands\nto detect\na gesture","Gesture Test");
