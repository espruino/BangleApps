/*
Chance
by Michael Sillas
*/


var volinit = true;
var aleatorio;
var chance=false;
var chanceforma='moneda';
var ang = 0;
var puntosale = 1;

function inipinta(){
g.clear();


//color de fondo de default
g.setBgColor('#2c04ac');


//Pinta rec de fondo
g.setColor('#2c04ac').fillRect(0, 0, g.getHeight(),  g.getWidth());
}


Bangle.on('touch', function(zone,e) { 
  var cordenadas= Object.values(e);
if(chanceforma=='moneda'){
  
  if(chance==false){
      


      if(cordenadas[0] > 85 && cordenadas[1] > 134)
        {
         
          chanceforma='dado';
          chanceproc();
        }

      else
      {
      
        drawvolado();
        }        
      }
   }
  else if(chanceforma=='dado'){
   if(chance==false){ 
    if(cordenadas[0] < 88 && cordenadas[1] > 134)
        {
        
          volinit=true;
          chanceforma='moneda';
          chanceproc();
        }
    else
    {
    drawavdado();
    }
          
          }
  }
   });


function getImage(x){

if (x==1) {   
  return require("heatshrink").decompress(atob("qFQwkBiIA/AH4A/AH4A/AGcAAAQllFMQmHFDwmJFDkQE5cBE0ooaExonYJxyhYDpIxGKCocGBZQnVNZgoFJzJCIE7wONE7AOYDBq4KE7CRDax4nUQzgn/E/7VTfxYn/OwgniEwaeIGgInlLLJ2NE7AmEDhANFPaYYLEowpTIBYmKE6AVFOwgmLE54VLBYwzCGIR1UJxLvHiB1YBYgJBfRJ1WJwYiCE6Z1LBgg6EE6DfHLZInVExgNDEIYnROpieHE6QmMTw4nROponYOowPME6YmOE65OFCRQncCBzvSJx4nWJyA5EE6zYRE6omMPA4nNJyI6HE8DaFE45sGOyLbHPgwnaKAoAHYy4oPE7YoLE5DGPFJiyKE6rvHE6I/LE6YAOE84dHDQKEKE6S6JE7zXTE87kFE+omTPBZHDBwROUAH4A/AH4Ar"));
      }
  
  else if(x==2) {
  return require("heatshrink").decompress(atob("qFQwkBiIA/AD0QNAZlhSQ5MiFETkLJ0oobExrMZExpQZJ5xQ/KFInPKDB4/KD4nYKBwnYKBwnbKhgnYiBCCE8akOE/7yPE0wnaExjvaE/52cgIn/E84mNE7DFOYzAmOdzJQOY0wnXEZhaCYyxLNE7CbOBwROjgKeXdR52mE7AoNEYKeXFBsBYzDINGgR2WE5YiCE8iEEE84mXO5oNBE8QjDE8hQCE7KSBE8qgNE88QE80RAYYnjADLIIgIJCE8gEDKTh7oE5JQdE5RQcE+R4cE/4AOiAn/OzTwaJxgnaExgn/Ox7IZE84mOE65OPE/4mPE/x2QE/wmQgIcKA"));
  
  }
  
  else if(x==3) {
 return require("heatshrink").decompress(atob("t1uwkEogA/AH4A/AH4A/AC1AgAAZGSwxaHTJnbABUEGug3PGs6nNNlA3NCQ8BiIAZGyJsEgMimc//4AbmciiDdNBocCGboAFkBuMBgcvGsQABN4ajLgQ1k//xUpQ2DNkpuEGw41CgI1m//wUpIJCh42nUoY2Jj42n/42MbU7cLGwU/G1EgG2swGxY1oGxNAG1nwGxUBG342/G342/G342/G342/G342/G342/G342/G342/G342/G342/G342/G342/G342/G342/G342/G342/G342/G342/G342/G342/G342/G342/G342/G342/G3420gA2pmA2Hog25n42okA21iA2Ll42oFgQ1FGwcPGs/zGxkCG0/xGxNABQQ2nmA2Nj7apgg2KUsyjDGw7cDgEvGsfziCjJGwsBn42iGoY2JUoYABkY0fmQ1EUZBuFOAURADg0ENhRuHAEo2KNww1vN1LZKG9Q1OU8w0QHMRpRAH4A/AH4A/AH4ADA=="));
  }
}


function rotar(){
  ang +=  0.157;
  g.clearRect(0, 0, g.getHeight(),  139);
  g.drawImage(getImage(3),87,77,  {rotate : ang});
  
}

//Volado Letras (Toss)
function toss(){
 
  if(chance==false)
  { 
    g.setColor('#06f77b');
    }
  
  else
    
  {
   g.setColor('#D8D8D8');
  }
  
    g.setFontAlign(0,0); // center font
    g.setFont("Vector",26); // bitmap font, 8x magnified
    g.drawString("Toss",44,160);
}



