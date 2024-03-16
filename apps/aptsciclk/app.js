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

var pause = false; //set to true to pause any sort of drawing (except for quotes)

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

  else if (img == "potato"){
    return {
  width : 54, height : 55, bpp : 4,
  transparent : 6,
  buffer : require("heatshrink").decompress(atob("swAEsEGA4oASEQ4ARGgNgDa8QsA3BKStowxTDDalikxTCRKsSNwY2BDSYvDGoI2TsoTDgwEBGx5IBs1VHIgaBGx4qCDQZOBUiUGstQDQ4FBKYwHGDQNWDRA3BCYsABotgJ4dkogABowcGAAUGOwogDDAVCAYScKOooFBooWCAAjqNAoQYHKYQ8ELQZzFsAMCiIeJAAdFMwiCEoIaNoICBoAaMiMUDA0ikMiigaIAAgaGDIIaBkcyoCHEMxqIBmdEkMzmcxDSVBkYXBGoMzmUQDSMSDIURiIbBkDBCDRtBiYwBDIMREAMiDR6qBiI0BkQEBKQKkBUJQAEoCfBC4MVgMSDYMkGwQaBeBMUiC3BGYNN8kSHgM0DQrsGAAMQQAMyCwIaBgK/BmIaKM4IGCiMTDQXd9waCmlENZIaEgESKAMhpxQEDQSiEoJTGiEimaGCqIaBmKABUQwyBUIzRBkIXBDoI8BkAaDGwgaFEIMCeQUSYAKNBmLYDGwJ/DDYlFqAaBGwILBGgLyBUIRSFQghrCgEjDYMiiTdCggaFDYgaFKIKIBmcTkciiA1GNwpsFgI4BmZsBkVEDRAbJiBTCNQMABIIZHfBCPBDQKSCoFEGhA2IKIMQgJ1CoCFHGxVBeASQDgAZJDQ8RQIMyDQkGDZQ1GDILtBAwNGsAaLs1hokECYNCaQMxDIVmDRoOBDQifCBggaNKgMRqUhiovFGxoMEsCADAQQaMsUWJBi+LsMRqtWDSwUBqvFqpVFQ54UCstVqEGsDbBQx4lFgAABotRAgQABT54ADqtRM5jjQAAQ"))
    }
  }

  else if (img == "apetureWatch"){
   return {
  width : 176, height : 176, bpp : 4,
  transparent : 2,
  buffer : require("heatshrink").decompress(atob("kQA/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A+/4A/AH4A/AH4A/AD0RgAASgMQCqgrqiJX/K/5X/K/5XR7vQK/8IxBX/K/5X/K/5X/K/5X/K/5X/K/5X/K/5Xah////wK/5XTKwIABK4YAG//x7vRBhAA2jGIAYMfK4fxCRAOCK/5XFKwYABBgTBEh4LC7vQbabxLFYoVPFZMIxADBK4sAK4wLDK/5XSBYhX/K6MPBIQDBK/5XD+BXMBAQQCK/5XDKAJXKVwRWBAoJX/K4j3CUohXDL4YACK/5XF+CuEK4yuCK/5XHWAZOCK4cPKwhX/K45MFK4YAGK/5XGLApX/K6X/K5sPK/5XIWAZXJ/5X/K6sPK/5XPAoauDK/5XJ/5XDj5eEVwRX/K5y2FVwRX/K4/wK44GDVwRX/K50fWAi9DK/5XGUYRQCiKwCAwKuDK/5XGJgZXGMQJWDK/5XGAoKkCK4arEK/5XIVQRQDK/5XQAwZLC+BXBAwYACLwJX/K4auCWApXHCAJX/K5JYFAoi/Ch5X/K4ZHCAAZXEAoZnCK/5XLVQRXFBgZX/K4igCLAnxFYRdBBohX/K5cAiIrJK/5XEfIhX/K/5Xr+BX/K/5Xu/5X/K/5WKFhRXWl5XB+BX/K6ywFK9XxK4SMFK7JWCK58PK7sP/5XDGoxXr/5Xc//4xBXEHIKyPK54fFK5CPBK7cPxAyBK4oHBK7wKFK5AQBK7UP/GPD4JWCiMfK4IJBK7jOGFgYwEK4XRBg4AQ/CtFAAZXCBQ4AQjBXCCRxXcUoJLDjnMhnMBgTqCK7RzJYYxXC6DbTAAf4UYInB5gABK4PM4KBDdYwrQhBXBBQ5XIAAJXYh6GDKwRXDLASwCK7BxIK8auDjhXH5iwPK5gKIK8iuBKwhXFLAJX/AA0PxCuBKAhXG4KwCK/6uEx/xK5qwNK/KuBjhXL5kRWAJXrbapXEJ4pXH4JXXABRXhh+I+JXPiP//5X/K4WP+McJ4oLBLAxX/K5vAAQhX/ABBDBiJXFVgawFiMf//wK/4gBAAKuHWA/BCYQhIK8uIwACOK5CqFAohXxhGIxACMCAJX/K7YaEK4pKFK/6v/ABOIwACOK/4AMFZRXI4AEIV+wrO///iMcVRC0FiMf//wQaZXZhABCFZ0P//xK4qrCVwpXB/+PbahX15gLBVwpX/K5ERJwvMKw3BiP4K98AxGAFaH//5XPj/4+BXvFaRXCjhXMiMfxBXhGoIAcK4nxWAxXF4MR/GPK4Q4e+UiADcvK4UPWARXMj/4NwayKACUPK8KwDjhXKcQOIKYZX/eIkRLAhXEiKuBx5XEY4QAYDgJXiIAXxiJXH4KuC/4VDK/6wGLAZXCKwKuGK/6wIiMcK4QFBVw5X/WA2IwJSCAAYJBVwpX/WA2IJwJVDj///GPVwpX/LA34K4PxVoYHBKwxX/AAynCK4ZWC+BX/K5ixB/6vEVo5X/IxAABK4asHK/5XLgJXCBxRX/K/5XgLAQNLK/5X/K6r7CACxX/K/5XVfJcBiINLK/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K5o6bK/YaZK/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K6o6bK/cAABUBiINLK/5X/K/5X/K/5X/K/AMLACBX/K7DMaAAcRADA4eA=="))
    }
  }

  else if (img == "apetureWatchLight"){
   return {
  width : 176, height : 176, bpp : 4,
  transparent : 2,
  buffer : require("heatshrink").decompress(atob("kQA/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A+gAA/AH4A/AH4A/AD0R/4AS+MfCqgrqiJX/K/5X/K/5XR7vfK//4xBX/K/5X/K/5X/K/5X/K/5X/K/5X/K/5Xa+EAgEPK/5XTKwIABK4YAGgEB7vRBhAA2jGIAYMQK4cBCRAOCK/5XFKwYABBgTBE+ALC7vfbabxLFYoVPFZP4xADBK4v/K4wLDK/5XSBYhX/K6PwBIQDBK/5XDh5XMBAQQCK/5XDKAJXKVwRWBAoJX/K4j3CUohXDL4YACK/5XFh6uEK4yuCK/5XHWAZOCK4fwKwhX/K45MFK4YAGK/5XGLApX/K6UAK5vwK/5XIWAZXJgBX/K6vwK/5XPAoauDK/5XJgBXDiBeEVwRX/K5y2FVwRX/K48PK44GDVwRX/K50QWAi9DK/5XGUYRQCiKwCAwKuDK/5XGJgZXGMQJWDK/5XGAoKkCK4arEK/5XIVQRQDK/5XQAwZLCh5XBAwYACLwJX/K4auCWApXHCAJX/K5JYFAoi/C+BX/K4ZHCAAZXEAoZnCK/5XLVQRXFBgZX/K4igCLAkBFYRdBBohX/K5f/iIrJK/5XEfIhX/K/5Xrh5X/K/5XugBX/K/5WKFhRXWkBXBh5XvgJXCGgpXcWApXoF4KvD+COGK65WCK5/wK7gtCK4YmCLB5XfgBXbFgIzBK4mILCBXPDwpXIcIJXa+BPBKAJXFLARXdBQpXICAJXah/4x4qDAAMfK4IJBWBpXODgwsDAAcQK4XRBg4APgAwBVogADK4XwgInWjBXCCRxXbiD9BKwcc5kM5gNCRgXwK7JyJYYxXC77bTIwf4UYInB5gABK4PM4MRDQXwDpYrKawMABQ5XIAAJXYh6uDKwRXDLAQRDK64YIK8SuEjhXH5iwPK5gKIK8UP/APBKwhXFLAKwNK/ItBiJQEK43BDgRX/AAXw/GP+JXNGQXwK/5XDEgMcK5fMiIdBK9YAKK5cPK4RPFK4/BDoUPFagAJK8WI+JXPGYRX/IIWP+McJ4sAgBYGK/5XN4ACEK/4AH+AjCK4qsDWAsRDwIWCK/ogBAAKuHWA/BCYQhIK8uIx4COK5CqFAohXx/GIxACMCAJX/K7cAAAZXFBQkBK/6v/ABOIx4COK/4AMFZRXI4AEIV+wrN+AjCjiqIWgpUCCwRXr/ABCFZ0PBoJXFVYSuFK4P/x4VBK/5XI5kAgCuFK/5XIiJOF5hWG4MR/BXv/+Ix5XREgJXOj58BK94rR+AkCjhXMiMfxAUCK70AADpXE+KwGK4vBiP4x5XhgUiADcgEQTyCK5sf/ATDK/5DD+McK5UR/+IK/5XEeYcRLAhXEiKuBx4SDK/6wFiJXH4KuOK/SwELAZXCKwKuOK/ywBiMcK4QFBVwZX/K43/gACBxGBKQQADBIKuBh5X/K43/JAOIJwJVDIYP4x4NCK/5XHfAP4K4PxVoYHBBgRX/K5H/gCnCK4ZWDVxpX9LARABV4ZWQK/xYBgBXD+EAKx5X/AAMBK4RVQK/5ADK4RBSK/5YDIKZX/K/5XNfYQA1K/5X2eJkReKfxj4VTK/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5XvgAAYh5X8DTJX/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5XVgAAYK/orL+MRIKZX/K/5X/K/5X/K/5X/K/5XmgAAdiIA3"))
    }
  }
}


