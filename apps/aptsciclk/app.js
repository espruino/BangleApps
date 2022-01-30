const big = g.getWidth()>200;
const timeFontSize = big?5:4;
const dateFontSize = big?3:2;
const gmtFontSize = 2;
const font = "6x8";

const xyCenter = g.getWidth() / 2;
const yposTime = xyCenter*0.73;
const yposDate = xyCenter*0.48;
const yposYear = xyCenter*1.8;

const buttonTolerance = 20;
const buttonX = 88;
const buttonY = 104;

function getImg(img){
  if (img == "w0"){//drink
    return {
  width : 60, height : 60, bpp : 1,
  buffer : require("heatshrink").decompress(atob("AB0//4AE4YGF/gOZFIQOD4EABwnwgEDBwf8g/4h4ODwYQBv4OC+AbDAIP+j/HAQIOC4Hwj4RBBwP8o8B/+PBwWOkEP/l/BwP4+JCB44OCj+Ih/+n4OB+PEoP38YOB/0YkUXGgIOB8cBi9f+IOCkEI+XvBwXigFG64OEg0/t4OEuP7BwkHx/PBwWigF8voOC+Uwg/ig4OCkMgv8QsIOB+cfSoOGLIUR/E/4ljBwPxx/B/0kO4UI/0P+J3C/HHVQOISoWEn+D/iPBBwIwC8IOCwcP84IBBwU4TAMHBwfAv+AcARBBgD3CBwX8gDnBBwfwewIODAgIABBwYHDB3oAEBwIHFByyDBABg"))
}
  }
  else if (img == "w1"){//cube dispenser
    return {
  width : 60, height : 60, bpp : 1,
  buffer : require("heatshrink").decompress(atob("AB0//4AE4YGF/gOI/3/+fvBwYEBnwO/By3APgN/O6IeBh4OF8AOcwADCBwX8g4dM/8fBwt774OE+/9Bwt/BxodH3oOcFgyVG8BhCBwX8hRwCBwXA0C6BBwc/w4OE41MBwtEo6VF84sE/1/54OLDo4sHHYxKHLIxoGO44AD/kAABo"))
    }
  }
  else if (img == "w2"){//acid
    return {
  width : 60, height : 60, bpp : 1,
  buffer : require("heatshrink").decompress(atob("AB0//4AE4YGF/gOF+IOGngOF8/D8YGD/wdBB4nv4fzAwf4BwOfGQd/4f7/+//+f74OB4PwHIJKDx8P/4BBBwP8BwIBBBwXvh+Hw5ZD+Pwnl/NAcegJOBBwfgj0fBwvhBxcPgYEBBwXw/F+FghIB84OC/BfBOYQOBk/w/0f4f4nkGgFgh0hwED4H4jOBuF8hk/v/Hzlnx/zFgQZBGYLCD4EHaIn8gAOF8EDBwn+dgQOK/8AN4IOD+EABww0BBwqGEBwIWBBwk8CwIODg/gv4OEv4OD+4OBBAIOBRYIFBh+PcAQdC+gOCDoN+h/vBwPP/wOB/wOBwJCBBwP2oa3BLALgBiA7BOwIvB/+DQoV/d4hPBBwQsB/wJB8ZoEAAZoDAAQOPRQIAM"))
    }
  }
  else if (img == "w3"){//turret
    return {
  width : 60, height : 60, bpp : 1,
  buffer : require("heatshrink").decompress(atob("AB0//4AE4YGF/gOi+IOGh4OF8AOF/UNBwthx4OE+0YBwtBh4OE6mQBwn7rEfBwl22IOE99gBwn99UzBwUc/+90YsC8HH+++n98n/+g0++2Z+4OB4Fz73T74OCg877d8/YdC+d7u/v3gsBjEvt/+O4X+gvtIgI7CwG934OD8E326kD/0A+yzEwEO74OD/EArYOEgEDv4OD+PAl4OEnkBaInz0EPBwk3iAdE+XwSIYDBj2Oj4OD/fYvIOEvdHz4OD99unIOD/vt44OE3u4Dou3h4OE+3x/IOE70/Bwn78/9Bwl4LAQ7Dx75DBwP4Awb+EBwgAEBz0AABo="))
    }
  }
  else if (img == "w4"){//falling cube
    return {
  width : 60, height : 60, bpp : 1,
  buffer : require("heatshrink").decompress(atob("AB0//4AE4YGF/gOC+YOF/0PBwvgv4OE/kFBwvAyIdFnYeBBwYeDDofng4OE8vYDonx7uPBwkf/+/Bwfh+czBwf+g/5z4OD+FevIdEhMDDon/0E3BwgeBJQgeB+5ZFvAEBBwfzgYOEw/XLInwn3BBwf8gH4LYIOCwUHDonwmE4HYkHwKkE8P4XYQOCv7dCYQkBWYsAWYvAiAsE/EDJQn/wF+CwJZDg/gBwgrBXYIOC8D+FNAL+F4eDBwn4nh2BBweHFYJ3EFYQOC/0P/AOECgIOE/E/BwsHBwvACAIODWAQOEJAIOFAgIOEQ4QsEAAOfBwoACBwgACBw8AABo"))
}
  }
  else if (img == "w5"){//ball
    return {
  width : 60, height : 60, bpp : 1,
  buffer : require("heatshrink").decompress(atob("AB0//4AE4YGF/gOiv4OF8YOFAgQOEyYdGBw3zBw0BBwv4j4OB+EAgOD84OE+/ev4dD/3+BwvcugsE/u7t0f4aRC7e2sF8Bwlxg4dEu8YBwYsB/HDHYsMngOB8EDweHDon//PADoYABz0PBwfwnJKE/0OjZZC/kB4Hxz4OCwEYh+wBwXwgeA/+HBwUP8EP/0/BwPj/0DCQIOB/l/4DQBw4OBDIMPUoJKB+H/wY+B44OBj/4CoJKC+P/g7+FBAL+Fj4OFbwIOEI4IOF8YO6JQwAEaIgORgAANA"))
    }
  }
  else if (img == "w6"){//ball recviver
    return {
  width : 60, height : 60, bpp : 1,
  buffer : require("heatshrink").decompress(atob("AB0//4AE4YGF/gOR/YOG34Ob/e7Bwu7CwQOhGgQOD34OF/0LBwvfv4dMuPfBwn29oOFtwONDowsHHY3+h7CNj4OF+IOc4A7NDo7gGJQ4ACBwX+//vBwnvBAIOK8EH/kBBwd+v/PSwIOB/fnjiWBBwXesHPLQIOB/2AgEvBwfgh0AFgf8gAuBLKQObgAANA=="))
    }
  }
  else if (img == "w7"){//falling portals
    return {
  width : 60, height : 60, bpp : 1,
  buffer : require("heatshrink").decompress(atob("AB0//4AE4YFE/H8BwtvBwvvvgOE/33Bwvf3gOE/v7Bxn5Bw2fHYv7/oOF3/cB118JQQOC4ODJQn8jEfLInBjBoE/0jO4pjD953CwCVF/EH5//+ykCwA8Cp4OB/MDz4DBEQUYjPzaIfn5k/74xC/l44f+BwePz1595ADDYPvv7vDMAN3Bwf4CAIOE4//BYIOB/0On47E8AFCBwcPTwYOCAgPAgE8Bwf8gEDBwOAGIJZDBwX9DofhUYRKDKIIOEAAQOD8EABwgcB+IODnoKB84OD37tCBwUzZ4QODZ4QdDnIFB/YODZwP+v47DJIIBBJQcAAwZyBABoA=="))
    }
  }
  else if (img == "w8"){//flying portals
    return {
  width : 60, height : 60, bpp : 1,
  buffer : require("heatshrink").decompress(atob("AB0//4AE4YFE/H8BwtvBwvvvgOE/33Bwvf3gdF/YOF/4OF/IOGgA7F8ENBwn8gHcBw/5AoOAg4OCh4sD/vD+AFB45KBBwfwv//BwMJgEIFAXcnvggF4kEBBwPMSIIYBz/8nAEBw5ZD4IhBO48AhpoG953FSo/2Ugv/p4OF/LCGaIyIBB34OH4EAngODbAMDBwnfDoqeCBy7RBBwnh//xBwc9BQPnBwe/AYO/BwUzFYQODGgYOCnIFB/YOD57WBv47Dj//AIJKDgAGDOQIANA"))
    }
  }
  else if (img == "w9"){//cake
    return {
  width : 60, height : 60, bpp : 1,
  buffer : require("heatshrink").decompress(atob("AB0//4AE4YGF/gOY/oOG94OF/1/Bwv3FgwKCBwfnFhn8HY0LAQPwvgOB8EP/5uBBwP2gF4j+PBwP+sEEj/x44OB90Ao/8Dodwg8/nkH4ZXBgHnx8ABwPv/k98+ABwZEB+EAJQPj/3+nkAv4OB5+fz0Aj4OB98Ag+Ah/nBwJXB4EDHYSTB/EA/wsCSoJfBwAODNIPgBwgcBHYQOCC4QODn8Ah4ODGgMH+47D8EB/A7KTYMf4A7Eg/wHYgcBHZx3DcAPggbRBFgQcBcAQOB/iUBBwgcBBwgcCd4V/HYL+D/YOBDgIOC8/+DgIOC/+HfwIOD/4cCBwYAEBwQADBz0AABoA="))
    }
  }
  else if (img == "butPress"){
    return {
  width : 176, height : 176, bpp : 4,
  transparent : 1,
  buffer : require("heatshrink").decompress(atob("iIA/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AFEc5kM5hD/ACXMAAJXB5nBI35WSK4ZY/AB8cK4/MJP5WRK4pY/ABhPD5e7he7A4fBJn5XNKwJXCLAZX/ABUcKwhXDLAZN/VxhSCK4m8WH5XNVwZXEWARX/ABEcK4sAgBYDXYRP/K5RQC2ACE3e8K/5XPVgYDCK/4AKJIPLVYoEEBoPBIWPd6ICPK46uDAohXzjvd7oCMCAJX/K7cAAAZXFBQkBK/6v/ABPd6ICPK/4AaK4mwKwYEDV+4ARjhKBVQoDD3gMBK2MdAIRXXVYSuDK/5XN5ZRCgEAWQYLBK/4AJK4u7KwZXC4JXxiPd6JXV5hXH3hX1ACscWApXDMQRN/WBpYCK4QICV35XOLARXBA4ZX/ABccKAfMhgFEJf5YRK4hJ/ABxXH4JI/LCRXCK34ASjhXCIf4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/ACIA=="))
    }
  }
  else if (img == "butUnpress"){
    return {
  width : 176, height : 176, bpp : 4,
  transparent : 1,
  buffer : require("heatshrink").decompress(atob("iIA/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AFEc5kM5hD/ACXMAAJXB5nBI35WSK4ZY/AB8cK4/MJP5WRK4pY/ABhQEK43BJn5X/AEMcK5fMJv6uPK46w/K/4AgjhPFgEALAxP/K5vAAQhX/K6KsDWApP/AA6uHWA/BIWOIwICPK46qFAohXxjGIxACMCAJX/K7cAAAZXFBQkBK/6v/ABOIwICPK/4AaKInAAhCv2ACMcVRC0FK2MYAIRXXVYSuFK/5XO5kAgCuFK/4AJJwvMKw3BK+MRxGBK/4ArjhXMJv6wQK4qu/K/4AjjhXKJf5YRK4hJ/ABxXH4JI/LCRXCK34ASjhXCIf4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/ACI="))
    }
  }

  else if (img == "apetureLaboratories"){
    return {
  width : 173, height : 43, bpp : 4,
  transparent : 0,
  buffer : require("heatshrink").decompress(atob("AA+IAAeAIv5UTK34APhABBKwpeBJX5VLJgJWGAwKv/ABL8EKomABIYA/KpJWHAoRW/KpZQCfwJSCAgRW/KphWFBgZW/KphNCAgSxEKP4ADJAatFKwWAL4oA/KpALGXQhS/Ko4MIwAOMAHREOKv5ZVVgcAh///4LDAwQAB+AIHCQYHMDQQYBDwQEGDIoaGTx4MCwAiCJgYhFBIYIHLw4HFBARjGESJUDehZVFVhJNLRI5VGDIIdEAgwiL+DzDJAJVJB4IMBCoKsHAYpFCDgr2IApYEIBpJFCKpqsCHgQbFIhBVHBhJoGTwyBRKp5mBDoY6GKoYqEXYg7JApKeHQJysEKpRmBDoasHQBAACM4qMGEAr0JAgZjGFYhVPgGAEIpVEAAaAEA4oyEW4qyKFZBoFKoisDJIJWLfIp3IQBJeJfgysMERpVCwEIVpijFBA6ZJdA4JHJYgEKQIx1EVgRVBVhj5IEIyZHHYoUGNw4MCQIwIKAARVDxBVRQo6ZJHZZoGU4yBGBAiBGVgRZBVhYlIfJBoFHZZoHfJRwGBAQrEVISvCKpwrEUZAqFVhzYKB4yKGQIpVDAYJVKEoYFDBIpVIb4ysMIgoPHOgoRFhGAVwKsLAFzQHACBVCVhQA/KpawBCJa76IhRWDVxIODAwTaFAocP///dhALGBQYJBCIYQBDYgKEBBAEDVgeIAgKgFBYZVEEYY+CH4YDBBgYFBBYoFEOYhmEDYgFFLIwEDKw2AKwhTFBoSsHIgglFAQo/HKIoDECBBZGc46eEAYa2EKox2Ga5LjLDoq8FKAgVDBAv/EghWGVgRWJKoaOFD4IgCViAWFVjKTGJIZOFKpKOHAQj3JAogCFPApcGKQziGLopKCU4hWFKojsEHYrXFCAJFId45CEDYh4EB4Y1DCYSzFJQT+FgAGCKooA/AAZMBfopWDKv5WLVgxT/AB+AKopW/ACBU/ABwA=="))
    }
  }

else if (img == "apetureLaboratoriesLight"){
    return {
  width : 173, height : 43, bpp : 4,
  transparent : 1,
  buffer : require("heatshrink").decompress(atob("iIAGxAADwINHAH5ULK34APjABBKwpeBJX5VLJgJWGAwKv/ABL8EKomBBIYA/KpJWHAoRW/KpZQCfwJSCAgRW/KphWFBgZW/KphNCAgSxEKP4ADJAatFKwWBL4oA/KpALGXQhS/Ko4MIwIOMAHREOKv5ZVVgcRiEAgALDAwQABgIIHCQYHMDQQYBDwQEGDIoaGTx4MCwIiCJgYhFBIYIHLw4HFBARjGESJUDehZVFVhJNLRI5VGDIIdEAgwiLgLzDJAJVJB4IMBCoKsHAYpFCDgr2IApYEIBpJFCKpqsCHgQbFIhBVHBhJoGTwyBRKp5mBDoY6GKoYqEXYg7JApKeHQJysEKpRmBDoasHQBAACM4qMGEAr0JAgZjGFYhVPiOBEIpVEAAaAEA4oyEW4qyKFZBoFKoisDJIJWLfIp3IQBJeJfgysMERpVCwMYVpijFBA6ZJdA4JHJYgEKQIx1EVgRVBVhj5IEIyZHHYoUGNw4MCQIwIKAARVDxBVRQo6ZJHZZoGU4yBGBAiBGVgRZBVhYlIfJBoFHZZoHfJRwGBAQrEVISvCKpwrEUZAqFVhzYKB4yKGQIpVDAYJVKEoYFDBIpVIb4ysMIgoPHOgoRFjGBVwKsLAFzQHACBVCVhQA/KpawBCJa76IhRWDVxIODAwTaFAocQgEAdhALGBQYJBCIYQBDYgKEBBAEDVgeIAgKgFBYZVEEYY+CH4YDBBgYFBBYoFEOYhmEDYgFFLIwEDKw2BKwhTFBoSsHIgglFAQo/HKIoDECBBZGc46eEAYa2EKox2Ga5LjLDoq8FKAgVDBAsAEghWGVgRWJKoaOFD4IgCViAWFVjKTGJIZOFKpKOHAQj3JAogCFPApcGKQziGLopKCU4hWFKojsEHYrXFCAJFId45CEDYh4EB4Y1DCYSzFJQT+FiIGCKooA/AAZMBfopWDKv5WLVgxT/AB+BKopW/ACBU/ABsQA="))
    }
  }

  else if (img == "apetureWatch"){
   return {
  width : 176, height : 176, bpp : 4,
  transparent : 2,
  buffer : require("heatshrink").decompress(atob("kQA/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A+/4A/AH4A/AH4A/AD0RkQASkMSCqgrqiJX/K/5X/K/5XR7vQgAAHgMQBRAAKgMRCqgrJhGIK/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K7Uv///+RX/K6ZWBAAJXDAA3/+Pd6IMIAG0YxADBj5XD+ISIBwRX/K4pWDAAIMCXQQABl4LC7vQbabxLiIVUFZMIxBJBK4siK4wLDK/5XSBYhX/K6MvBIQDBK/5XD+RXMBAQQCK/5XDKAJXKVwRWBAoJX/K4j3CUohXDL4YACK/5XF+SuEK4yuCK/5XHWAZOCK4cvKwhX/K45MFK4YAGK/5XGLApX/K6X/K5svK/5XIWAZXJ/5X/K6svK/5XPAoauDK/5XJ/5XDj5eEVwRX/K5y2FVwRX/K4/yK44GDVwRX/K50fWAi9DK/5XGUYRQCiKwCAwKuDK/5XGJgZXGMQJWDK/5XGKQKkCK4arEK/5XIVQRQDK/5XQKwIABJYXyK4IGDAAReBK/5XDVwSwFK44QBK/5XJLAoFEX4UvK/5XDI4QADK4gFDM4RX/K5aqCK4oMDK/5XEUARYE+JXCLoINEK/5XLkURK4QAGK/5XEfIhX/K/5Xr+RX/K/5Xu/5X/K/5WKAAJXfl5XB+RX/K6ywFK9XxK4XwK7xWCK58vK7sP/5XDGoJXw/5Xc//4xBXEHIKyPK5/yK5svK7kPxAyBK4oHBK7xOFK5AQBK7UP/GPD4JWCiMfK4IJBK7iuFK4QAFj5XC6IMHACH4VooADK4QKHACEYK4QSOK7ilBJYcc5kM5gMCdQRXaOZK3FkRXC6DbTAAf4UYInB5gABK4PM4KBD+AcLFZUIK4JNGkRXIAAJXYh6GDKwRXDLASwCK7HyK9auDjhXH5iwPK5hMIK8iuBKwhXFLAJX/AA0PxCuBKAhXG4KwCK/6uEx/xK5qwNK/KuBjhXL5kRWAJXrABUhiQMKK4RPFK4/BK4PyFaxXql+I+JXPiP//5X/K4WP+McJ4roBLAxX/K5vAAQhX/ABBDBiJXFVgawFiMf//yK/4gBAAKuHWA/BCYQhIK8uIwQCOK5CqFAohXxlGIxACMCAJX/K7cAAAZXFBQkBK/6v/ABOIwQCOK/4AMFZRXI4AEIV+wrO///iMcVRC0FiMf//yQaZXZlABCFZ0v//xK4qrCVwpXB/+PbahX15kAgCuFK/5XIiJOF5hWG4MR/BXvkWIwQrQ///K58f/HyK94rSK4UcK5kRj+IK8I1BADhXE+KwGK4vBiP4x5XhEJQASl4DDWARXMj/4NwZX/WAkcK5TiBxA0LK/awBLAhXEiKuBx5X/K4svWAURK4/BVwX/ERZX5WAhYDK4RWBVxxX7WAkRjhXCAoKuPK/awCxGBKQQADBIKuNK/iwBxBOBKocf//4x6uNK/gHB/BXB+KtDA4JWOK/siU4RXDKwQwPK/oJB/6vEVp5X/AARXDFqRX/IAJXCESRX/K/5XYLAQiTK/5X/K5r7CAGpX/K+zxMiIiTkMSCqZX/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K9//ADA4HV/4APK/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K6v/ADCv/ABMhiIiTK/5X/K/5X/K/5X/K/5X/K83/ADsRAG4A="))
    }
  }

  else if (img == "apetureWatchLight"){
   return {
  width : 176, height : 176, bpp : 4,
  transparent : 2,
  buffer : require("heatshrink").decompress(atob("kQA/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A+gAA/AH4A/AH4A/AD0RkQASkMSCqgrqiJX/K/5X/K/5XR7vf/4AH+MfBRAAK+MRCqgrJ/GIK/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K7UggEAgRX/K6ZWBAAJXDAA0AgPd6IMIAG0YxADBiBXDgISIBwRX/K4pWDAAIMCXQQABkALC7vfbabxLiIVUFZP4xBJBK4siK4wLDK/5XSBYhX/K6MgBIQDBK/5XDgRXMBAQQCK/5XDKAJXKVwRWBAoJX/K4j3CUohXDL4YACK/5XFgSuEK4yuCK/5XHWAZOCK4cgKwhX/K45MFK4YAGK/5XGLApX/K6UAK5sgK/5XIWAZXJgBX/K6sgK/5XPAoauDK/5XJgBXDiBeEVwRX/K5y2FVwRX/K48CK44GDVwRX/K50QWAi9DK/5XGUYRQCiKwCAwKuDK/5XGJgZXGMQJWDK/5XGKQKkCK4arEK/5XIVQRQDK/5XQKwIABJYUCK4IGDAAReBK/5XDVwSwFK44QBK/5XJLAoFEX4UgK/5XDI4QADK4gFDM4RX/K5aqCK4oMDK/5XEUARYEgJXCLoINEK/5XLkURK4QAGK/5XEfIhX/K/5XrgRX/K/5XugBX/K/5WKAAJXfkBXBgRXvgJXCh5XhWApXoF4KvD+EALKBXMKwRXPkBXcgAUCK4QFB+BYPK78AK7ZWBGYJXExBYQK58CK5sgK7fwJ4JQBK4pYCK7pOFK5AQBK7UP/GPAgJWCiMfK4IJBWBpXOVwpXCAAsQK4XRBg4APgAwBVogADK4XwgInWjBXCCRxXbiD9BKwcc5kM5gNCS4XwK7JyJW4siK4XfbaZGD/CjBE4PMAAJXB5nBiIaC+AdLFZTWBgBNGkRXIAAJXYh6uDKwRXDLAQRDK68CK9SuEjhXH5iwPK5hMIK8UP/APBKwhXFLAKwNK/OIVwJQEK43BDgRX/AAXw/GP+JXNWAXwK/5XDVwMcK5fMiIdBK9YAKkMSBZMPK4RPFK4/BJIUCFagAJK8WI+JXPiJX/K4mP+McJ4sAgBYGK/5XN4ACEK/4AHkBDBiJXFVgawFiMf//wK/4gBAAKuHWA/BCYQhIK8uIwQCOK5CqFAohXxlGIxACMCAJX/K7cAAAZXFBQkBK/6v/ABOIwQCOK/4AMFZRXI4AEIV+wrNkH//8RjiqIWgsRj//+CDTK7MoAIQrOh//+JXFVYSuFK4P/x8CK/5XJ5kAgCuFK/5XIiJOF5hWG4MR/BXvkWIwRXR/5XPj/4/5XvFaMgK4UcK5kRj+I+ArVK5UAADpXE+KwGK4vBiP4x5XhaBIATkADCh6wCK5kf/H/GpRX7+McK5UR/+IK/5XEkBXBWAJYEK4kRVwOP+AiKK/CwEiJXH4KuOK/SwELAZXCKwKuOK/ywBiMcK4QFBVwZX/K40igBXBxGBKQQADBIKuBGZhX6kUPJoJOBKocf//4x//GRpX7kBOBK4PxVoYHB//wERpX7kUAU4RXDKwYxOK/hYC/6vEKyBX+LAMAK4fwgAvQK/wABgJXCFqRX/IAJXCESRX/LAYiTK/5X/K5r7CAGpX/K+zxMiIiTkMSCqZX/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K98AADA4HV/4APK/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K6sAADCv/ABMhiIiTK/5X/K/5X/K/5X/K/5X/K80AADsRAG4A=="))
    }
  }
}