//Roll dado Letras (Roll)
function roll(){
 
 if(chance==false)
  { 
    g.setColor('#06f77b');
    }
  
  else
    
  {
   g.setColor('#D8D8D8');
  }
  
    g.setFontAlign(0,0); // center font
    g.setFont("Vector",26); // bitmap font, 8x magnified
    g.drawString("Roll",135,160);
}



function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}


function drawvolado()
{
 
 
  if(volinit==true){ //si es inicial el volado
   aleatorio = 1;
    g.drawImage(getImage(1),49,30);
 
    }
  
  else{
    chance=true;
  toss();
  setInterval(function () {
    
      if(aleatorio==1){
      g.setColor('#D4AF37').fillCircle(g.getWidth()/2,73,50);
      aleatorio=2;
      }
      else if(aleatorio==2){
      g.setColor('#c0c0c0').fillCircle(g.getWidth()/2,73,50);      
      aleatorio=1;
      }
}, 500, aleatorio);
    
    
    setTimeout(function () {
       clearInterval();
 aleatorio = getRandomIntInclusive(1,2); 
      
     if(aleatorio==1){

    g.setColor('#c0c0c0');
    g.fillCircle(g.getWidth()/2,73,50);

        }
      else if(aleatorio==2){


    g.setColor('#D4AF37');
    g.fillCircle(g.getWidth()/2,73,50);
      }
  
  
   g.drawImage(getImage(aleatorio),49,30);// Expected output: 1 or 2 
   chance=false;   
   toss();    
}, 2500);
    

  }
   volinit = false; 
}

function drawavdado()
{
 chance=true;
  roll();
 setInterval(rotar,100);
    
    setTimeout(function () {
       clearInterval();
      
      puntosale = getRandomIntInclusive(1,6);
      
    
      g.clearRect(0, 0, g.getHeight(),  139);
  g.drawImage(getImage(3),30,24);
      
        switch (puntosale) {
        case 1:
         g.setColor('#000000').fillCircle(86,77,9);  
        break;    
        case 2:
        g.setColor('#000000').fillCircle(68,63,9);
        g.setColor('#000000').fillCircle(104,98,9);    
        break;    
        case 3:
        g.setColor('#000000').fillCircle(65,55,9);
        g.setColor('#000000').fillCircle(86,77,9);
        g.setColor('#000000').fillCircle(108,100,9);
        break;
        case 4:
        g.setColor('#000000').fillCircle(65,55,9);
        g.setColor('#000000').fillCircle(107,55,9);
        g.setColor('#000000').fillCircle(65,100,9);
        g.setColor('#000000').fillCircle(107,100,9);
        break;
        case 5:
        g.setColor('#000000').fillCircle(65,55,9);
        g.setColor('#000000').fillCircle(107,55,9);
        g.setColor('#000000').fillCircle(86,77,9);
        g.setColor('#000000').fillCircle(65,100,9);
        g.setColor('#000000').fillCircle(107,100,9);
        break;
        case 6:
        g.setColor('#000000').fillCircle(65,55,9);
        g.setColor('#000000').fillCircle(65,77,9);
        g.setColor('#000000').fillCircle(65,100,9);
        g.setColor('#000000').fillCircle(107,55,9);
        g.setColor('#000000').fillCircle(107,77,9);
        g.setColor('#000000').fillCircle(107,100,9);
        break;
      }

       chance=false;
      roll();
}, 2000);
}

//##################### Inicia Volado



function chanceproc()
{


    if(chanceforma=='moneda'){
   
      
    inipinta();

    //Pinta rec de boton
    g.setColor('#06f77b').fillRect(g.getWidth()/2, 143, g.getWidth(),  g.getWidth());


    //Circulo concentrico externo moneda
    g.setColor('#000000').fillCircle(g.getWidth()/2,73,55);

    //Circulo concentrico interno moneda
    g.setColor('#c0c0c0').fillCircle(g.getWidth()/2,73,50);


    toss();

    //####### Inicio dibuja dado boton
    g.setColor('#000000');
    g.fillRect(117, 145,147, 173);

    g.setColor('#FFFFFF');
    g.fillRect(119, 147,145, 171);

    g.setColor('#000000');
    g.fillCircle(132,159,4);
    //####### Fin dibuja dado boton


    drawvolado();

    }//##### fin volado
  
  else if(chanceforma=='dado'){
    
     inipinta();      
           
     //Pinta rec de boton
    g.setColor('#06f77b').fillRect(0, 143, g.getWidth()/2,  g.getWidth());
    
    
    roll();
    
    //####### Inicio dibuja moneda boton
    
    //Circulo icono externo moneda
    g.setColor('#000000').fillCircle(43,159,15);
    
    //Circulo icono interno moneda
    g.setColor('#c0c0c0').fillCircle(43,159,12);
    
    //####### Fin dibuja moneda boton
    
    g.setFont("Vector",17); g.setColor('#000000'); g.drawString('2c',45,160);
    
      //Uno
    
      g.drawImage(getImage(3),30,24);
    
    
      g.setColor('#000000').fillCircle(86,77,9);
   
  
    }
  

}  

chanceproc();
