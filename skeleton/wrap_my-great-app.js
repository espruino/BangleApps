var appname = 'mygreat';

require("Storage").write('*'+appname,`

`);

require("Storage").write('+'+appname,{
  "name":"My Great App","type":"",
  "icon":"*"+appname,
  "src":"-"+appname,
});

require("Storage").write("-"+appname,`

`
