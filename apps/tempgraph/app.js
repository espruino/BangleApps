// Temperature Graph
// BangleJS Script

Bangle.setBarometerPower(true,"tempgraph");
Bangle.loadWidgets();
var widsOn=true;
var rm=null;
var gt=null;
var dg=null;
var Layout=require("Layout");
var C=true;
var temp,tempMode,readErrCnt,watchButton2;

var graph=require("Storage").readJSON("tempgraph.json",true);
if(graph==undefined) {
	graph=[];
}

var timesData=[
	// dur=duration, u=time units, d=divisions on graph, s=seconds per unit.
	{dur:10,u:"Mins",d:5,s:60},
	{dur:20,u:"Mins",d:4,s:60},
	{dur:30,u:"Mins",d:3,s:60},
	{dur:40,u:"Mins",d:4,s:60},
	{dur:1,u:"Hr",d:4,s:3600},
	{dur:2,u:"Hrs",d:4,s:3600},
	{dur:3,u:"Hrs",d:3,s:3600},
	{dur:4,u:"Hrs",d:4,s:3600},
	{dur:6,u:"Hrs",d:6,s:3600},
	{dur:8,u:"Hrs",d:4,s:3600},
	{dur:12,u:"Hrs",d:6,s:3600},
	{dur:16,u:"Hrs",d:4,s:3600},
	{dur:20,u:"Hrs",d:5,s:3600},
	{dur:1,u:"Day",d:4,s:86400},
	{dur:2,u:"Days",d:4,s:86400},
	{dur:3,u:"Days",d:3,s:86400},
	{dur:4,u:"Days",d:4,s:86400},
	{dur:5,u:"Days",d:5,s:86400},
	{dur:6,u:"Days",d:6,s:86400},
	{dur:7,u:"Days",d:7,s:86400}
];
var times=[];
for(n=0;n<timesData.length;n++){
	times.push(timesData[n].dur+" "+timesData[n].u);
}
var durInd=0;
var duration=times[durInd];

function drawWids(){
	g.clear();
	if(widsOn){
		Bangle.drawWidgets();
		require("widget_utils").show();
	} else {
		require("widget_utils").hide();
	}
}

function openMenu(){
	drawWids();
	E.showMenu(menu);
}

function redoMenu(){
	clearInterval(rm);
	E.showMenu();
	openMenu();
}

function refreshMenu(){
	rm = setInterval(redoMenu,100);
}
function getF(c){
	// Get Fahrenheit temperature from Celsius.
	return c*1.8+32;
}

function getT(){
	Bangle.getPressure().then(p=>{
		temp=p.temperature;
		if(tempMode=="drawGraph"&&graph.length>0&&Math.abs(graph[graph.length-1].temp-temp)>10&&readErrCnt<2){
			// A large change in temperature may be a reading error. ie. A 0C or less reading after
			// a 20C reading. So if this happens, the reading is repeated up to 2 times to hopefully
			// skip such errors.
			readErrCnt++;
			print("readErrCnt "+readErrCnt);
			return;
		}
		clearInterval(gt);
		readErrCnt=0;
		switch (tempMode){
			case "showTemp":
				showT();
				break;
			case "drawGraph":
				var date=new Date();
				var dateStr=require("locale").date(date).trim();
				var hrs=date.getHours();
				var mins=date.getMinutes();
				var secs=date.getSeconds();
				graph.push({
					temp:temp,
					date:dateStr,
					hrs:hrs,
					mins:mins,
					secs:secs
				});
				if(graph.length==1){
					graph[0].dur=durInd;	
				}
				require("Storage").writeJSON("tempgraph.json", graph);
				if(graph.length==150){
					clearInterval(dg);
				}
				drawG();
		}
	});
}

function getTemp(){
	readErrCnt=0;
	gt = setInterval(getT,800);
}