function drawStart(){
  g.clear();
  g.reset();
  let apSciLab;
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

function unPause(delay, quote){
  if (pause){
    setTimeout(function() {
      if (quote == undefined || quoteNum == quote){
        pause = false;
        draw();
      }
    }, delay);
  }
}

var quoteNum;

function quote(fontsize, width, height, specificQuote){
  pause = true;
  var finalString = "";
  var quotesFile;
  var finalFontSize;
  quotesFile = require("Storage").read("aptsciclkquotes.txt", 0, 0); //opens the quotes file
  //console.log(quotesFile);
  var quotes = quotesFile.split("^");
  var numQuotes = quotes.length;//number of quotes
  var curQuote;

  if (specificQuote == undefined){
    quoteNum = Math.round(Math.random()*numQuotes)-1;
  curQuote = quotes[quoteNum]; //quote to be displayed
  }
  else{
    quoteNum = specificQuote;
    curQuote = quotes[quoteNum];
  }

  unPause(10000, quoteNum);

  var curWords = curQuote.split(" "); //individual words
  //console.log(numQuotes);

  var maxChar = width/6/fontsize;
  var maxLines = height/10/fontsize;
  var curLines = 0;
  var curLength = 0;


  for (var i = 0; i < curWords.length; i++){
    //console.log(curLength+curWords[i].length);
    if (curLength + curWords[i].length <= maxChar){
      finalString += " "+curWords[i];
      curLength += curWords[i].length+1;
      //console.log("next");
    }
    else{
      //console.log("break");
      curLines++;
      if (curLines > maxLines){
        curLength = 0;
        finalString = "";
        i = -1;
        if (fontsize > 1){fontsize--;}
        maxChar = width/6/fontsize;
        maxLines = height/10/fontsize;
        console.log(maxLines);
        console.log(maxChar);

      }
      else{
        curLength = 0;
        finalString += "\n";
        i--;
      }
    }
    finalFontSize = fontsize;
  }


  //drawing actual stuff
  g.setColor(g.getBgColor());
  g.fillRect(10, 10+28, g.getWidth()-10,g.getWidth()-10);
  g.reset();
  g.setFont(font, finalFontSize);
  g.setFontAlign(0, 0);
  g.drawString(finalString, xyCenter, xyCenter+14);
  //quote length*pixels per character = pixel width
  //height ~120 width ~160
}

function buttonPressed(){
  if (curWarning < maxWarning) curWarning += 1;
  else curWarning = 0;
  g.reset();
  const buttonImg = getImg("butPress");
  g.drawImage(buttonImg, 0, 0);

  warningImg = getImg("w"+String(curWarning));
  g.drawImage(warningImg, 1, g.getWidth()-61);

  setTimeout(buttonUnpressed, 500);
}
function buttonUnpressed(){
  if (!pause){
    const buttonImg = getImg("butUnpress");
    g.drawImage(buttonImg, 0, 0);
  }
  else{
    setTimeout(buttonUnpressed, 500);
  }
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
  if (!pause){
    // get date
    var d = new Date();
    var da = d.toString().split(" ");

    g.reset(); // default draw styles
    //draw watchface
    let apSciWatch;
    if (g.theme.dark){apSciWatch = getImg("apetureWatch");}
    else {apSciWatch = getImg("apetureWatchLight");}
    g.drawImage(apSciWatch, xyCenter-apSciWatch.width/2, xyCenter-apSciWatch.height/2);

    const potato = getImg("potato");
    g.drawImage(potato, 118, 118);

    g.drawImage(warningImg, 1, g.getWidth()-61);//update warning

    // drawString centered
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
  }
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
  if (!pause && buttonX-buttonTolerance < e.x && e.x < buttonX+buttonTolerance && buttonY-buttonTolerance < e.y && e.y < buttonY+buttonTolerance){
    buttonPressed();
  }
  //Potato GLaDOS
  else if (!pause && 117 < e.x && e.x < 172 && 117 < e.y && e.y < 172){
    quote(2, 150, 140);
  }
  else{
    unPause(0);
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