function drawStart(){
  g.clear();
  g.reset();
  if (g.theme.dark){apSciLab = getImg("apetureLaboratories");}
  else {apSciLab = getImg("apetureLaboratoriesLight");}
  g.drawImage(apSciLab, xyCenter-apSciLab.width/2, xyCenter-apSciLab.height/2);
}

// Check settings for what type our clock should be
var is12Hour = (require("Storage").readJSON("setting.json",1)||{})["12hour"];

// timeout used to update every minute
var drawTimeout;

//warnings
var maxWarning = 9;
var curWarning = Math.floor(Math.random() * (maxWarning+1));

function buttonPressed(){
  if (curWarning < maxWarning) curWarning += 1;
  else curWarning = 0;
  g.reset();
  buttonImg = getImg("butPress");
  g.drawImage(buttonImg, 0, 0);

  warningImg = getImg("w"+String(curWarning));
  g.drawImage(warningImg, 1, g.getWidth()-61);

  setTimeout(buttonUnpressed, 500);
}
function buttonUnpressed(){
  buttonImg = getImg("butUnpress");
  g.drawImage(buttonImg, 0, 0);
}

// schedule a draw for the next minute
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
}


function draw() {
  // get date
  var d = new Date();
  var da = d.toString().split(" ");

  g.reset(); // default draw styles
  //draw watchface
  if (g.theme.dark){apSciWatch = getImg("apetureWatch");}
  else {apSciWatch = getImg("apetureWatchLight");}
  g.drawImage(apSciWatch, xyCenter-apSciWatch.width/2, xyCenter-apSciWatch.height/2);

  // drawSting centered
  g.setFontAlign(0, 0);

  // draw time
  var time = da[4].substr(0, 5).split(":");
  var hours = time[0],
    minutes = time[1];
  var meridian = "";
  if (is12Hour) {
    hours = parseInt(hours,10);
    meridian = "AM";
    if (hours == 0) {
      hours = 12;
      meridian = "AM";
    } else if (hours >= 12) {
      meridian = "PM";
      if (hours>12) hours -= 12;
    }
    hours = (" "+hours).substr(-2);
  }

  g.setFont(font, timeFontSize);
  g.drawString(`${hours}:${minutes}`, xyCenter+2, yposTime, false);
  g.setFont(font, gmtFontSize);
  g.drawString(meridian, xyCenter + 102, yposTime + 10, true);

  // draw Day, name of month, Date
  var date = [da[0], da[1], da[2]].join(" ");
  g.setFont(font, dateFontSize);
  g.drawString(String(date), xyCenter, yposDate, false);


  // draw year
  g.setFont(font, dateFontSize);
  g.drawString(d.getFullYear(), xyCenter+1, yposYear, true);

  queueDraw();
}


// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower',on=>{
  if (on) {
    draw(); // draw immediately, queue redraw
  } else { // stop draw timer
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
});

Bangle.on('touch',(n,e)=>{
  //button is 88 104
  if (buttonX-buttonTolerance < e.x && e.x < buttonX+buttonTolerance && buttonY-buttonTolerance < e.y && e.y < buttonY+buttonTolerance){
  buttonPressed();
  }
});

//show Apeture laboritories
drawStart();

setTimeout(function() {
    // clean app screen
    g.clear();
    // Show launcher when button pressed
    Bangle.setUI("clock");
    Bangle.loadWidgets();
    Bangle.drawWidgets();
    //update warning image
    buttonPressed();
    // draw now
    draw();
  }, 500);