function setButton(){
	var watchButton=setWatch(function(){
		clearInterval(gt);
		clearInterval(dg);
		clearWatch(watchButton);
		Bangle.removeListener("touch",screenTouch);
		openMenu();
	},BTN);
	Bangle.on('touch',screenTouch);
}

function setButton2(){
	watchButton2=setWatch(function(){
		clearWatch(watchButton2);
		openMenu();
	},BTN);
}

function zPad(n){
	return n.toString().padStart(2,0);	
}

function screenTouch(n,ev){
	if(ev.y>23&&ev.y<152){
		C=C==false;
		drawG(false);
	}
}

function drawG(){
	function cf(t){
		if(C){
			return t;
		}
		return getF(t);
	}
	drawWids();
	var top=1;
	var bar=21;
	var barBot=175-22;
	if(widsOn){
		top=25;
		bar=bar+24;
		barBot=barBot-24;
	}
	var low=graph[0].temp;
	var hi=low;
	for(n=0;n<graph.length;n++){
		var t=graph[n].temp;
		if(low>t){
			low=t;
		}
		if(hi<t){
			hi=t;
		}
	}
	var tempHi=Math.ceil((cf(hi)+2)/10)*10;
	var tempLow=Math.floor((cf(low)-2)/10)*10;
	var div=2;
	if(tempHi-tempLow>10){
		div=5;
	}
	if(C){
		g.setColor(1,0,0);
	}else{
		g.setColor(0,0,1);
	}
	var step=(barBot-bar)/((tempHi-tempLow)/div);
	for(n=0;n<graph.length;n++){
		var pos=tempLow-cf(graph[n].temp);
		g.drawLine(n+3,pos*(step/div)+barBot,n+3,barBot+3);
	}
	g.fillRect(161,barBot+5,174,barBot+20);
	g.setColor(1,1,1);
	g.setFont("6x8:2");
	if(C){
		g.drawString("C",163,barBot+5);
	}else{
		g.drawString("F",163,barBot+5);
	}
	g.setColor(0,0,0);
	g.setFont6x15();
	g.drawString("Temperature Graph - "+times[graph[0].dur],1,top);
	g.drawRect(2,bar-4,153,barBot+4);
	g.setFont("6x8:1");
	var num=tempHi;
	for(n=bar;n<=barBot;n=n+step){
		g.drawLine(3,n,152,n);
		g.drawString(num.toString().padStart(3," "),155,n-4);
		num=num-div;
	}
	step=151/timesData[graph[0].dur].d;
	for(n=step+2;n<152;n=n+step){
		g.drawLine(n,bar-4,n,barBot+4);
	}
	grSt=graph[0];
	g.drawString("Start: "+grSt.date+" "+grSt.hrs+":"+zPad(grSt.mins),1,barBot+6);
	var lastT=graph[graph.length-1].temp;
	g.drawString("Last Reading:",1,barBot+14);
	g.setColor(1,0,0);
	g.drawString(lastT.toFixed(1)+"C",85,barBot+14);
	g.setColor(0,0,1);
	g.drawString(getF(lastT).toFixed(1)+"F",121,barBot+14);
	process.memory(true);
}

function drawGraph(){
	setButton();
	tempMode="drawGraph";
	durInd=times.indexOf(duration);
	graph=[];
	getTemp();
	dg=setInterval(getTemp,1000*timesData[durInd].dur*timesData[durInd].s/150);
}

function showGraph(){
	setButton();
	drawG();
}

function noBluetooth(){
	if(NRF.getSecurityStatus().connected){
		return false;
	}else{
		message("Error! Your\nBangle Watch\ncurrently has\nno Bluetooth\nconnection.");
		return true;
	}
}

function saveGraph(){
	if(noBluetooth()){
		return;
	}
	drawG();
	g.flip();
	g.dump();
	message("Graph has\nbeen sent\nto Web IDE\nfor saving.\n");
}

