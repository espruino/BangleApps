
//g.clear();

var img = {
  width : 100, height : 100, bpp : 8,
  transparent : 254,
  buffer : require("heatshrink").decompress(atob("/wA/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4AglYAGE/44gHz4nnHKtPumez3C4WezFzp49ZLAgoCE4WeugnaHStPG4QAHzw9DE/Y6VHJQ9YMJwnEMk46CF4lzfglPug9WCAWYDQl0E4tzN4gLCMVC5Cp+YGoOezxBCubKHExxUEuiFCEoInECAhkjMQuYLArCFGwLLEHpjsGMIRpEfAsrMkwhBFAQ6BHJA9EKApDBHpAJBQYhPBE5iZBzAsDMb4gBEwg6MJhBkIYorgBPQiMMUAhkeHgkrug7ObI5qBHwhiGZYomOEojGeJQVzTx5kOMQ6JREAR3CDIJkcHobwEMiw+CAAYJEMSYWCAgRjcDgI4CYyiiDXopiFBooAWRwJkaHwjGVKwdzH4rADuhiXZAaICMbbtGHy2YBQ+YRDCiEMbidCULBkDLIwIIdqbmCp5jZPwIfDAYQAXXwNPzwACIQLQIACt0ZDIZBTwRFBHjWeHoSJCETlPc4ZjdAYYA7L4Jj/Mf5jCEYQDDAHhEEMbzH+McBfCMf4ADzxjep+YL/1PMb10MYQDCAHd0MYV0MbdzEYoA7UYdPMTBkCc4hj9leeAYRjbL4aIDAHN0UwRjeL4WYZHlPzBnCMbZkBQojtCAG6gEp5ibZARfCdwjG3ugDBzzGcMYTIEFAQA1ujGFMbjIFeAgA0HobGeZA9PAgYAyG4jGfZAyPBzBizf4LGjMggtCFAJpDAFw0FMURjCeAd0AgYAup90AgZjjMgWYFYZkwGImYMUhkDeYdPuZituZiDzximMYUrFwj6DAFF0TAg6CMcpkCSYpkqMQtPMVBkDuZktMQtzMVRkDLwZkoMQoFBMVZkJp5ijX4JizMhFPMkQjBMWpkHIAKjEADTrGMWZkDuY8DuZkdMQKKEMWpkDUIxFEACocGdoJi1MhCqBAwgATLYLkEMXJkDIY4GEAB+ep9PC4aDBMXRkJukruhiRCgxi+MglzJAtPMR7cGNIJi+MglPJYhSBzBhLzB0FzwWBMX5lGMghVGAAtzld0bwph/MhNzWYzKGNwR2Euhi/MhhTHA4ZrHA4Rh/Mp10YIlzA4JoCBQjE/ZTK8BA45i/MqtzX4jE/Mj0rYQjECBYZP/MrFPMoWep5h/ZT90ujE/MsZh/MsZB/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/ACg"))
};


function hr(){
  
Bangle.buzz(100,0.1).then(()=>{
  g.clear();
  return new Promise(resolve=>setTimeout(resolve,250)); // wait 250ms
}).then(()=>{
  return Bangle.buzz(150);
}).then(()=>{
  g.drawImage(img, 25, 40, {scale:2});
});

}
setInterval(hr, 2000);

g.flip();

setWatch(Bangle.showLauncher, BTN2, { repeat: false, edge: "falling" });