function saveData(){
	if(noBluetooth()){
		return;
	}
	drawG();
	g.flip();
	print("Temperature Graph - "+times[graph[0].dur]+"\n");
	print("\"Date\",\"Time\",\"Celsius\",\"Fahrenheit\"");
	for(n=0;n<graph.length;n++){
		var gr=graph[n];
		print("\""+gr.date+"\",\""+gr.hrs+":"+zPad(gr.mins)+":"+zPad(gr.secs)+"\","+gr.temp+","+getF(gr.temp));	
	}
	message("Data has\nbeen sent\nto Web IDE\nfor saving.\n");
}

function message(mes){
	setButton2();
	var messageLO=new Layout({
		type:"v",c:[
			{type:"txt",font:"6x8:2",width:171,label:mes,id:"label"},
			{type:"btn",font:"6x8:2",pad:3,label:"OK",cb:l=>exit()},
		],lazy:true
	});
	drawWids();
	messageLO.render();
}

function showT(){
	tempLO.lab1.label=tempLO.lab3.label;
	tempLO.lab2.label=tempLO.lab4.label;
	tempLO.lab3.label=tempLO.lab5.label;
	tempLO.lab4.label=tempLO.lab6.label;
	tempLO.lab5.label=temp.toFixed(2)+"C";
	tempLO.lab6.label=getF(temp).toFixed(2)+"F";
	tempLO.render();
}

function exit(){
	clearWatch(watchButton2);
	openMenu();
}

function showTemp(){
	tempMode="showTemp";
	setButton2();
	tempLO=new Layout({
		type:"v",c:[
			{type:"h",c:[
				{type:"txt",pad:5,col:"#f77",font:"6x8:2",label:"      ",id:"lab1"},
				{type:"txt",pad:5,col:"#77f",font:"6x8:2",label:"      ",id:"lab2"}
			]},
			{type:"h",c:[
				{type:"txt",pad:5,col:"#f77",font:"6x8:2",label:"      ",id:"lab3"},
				{type:"txt",pad:5,col:"#77f",font:"6x8:2",label:"      ",id:"lab4"}
			]},
			{type:"h",c:[
				{type:"txt",pad:5,col:"#f00",font:"6x8:2",label:"      ",id:"lab5"},
				{type:"txt",pad:5,col:"#00f",font:"6x8:2",label:"      ",id:"lab6"}
			]},
			{type:"h",c:[
				{type:"btn",pad:2,font:"6x8:2",label:"Temp",cb:l=>getTemp()},
				{type:"btn",pad:2,font:"6x8:2",label:"Exit",cb:l=>exit()}
			]}
		]
	},{lazy:true});
	tempLO.render();
	getTemp();
}

var menu={
	"":{
		"title":" Temp. Graph"
	},

	"Widgets":{
		value:widsOn,
		format:vis=>vis?"Hide":"Show",
		onchange:vis=>{
			widsOn=vis;
			refreshMenu();
		}
	},

	"Duration":{
		value:times.indexOf(duration),
		min:0,max:times.length-1,step:1,wrap:true,
		format:tim=>times[tim],
		onchange:(dur)=>{
			duration=times[dur];
		}
	},

	"Draw Graph":function(){
		E.showMenu();
		drawGraph();
	},

	"Show Graph" : function(){
		E.showMenu();
		if(graph.length>0){
			showGraph();
		}else{
			message("No graph to\nshow as no\ngraph has been\ndrawn yet.");
		}
	},

	"Save Graph" : function(){
		E.showMenu();
		if(graph.length>0){
			saveGraph();
		}else{
			message("No graph to\nsave as no\ngraph has been\ndrawn yet.");
		}
	},

	"Save Data" : function(){
		E.showMenu();
		if(graph.length>0){
			saveData();
		}else{
			message("No data to\nsave as no\ngraph has been\ndrawn yet.");
		}
	},

	"Show Temp":function(){
		E.showMenu();
		showTemp();
	}
};

openMenu();
