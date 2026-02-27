const storage = require('Storage');

require("Font6x12").add(Graphics);
require("Font8x12").add(Graphics);
require("Font7x11Numeric7Seg").add(Graphics);

// Meeseeks face sprites - stored as base64 strings (decompressed on demand to save memory)
var meeseeksSprites = {
    face1: {
      width : 117, height : 104, bpp : 4,
      transparent : 0,
      palette : new Uint16Array([65535,24579,24580,22531,65399,192,1,22532,22530,47112,39904,20482,0,9,45952,8]),
      buffer : require("heatshrink").decompress(atob("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"))
    },
    face2: {
      width : 115, height : 111, bpp : 4,
      transparent : 0,
      palette : new Uint16Array([65535,24579,65534,65532,65502,6368,24580,22531,10,0,22532,29280,27232,1,9,65435]),
      buffer : require("heatshrink").decompress(atob("AH4A/AH4A/AH4A/AH4A/AH4AShGABzY4bxAOOHMwoRxBJNHFKDPVMoAF93gHEMOLyntHMMOESpzhHCw5B6DjzVolQHGznfHDI5BOTo4Zfy4A/AH4A/AH4A/AH4A/AH4A/AC8FqvuGFuIwAHFzuZzve6A3q93e9vtqA4ErNd7vdHNVd71d9vdHIfd7kMzPZHNXu647BNII5C93VgcFrKtBHFEO6sCkA5BF4UO7uyn+1OQPuHE8NcINEguZHIfd65yBzOd7vgHM/e6twhdZyrcChvdqvFrNZOVXd6tXM4IBBOQXdrOZzJCBOVPd7ItByudOQMJyo3BHQOdWoQAlh3dzNdGQRyC9vZG4JBBHFAvBN4I4DuAJCAwIICPYKsoOQNdUQIvDPgOZ7PdqA4oF4IADyAJD7OdBAI4qgGV7wvBUItVyvVHFatB73ubVIA/AH4A/AH4A/AH4Ak7Xu93qxXgGl0I93d73e9Xa9XuAoIGBG1MFzvt9Xn7Vau+q09XAYOt1vt92KG8vd9ta7QzB1QCBvQEBu45BBAVe9vpN0Xe7vXFwIAKvV6u+nu9d73QHD9d9uuNIIuBNwI2Fi8XBgIOCvWq9Xl0AdCxBwZrqaBGAenFoURiMXuIDBiK1CuMXHIOlfAIeBhA5UCgcN87fCHAWqUIUXGoQACi0R0IFCHoNn1vtHKoTEryoBOIl2s6kBGwhzCu1204MBuOqsN60vlqAlBwBxVvvnVQZmCszaCHQKjBHYS5DAQQKBjWl1pfC8A4U9ulHAOnMoUWUAI+COAg4CW4OmAAOqCgI5B7oiBxw4RQoXacQOqtRwDHIMWGgVxWwdxi12BgNms1hCgTHB6pgFABkOQgVeDQJbBjQlCsMRAIMWsMXHAayBB4IQCG4QGB1Wt6DmRHAdd7WniOhiNnEYSrBHIMRi45BVQZBBJQoUBs967zmCOR/uHgSpBFQOhuwhBE4IACGggzBWII3DAAQGBixyBLwQCCOR8FcYOni9h0NntQuCVAI4GGwSCCB4KECsOn1XlqAoBOR7kDOQNxGAOhOAyrBu43DAAMXuNxuzzBiI/BjQ5B9pyRVYRyBMgMXs9htUas2mdgQ3Bq5xEAAIVBAAMaJANmjV6coJyRhBJCrQhCi2h0JbBix5BLoN1urvBAAll0ulRYI0B01qvWncqeOAQMN844B1TiBs9xMYet9Xe72qGwWGs2OBAPt9XaHYI5B1Wu7QlBxByS891HAVh042CNwItB92gDY8O13q9xGC1Q+B7AoCwByRgvVu9xbgLdBu9a7pbBGxAAFHQPtxwDB9xFCVZ5yDh3au7MBG4NVrvu9QdOAAeKxHqEYUNHB68E7zLC1Wt7vu1w3SW4/VCSCsCgCMB13tNwPQG7I4B9ISQhDBCgGoxHu1DeOS5rnDHKC+QESOIxyOTHMWIxDAV7wwYKD0O93tRSY4CwCLffgIAB9A4zHYY4JhyiHHEgALhAxFAwI3uNYYACx3uHGQ6Dxw30AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/ADg"))
    },
    face3: {
      width : 125, height : 99, bpp : 4,
      transparent : 0,
      palette : new Uint16Array([65535,22531,65400,0,24579,160,24580,8,4,32,9,27264,5,3,2,1]),
      buffer : require("heatshrink").decompress(atob("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"))
    },
    face4: {
      width : 106, height : 85, bpp : 4,
      transparent : 0,
      palette : new Uint16Array([65535,2,65534,65533,65340,23008,65437,37664,8416,5,31264,0,14528,9,32,12736]),
      buffer : require("heatshrink").decompress(atob("AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A2zIAB8AqmjPu9GQBAkBj3hjMe+EA6EN6AzghOR93uzoIDhGR9GO8MR98A7sJGkORjG+90RSoY9BqEP30Rzw0BNYJogiNQhhqB9wJDjkCkGLiMRGgQBBADUNyENgHZFQMw9BrBiByCjlCkG4jERiHd6A0eDwPZ35fB9w0BwA0CjeghmL3eLGgIVCGjZTCzMbuyeB3Y0D3e+3g9C32wNMGdNIMRxnO8O+3ewBoMRjcb33rboJnBGkOZiJhB92O8LTCBIXr2Ph8I0g6A0EGYPuFQINCyIKBwMRiMAGQPQab2QhI0CAAPoBoUJH4IzC94wbGg3QGgMbGYPhjAODzI1BBgPwGj6JBGwKfCAAMZwANDhPZzMZjgzgXwiVBAAQPGzPMGcKkGGZAA/AH4A/AH4A/AH4A/ADndGmnQGn4Anho00alsBGmcJyDUFTFo0zNIcNAQOZGmBmCGmXQgEbT2OQh2RGmEJzOJGmMNzOZiA0xzgztGgnd6AztMoI007o0CGdwxEGmWQhudGmHZzPZaV41DTuIA/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4AhA=="))
    },
    face5: {
      width : 111, height : 99, bpp : 4,
      transparent : 0,
      palette : new Uint16Array([65535,24579,65503,22531,61343,7,24580,6,160,47112,9,5,8,10,4,3]),
      buffer : require("heatshrink").decompress(atob("AH4A/AH4A/AH4A/AH4A/AH4A/hva1va7vQGt8K1Xa03atpsy6EM1nK1Rvw7sK4t3u915Xd7o3vqu+mAGDOEIiB1XK5gMI7SuGG8EN1orB1XM1otG6wWH5nATsmtLwjVKqo3kSyPsb8BwF6EFCBq4FG8SiJQAhulVIYOMhQ2mMB5uh7poFNxrZj1WtAwesAgeAhGP/EwA4UOgHMHEOq0oECgtwAgUIxGO9e73wHB/fwhmgG8MG096GIP4GwmL/2+u9Vvd3vBuj2tT3d84o2Bh++v42B/83rnF4tVq8AhlQGr4uB/3v/d8FIMAutX32DweACQcD0EN6AzchkA6EI90///4mAMD4uwCw7uB7o2cguw8sA90EgeIx4WOqBue98IuH+8EgnGIxwWNGwJudh+A/cO/8wGwOP8AND1QWH46legH4h+z///xAAB/wMDTRHFIJJuW+HnnA2D/+wG5d8uEKbjsAu8M1mI/H4GwP/hVwG4d/Cgl1qEH0A2dgBWB4Y3C//vhlXBocHu93mEAgvF4EAAIIAghGPNgP7gFaBgus1Wq5lcqEKNr4AEvfv/EA5jOH7vaqEAhWtGsUN7oECrRgLgoRDAEHd1kAh98GxfKNsY3C4u7rg2L1SxHAD0Mq+wBxfaGsoA/AH4AJxGAEL8IxGO3YAF2973/4nAUG/3AGjna4/vxGI+f/n//AAQGC/GP/dc6A3E2+gNDM3utVrc+n8zweDAYIAGBQP//d8GIcHq43XMwP+907nc3mc4mcxGo44Dmfz9ZxDgtVU50NGo+InE/MwM2scziMTGxQAC8c//0wN4V1N5sN7oFDg/o/CaEsw2BmI3BAII6N/+4EIMMqo2N7QFDrfvTgIAFm02iIABHQIACG5foEQMK542LhXMAgV13fj+Y1GNwNhGYY4BcYoHBi1mG4eDEgPauA3Ldgf+9wiETQQrBsY2BUYIACBoKsBV4cWAwcz9/wEoPV2A2Ku9QVAPvNYhhCAYM2G4MWG4oADG4R8Ei1jn3gFQNXGxUOIYMNn0/NooADi0xAAM2NIYAEmxDBAILqCs0+/0wE4NbG5Xub4N7NgpZCNoUTsYHBAgNhAAJBCAgMWG4axCeYP+UwSZBABGrdQNfwY3DAAJkBmw3BAQQmBIgJzDNgTaCJgJBBYAU/3orBqo2Jht1gEHGweDnEzcQgACLwIIGJAI2BNgI3CCQI3B/3QgEFNxXXboPoxH4////GIAAWPHgKwDIoQADAwJyBAQI1BW4MxHoM//YrBuo6BNxFXgEIxH//273w3DAYP/+Z0DHoUxs0TweBIIQxBOAgCBnBfBg9dNxPc2wDBhE6sALEgeD/++9e3m6vCi2ZzOWyJ5DGIQABsw7BiymBD4O1NxMA4oLKAAXG6t79/zwNpGwIAByM4VAIwCAAsTn/ggELNxUFvg3NgGqq/v/9mG4mWVALWCUoQCDn+ObphDButeG5qsBre1G47cGHgc4NwMH5olKhHr9167o4Nhd80tWHAeWnDeCAAIzBHQU4xAXBrlgG5e7uvKVJw4Bnk8OIbfBmcRicxmMzm02mcz/GAgGsExsNNpwTE6+2G4SmCNwQ6Bs1jmf/+EAhVaE6IAQ4fHm1py0YG4szs07/7cBgFVG0S9ButT4ymCU4JuCAoJtCgF3qA3jgEM4ezmeDwYyBAAWD/+DB4W7G0gABr3/FwI1DnA2B2A2CrY2mVII3Bx+IAAX4/8wGwXFHYQAmweO/w6BAQKjCAAPF0A2oAAXj2dz2YIEq/AG1axI242Y/A2b9bbYr3wGzNcq/gDbHvDLEOqtcqAcYh6mXhXM5mq0CKZxyJXGwPdfDUA9w3WhnAGrY3CuAfdAC0I/dVG+kAuu3wAHEhVV9A3s4u/+9XAAN+89XrSoux+3ut3u+72utVOEM1ut7vQcmoA/AH4A/AH4A/AH4A/ADIA="))
    },
    face6: {
      width : 108, height : 72, bpp : 4,
      transparent : 0,
      palette : new Uint16Array([65535,8,65501,29248,27296,25184,12512,224,10464,32,0,8416,4576,6624,7,9]),
      buffer : require("heatshrink").decompress(atob("AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH3u92q9w0whw0BzOa0AKE32uIII1m9Hq1W73OZBIcKBIOu12wGsuu1erqEFzNwBIWaGgOo3WpGkkLMAOmgUgGomu1OamEG3Rskh2q1WoGoWrBIepzIJB1XgGsmuGwNQg2a9wJC9WpzA1BzXvNc2q1eZUoIJBhWqzepoEGvQ1lNYLOBGoOoH4eZzN7vOZGskK9RqBZ4OZyAJD3IzBy41lMII2BGgOauAJBhOaGQI2BzPwGscA3yiBzOe1IIChp0CzWp13gGsiYB9WZ9wqE3w+B1Xu1w0kAAPu1W59w/GOgOuiI1mgGL5gIGx2X13uiA1nABPdxYzxAEf/+AecDqkP///KmXuGjxWCGyMO9zBgh8eCJ8HGkIAB8KOPhPgGsTaBap40jGu0f+DoNIp4AViLHNGsIhBM4URIp4ZETbX/K4fhCp0edghPDM6nx8IZD3ygNDAQvEGwI3RGQIADBQnuiAcPbAwfBiMecZIwEGQyPCj6FRMg/u8I4BAII7BA4MeA4P/jxeJh77ENh5+KiPxGgIACLZvxap4ADgJ/RRhpqTNgSjHACoeWh71HDtpscDjJsbDbMPbLoA/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/ACo"))
    },
    face7: {
      width : 132, height : 97, bpp : 4,
      transparent : 0,
      palette : new Uint16Array([65535,24579,65433,65400,65367,7,1,128,22530,8,22531,3,2,35552,0,192]),
      buffer : require("heatshrink").decompress(atob("AH4A/AH4A/AH4A/AH4A/AH4A/AH4AuyAMLhINMAE2ZIP40NJxhBzQWh3MzJB1PBTE0G5bE2XZSC3PQI5GJJAAxrJCEJA7H4IAKC5ABH733vG+kG83/BAuP5m83lvIGUL4xBBuoJE3lmAANrIOV+93ut3FqAICgu292AgHrrKCx933vsA9hBD3ZBBwUi7dVIOFc8/n+Ui7nFIIfOs5BC2uQIN++u9+6RBB9ZBD41nYoOM2qODAFi6Bv3AkGPvY3CIINuv2Hs3LIOFct3uu+v+y7D3dm93nv3utmwIOHO8/n+/sIIYJB9wACthAvPIPOw9392H3YJD21mAANu5hBy8/u9F83gJChe2tnMs1s3RBwgvGXQXr34KDu3mQQNrqBBwgHGXANmG4v/9m8514IGMAg+73e28wKF/dV3HwIOUA2tVr430AH4A/AH4A/AH4A/AH4A/ADEF/4ACs/Gs93u/m5e13fL34MB+A+srdb3+P7/f7v3vvdAAX3tvd7HfKAd3H00PFYWPOIvX+EgAgMC7+AkAGBhv97vf73m94hEhOQHKtVqAGE3fvx/d6EAx+NmU0ocgx99ocikUt739oUiknf+kikEN7H+LImZzJCUhOVCwcP23svp1Bkct//96lEmVNvHu6A3B7H3xxRBhuPwEiohMB/7NCIS8FIAt3xsI/p2BkgEBQgI1B72Hx197vY/+IvHo/H+x/9olEkbKBCgJCEqtbIKOZrhGD2+NgUI/EAmkN7+IxH3x4/BAoPux2PAgOIBAWI9CIBbYJGBmBCBrQpC/byFABeVCQe7wEykUPOYPdx/4GQV4vAECxGHxBCCwJFD8+Px/3xtDRIMN2ugNYVZIB8JyoECg1tgT2BFYOP9w6DAAeq1AECwMa1Wh1WKBQRSC/8EolDkGG36zDegbEMCAfM9/QkjEBHYh1BxWo1QABIIWKHgIADiMaSImNQYMIvFs+ByCIKADCgvI9H47BAFxERAAQ/DHIMYY4JDDIIKPDxH4aYP4vG72BBRhJBDze6YAPnEgMYIQ4yB9C3BOwPo93oJAOqIwIBB0INCIAP4BgNbGIWbIKMJrQmBHYiFFAAOO92OHYJFB7vdx9+w4ABBQTaBAAhBCYwJBQSYUFqpBExSDDu9+PoV47vY+4EB6kikUNx6MB/oDBIYWOB4OHaQW7wAxBzRBRhYaCQYhqBvA8BO4WNoc07vnx8DkciknY//dgkN7w/BSYLQDAANc4AxBypBS3WpPwYAD9HQklA73v6dEokwx99oczmcjnv4gSJBhH3w+IxuH9hAC0uL2EAhT3CABcFIImq0Oq12HP4LDBIAJ+BhvogckmUih/wkdCIQMg/sCmdDJoP46lEpuPxWhjTFB0BzEIJlZIIXKIIOK0/o++ONQIpBokikH/gQYCh/9DwcN/4DBI4Pf/oWBokI/CDC2q1FABcOIIe11WoX4QuB+9/ggpBoEAx8AFoP/AAP3/93v/vAQONJoWAIIUt/HB0u7qAMBYhwcBKoUI3eqxGOxp9CHAMDmh2C/+73/4/Hf7+PAIX42tV24PB6/wgFEocA/GHxm12CCBIJ8A4pWCqu7xF4X4R9B//dPYQABMh3Xs1nv/9/vf+/M5egYgRBQ+pBChdb5lnX4MA7vfHgP9/5vBACELxlvK4W724aD/OQDp8FqoEChlbraxBEgX4HySQOtITRyqECTYOpq6oBXpwAThNbuAURQgJCDAEsJqtZCydVrewIE2ZyryDACW1IYL/ZyA/JAAQlXrdV3a3YGhJAaAAMFqtQXC6DJAGxB/TgSC/rbdXADkJBRMLQWsJzIKI2uQIOxCH+qC1IQWVIQsF2tQIOyFCqp9CzOVQW6FEqqHBzObIHLACrJABZQoA/AH4A/AH4A/AH4A/AH4A/AH4A/AH4AxA=="))
    },
    face8: {
      width : 109, height : 92, bpp : 4,
      transparent : 0,
      palette : new Uint16Array([65535,24580,65470,65468,24579,22531,0,33440,6304,22532,47112,29408,6272,8,6368,25024]),
      buffer : require("heatshrink").decompress(atob("AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4Ag7vQFlfAA41mtts8A0n91t5ttGo2Gs1sGtHms1m6xjD7vO/1ss1oGs3O91/GwPdBAXmtcDhAJBszWmt0Cl9m5qaCg3WgUj9lus1gGskN43gkUMtnG6AJBs1rmcM4xsBVoYAh61ogZsBFoIsBhtm9+1GgNttpsls1o//mFgKjCGQIHB6wJB4A2kGAIuBw2GtqjBH4IACOoPONk3GAANoTIY9DHAQ1kgHNsxtBG4LPDtptD7p1BUco2BAAKiCgEMawIABbA48fhieBFgVgVoY2CNY/dBQQ2chw2C6wsFFYNtyAVH91t7o3UYZHdGwPgBQwHHC4o2RhoTBGxHZQ64hIGpLxfGwg1QF7vN7vcAwduPjwAM5PcAAPZ6wiChwmNhoOChud7udyAzShHM7ts6vJzNc5ojDGxihD7vd7ICB43uGh4aB5vF5OVrOZyuZ5raQBoUNzIACy3Ws2O9ozMQANZNAOZqtUog4B6xsPGoXuso2DyvJ41mOgPc5ngCwi0B7PZ6ouBAANUotJAgOdUZ4MCh1sqqHCqtFrOVzmcfwXWAIPWttt5mdJAQ2CoNBjI7C5jLFNhnd4o2BquVKoNZLgeZ5IAFBQYAByMUikRiORHAJoC7psOhvVqo2CiMUio2DOwQ8EGgoyBoICDjPNbKXZGoKJBogCBpI1DOwQOBHIo0BoJqBGYIYBimcNgY1LNgtEoiLBAAIfBoMVyuVMwlBrMZMoJnCimRCYIFByttNiXdqtUNYI2DomRqJdBymUTAjQCiNRoIBBAAcV5vAEoI1MIYUJ7lFGgSlCfgVByheBAwQAGpIMBrJrCotWGoSiMUYnFqhrDKoVRqlUqtFotUO4YRBisUIQJ4BO4UV5hoCURpEDww2BNIInCotJqmUqIABHINEFgIACOYUZymRC4MZrlsGqDaE4ooBAAVJqriBAQNEIIJyBWAQCBUgRNDqudGoaiNIonc5OVGAIeBGYQAEGoIrBF4Q1CJINBBwPN5hcFGyFdtosCK4TVBHYIAEBYVZGwLfCokVGoOQGqQQBGwSFB4vEMYJgBGwIEBFYJwGU4QKBzOdGqoREhilBzOZyKSBFoOqAAOkotVAII+Ca4MUpOc7gwEho1QAAvN7vZ6KTBGogABGgJtCNQVEzNt5vVGCxzH7udytcGoNKGwdV4rfE5nM63NqA1dQwOd7rfBoJsE0lcAAQzBAAXAGjw3Es3Nb4YABzmWGQfc4ozhAAkOOAOdAAbmB7nc8AzmAH4A/AH4AphvQG2ndGv41rUWg11hpr/Gv6ZZ7oGGNdovBGAQECTmAADsDUxUwwA/AH4A/AH4A/AH4A/AH4A/AH4A/ADIA="))
    },
    face9: {
      width : 113, height : 101, bpp : 4,
      transparent : 0,
      palette : new Uint16Array([65535,0,65534,65469,24580,31392,29344,65404,3,32,4,9,27232,1,5,8]),
      buffer : require("heatshrink").decompress(atob("AH4A/AH4A/AH4A/AH4A/AH4A/AHW72ANLhf/3Y2mE5/7HEu7+ARPhaBNACsP/43QHEkO/aEU8A3fLYIWU92AG+sAzy+RG8kAz7jdG7EA/Y4cG7MADLIddKTQA/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4ARhe73YJGhOa8A3qhFP93u+AJEzOZzWNG9OZzsR7vY0AJD9o4BzPYOVEIzPArIuF/Wc5g4BxQ4nh/p48jrMdxyqC32pg81HAOuOE/q6kzkuRiOvIIXo4cjhOZzGJG83+7OQuFJFwKfC9WJgU8OAPd6DgmxuZygtBzOOBIMOBILhCzuZOEwqB7I3CzJwCGQIAEyA3laYOROIZwChJwBjI4DOE0IxIsDxXwBIOe1p6DxA3mgGa7MdzudxCoCgHu1o3C7HQHE+ZGoPY7BmE91NOIPa0A3nHAOq1WozgJE/2oN4J5DAE0O///oAJFpztBBIwA/AH4A/AH4A/AH4A/AFu0G2sP//6xQ3zhuupWI1w3yhOU6lE6mIG+WZogAB6mNHGPpG4VExHgG+Hqyg4DxXwG98O0g3DomOOGGNG4naVOEJpJw27o3EpugG98Kwg3DpNIOGHoOAlJOGEOxo3ExRww9RwEpGAG98JOAmY1JwwhvZN4eOgEL2A4uzOUptEptK0EA3Y1s/Y4CztNpGKcAO7OFkLMwWYzPd1VAVF5mDzOZxRBCPQQ4vAAn+G9qpDG4ugHGvu8A3tHAP4Awn/+A3ugG+1IECh/vG+EA13u/e73/vU95sD/4ACG2LjC3e72A3zAH4A/AH4A/AH4A/AH4A/ADgA="))
    },
    face10: {
      width : 156, height : 116, bpp : 4,
      transparent : 0,
      palette : new Uint16Array([65535,10,53856,6304,9,11,41664,65533,1,51712,25280,0,2,8,29344,7]),
      buffer : require("heatshrink").decompress(atob("AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AHcwIH4AKh8zmfUGFn/GAJ/Z4c+8czJlcEmfjGDMNnOZzOeTdnpGAPjTi8PDgVuJtnmzOWyZNayxNvzMun4bWhhNC9xNty2Sz3DDa2jn2Wy3gJtmmtOZ8bpWgczmfunxNt11u90zdK0zn3pnJpQqoNMqAdOh3u92e8czTSuZAAQVPJpkFJqAyDmbrTnfpDIWeCp5AMJqEKtIzCsacTnZnDJqCcMexqbDJoeWnhNS4eZyUpJqaPJgpNQTYmWn5NVkUiJqMBJpNBdB5NFzPsJqXTCwKbBtwXRSBENoobQJoaBBdKddn3p93uTaLfBSI8EoBNRs3u9Oe8czJqUEmZOBJ4IYSqpOFgtUDSKbC90zmcwGiUA8c59OZTaRGBdYgFBUY7pO8ZMUgEzJgOWtwYTiMQUJJNRyc6JqnfJoOZJqkEJoYAC//9JqeemZNUgfmyycBCqP/4YIFh88xk4HB5NCyWTJqsI31ps3jJiE85n8Fws/nG7AAOwJp3uTYNjmBNUgGDmYABCZ5MB5k73nAKwfzxez804/5rO4cz8czJq0M+YZQgf85cz90755WE2cwu8DBIYALP4RMWACcPTIM2IYPMJofInZNC5lAHdIAR/nMwZDBueM6AJBnGIxE+u9rxhN8//I3ZDBsZNDnnD5HDnU7BIYA5+fD3czn0z3nwJoXMxnMxGzBIYA5nmLnezme73BDC/+7BIOz3e8wBN8ne4nE7xZNDh+D3YABneImBN7hnIxGI5E8xhND5G7TYOI5hM7IYPMxHDAQJDE5nIxgIB+ZN8gHf3eMnG4wamE/nM5nPJnpDBxeM5E7mAKE5//5jxCAHsz//8JgoA/AAsPIH4A/AH4A/AH4A/AH4A/AGUFqpB/ABlVqBB/Tn4AaoicvPzkBoLM/ABkU7qa/dZtFJlUBqANL6kUogAFiIgJ6ghMTU/0///5/RiIAEilBiMVqNRiNEC4kEipMogp4H5n//pNB/4XJqtRUQf/NganJJj6aGqtE7pJJABNRqtVNoUEdU6aFhv0bAIhXEAS/IAD5EE3n8xhyiAEMPooECxn8mDAjAEMNiAECqIlfJs9NEslVJkpNlqqamgFUEcUFTU7DkTVB3BTkMFJlAAB//wFdIAhh//IP4AMhvfTqrgrABVP/8QCydVTu1BHClFen4ALh/xIP4AL//QIP6aL+BB/ABfdJv4ALqsRIP5FFqBM/ABUFqNEond/tEoJTEAH4AC//9JoPUoBF/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4AlA="))
    },
    face11: {
      width : 109, height : 111, bpp : 4,
      transparent : 0,
      palette : new Uint16Array([65535,24579,65271,24580,22531,7,35552,47112,2240,65431,65434,39776,22532,43872,65335,35712]),
      buffer : require("heatshrink").decompress(atob("AH4A/AH4A/AH4A/AH4A/AGVVBpkFqA0kgtVE5tVIppqXGpxGQGqwSRG0IiTG0LGUgo2ffio2ehA1VGwIXWGro2erAYXUjlVDjA2bDbSjcAH4A/AH4A/AH4A/AH4A/AGNVqtQFlOIxAHFhFYGwNVGk8IGoJjFhGFBII4BGtOIF4IIEowKCG00FxGAsg2BwqqDtWgIATbmquA1RmBFgdYxeq0g2orGE1RjFOoJsEUcpoBxuqtDQEAgOEcgZslFguIFgI/BAAZsnrAtENgg2EbMwtFbIQJBOwVVGsosCGooJBwp0DxA1kGw7jEBQLYmFgQ2CMwIJFA4I1ngGFrAACO4tVquAGs8AhFYqo1FAH4A/AH4A/AH4ABrGIAAY0uxA1BwmEww2BwuAGlUIF4OAh2ZzPqtA4CG9NVTYOGl3p9Xq82A0EGG1NVoEK1GAkUil0gxEJzOQotcUE1YgGq0FIsUu93gpGGlWqhGFqo1kguIoHqkFoxEdgFmxFEoEig2EplVUseFxmIpfWpGEpAABwlEG4IEBpnMrA2iGoNUxGEFwIABGgIABGgIABpnI4o1hrHFiItBwIxCAAgLConM5GFGsFVqgqEAA1BigNBiczolVGsGM5nBFQIxEHocRmMUiIOBoo2fa4PM4YpBTwo2CikTodDpjgCqA1dxA1BGwIvBAA0Uikcjk8jhEBpnFGzsIa4NMGpMxNIPDAQUzJIKjdgtUwjRBiY0GiczNAIADikx4dMGztY4g1BZoJrHFwPBNgIBBmkxmlVUblV5lEMgQ2FAwMzmdDGwQABmMzolFGzEFAQWFoJkDGwgrBGoQ2DAIPBidFUbEFJ4VYUIIwDNQY2CibZEikUBoNEpBsYJ4UFwiiDbQjWBiMzGQI3Bmg6CocRphsdLAQzBogACA4bbBAAMUmkUoKABmnFNjguDSAQABHwLfBG4LWCoNDoPB4JsBwpSCbLQ0BijdBmYDCHwVBUwJsECgMUNgVVN6psDwIsCpEzu93OgKYBFgIxBmkzA4IACIoIcCNjNUNgVEi41Bug2DNgKkBjg4BmlENwVIDgIfDGysFwgrBGod3pA2CbgJsBmJsDGwMUpBsBgpvCUa2IFoNEo41CHYLaDNgMUjgABNQSiBovAbK5sChA2CoI1Cu4nBAAdMpjZBNAI9BBINIrhsYUYlIwI1DumBFIOEAANE5kzmc0dYQ1BGQQ1WC4dYwg1EuJsBxHFxFYrFU5nM4PBiJ5CqqiBKgRsVbQeEi5sEwlYqtcqlV4o3CWYI1BpFYQ4RsXbQjYEuNIwtIPwlVrHFcIWExBoCGq4YBGwVYoY1CmfFqmACQtcqoyBpGIxANCwqiWJ4kFSgMzmfMqvICZHFOANVxAHCGrI2EEgIoBrgVMF4iICGzZeCDKlUGrL0YQQJraGwQ3VCwI1cD6QRBAAY0cRgY4OCAZqeAAeILMAA/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AFg="))
    },
    face12: {
      width : 136, height : 135, bpp : 4,
      transparent : 0,
      palette : new Uint16Array([65535,24579,24580,22531,65400,8,65270,22532,65369,22530,47112,9,11,20482,0,10]),
      buffer : require("heatshrink").decompress(atob("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"))
    },
    charge: {
      width : 176, height : 176, bpp : 4,
      transparent : 0,
      palette : new Uint16Array([65535,65535,0,19967,2040,61309,2041,17919,44373,2048,19935,40607,2008,38559,17918,2009]),
      buffer : require("heatshrink").decompress(atob("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"))
    }
  }

// Current face state
var currentFace = "face1";
// Ordered list of faces for cycling
var faceNumbers = [
  "face1", "face2", "face3", "face4", "face5", "face6",
  "face7", "face8", "face9", "face10", "face11", "face12"
];

// Get a random Meeseeks face
function getRandomFace() {
  return faceNumbers[Math.floor(Math.random() * faceNumbers.length)];
}

// Set a new random face
function setRandomFace() {
  currentFace = getRandomFace();
}

// Cycle to the next face in order
function setNextFace() {
  var idx = faceNumbers.indexOf(currentFace);
  if (idx < 0) idx = 0;
  currentFace = faceNumbers[(idx + 1) % faceNumbers.length];
}

// Decompress sprite on demand to save memory
function getSprite(spriteName) {
  var sprite = meeseeksSprites[spriteName];
  if (!sprite.buffer) {
    // Support legacy heatshrink-compressed base64 (sprite.data)
    if (sprite.data) {
    sprite.buffer = require("heatshrink").decompress(atob(sprite.data));
    // Support raw base64 pixel data from Espruino Image Converter (Image Object, no compression)
    } else if (sprite.raw) {
      sprite.buffer = E.toArrayBuffer(atob(sprite.raw));
    }
  }
  return sprite;
}

// Draw the Meeseeks face
function drawMeeseeksFace() {
  var isCharging = Bangle.isCharging();
  var faceImage;
  
  // Show charge face when charging
  if (isCharging) {
    faceImage = getSprite("charge");
  } else {
    faceImage = getSprite(currentFace);
  }
  
  // Draw the face centered on screen based on actual sprite dimensions
  var centerX = (g.getWidth() - faceImage.width) / 2;
  var centerY = (g.getHeight() - faceImage.height) / 2;
  g.drawImage(faceImage, centerX, centerY, {transparent: faceImage.transparent});
}

// ------- Aging spots overlay (more as battery goes down) -------
var spotCache = { batteryBucket : -1, w:0, h:0, spots : [] };

function randomBetween(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

function computeSpots(centerX, centerY, width, height, count) {
  var spots = [];
  var margin = 6; // keep a small inset from edges
  for (var i = 0; i < count; i++) {
    var x = randomBetween(centerX + margin, centerX + width - margin);
    var y = randomBetween(centerY + margin, centerY + height - margin);
    var baseR = randomBetween(1, 3); // base radius
    var blobs = randomBetween(1, 3); // draw 1-3 small blobs around base
    var blobList = [];
    for (var b = 0; b < blobs; b++) {
      var ox = randomBetween(-2, 2);
      var oy = randomBetween(-2, 2);
      var r = Math.max(1, baseR + randomBetween(-1, 1));
      blobList.push({ x:x+ox, y:y+oy, r:r });
    }
    spots.push(blobList);
  }
  return spots;
}

// Lightweight stipple fill to simulate translucency
function fillCircleStipple(cx, cy, r, spacing, phase) {
  if (r <= 0) return;
  var rr = r*r;
  for (var dy = -r; dy <= r; dy++) {
    var y = cy + dy;
    var dxMax = Math.floor(Math.sqrt(rr - dy*dy));
    for (var dx = -dxMax; dx <= dxMax; dx++) {
      var x = cx + dx;
      if (((dx + dy + phase) % spacing) === 0) g.setPixel(x, y);
    }
  }
}

function drawSpotsOverlay() {
  if (Bangle.isCharging()) return; // no aging while charging
  var w = g.getWidth();
  var h = g.getHeight();
  var centerX = 0;
  var centerY = 0;
  var b = E.getBattery();
  // Bucketize to reduce flicker/regen
  var bucket = Math.max(0, Math.min(20, Math.floor((100 - b) / 5))); // 0..20
  var maxSpots = 60; // many at low battery
  var spotsWanted = Math.round(maxSpots * Math.min(1, Math.max(0, (100 - b) / 80))); // 100->0, 20->~max

  if (spotCache.batteryBucket !== bucket || spotCache.w !== w || spotCache.h !== h) {
    spotCache.batteryBucket = bucket;
    spotCache.w = w;
    spotCache.h = h;
    spotCache.spots = computeSpots(centerX, centerY, w, h, spotsWanted);
  }
  // Color: dev blue; outlines + stipple for quasi-transparency
  g.setColor(0, 0, 0.5);
  for (var i = 0; i < spotCache.spots.length; i++) {
    var cluster = spotCache.spots[i];
    for (var j = 0; j < cluster.length; j++) {
      var c = cluster[j];
      g.drawCircle(c.x, c.y, c.r);
      // sparse interior points; spacing 3 gives light fill
      fillCircleStipple(c.x, c.y, c.r-1, 3, (i*7 + j*3) % 3);
    }
  }
}

function bigThenSmall(big, small, x, y) {
  g.setFont("7x11Numeric7Seg", 2);
  g.drawString(big, x, y);
  x += g.stringWidth(big);
  g.setFont("8x12");
  g.drawString(small, x, y);
}




// schedule a draw for the next minute
var drawTimeout;
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
}


function clearIntervals() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = undefined;
}

function drawClock() {
  g.setFont("7x11Numeric7Seg", 3);
  g.setColor(1, 1, 1);
  g.drawString(require("locale").time(new Date(), 1), 75, 135);
  g.setFont("8x12", 2);
  g.drawString(require("locale").dow(new Date(), 2).toUpperCase(), 8, 145);
  g.setFont("8x12");
  g.drawString(require("locale").month(new Date(), 2).toUpperCase(), 8, 130);
  g.setFont("8x12", 2);
  const time = new Date().getDate();
  g.drawString(time < 10 ? "0" + time : time, 28, 120);
}

function drawBattery() {
  bigThenSmall(E.getBattery(), "%", 10, 10);
}


function getTemperature(){
  try {
    var temperature = E.getTemperature();
    if (!temperature || !isFinite(temperature)) return "--";
    // Show Fahrenheit
    var f = (temperature * 9/5) + 32;
    return Math.round(f) + "F";

  } catch(ex) {
    print(ex)
    return "--"
  }
}

function getSteps() {
  var steps = Bangle.getHealthStatus("day").steps;
  steps = Math.round(steps/1000);
  return steps + "k";
}


function draw() {
  queueDraw();

  g.clear(1);
  g.setColor(0, 0.7, 1);
  g.fillRect(0, 0, g.getWidth(), g.getHeight());

  // Spots should be above background but below the face
  drawSpotsOverlay();
  // Draw the Meeseeks face on top of spots
  drawMeeseeksFace();

  // Foreground metrics
  g.setFontAlign(0,-1);
  g.setFont("8x12", 2);
  g.setColor(1, 1, 1);
  g.drawString(getTemperature(), 20, 40);
  var hr = Bangle.getHealthStatus().bpm || Bangle.getHealthStatus("last").bpm;
  var hrStr = (hr && isFinite(hr)) ? String(Math.round(hr)) : "--";
  g.drawString(hrStr, 15, 70);
  g.drawString(getSteps(), 160, 10);
  
  g.setFontAlign(-1,-1);
  drawClock();
  drawBattery();

  // Hide widgets
  for (let wd of WIDGETS) {wd.draw=()=>{};wd.area="";}
}

Bangle.on("lcdPower", (on) => {
  if (on) {
    // Set a random face when waking up
    setRandomFace();
    draw();
  } else {
    clearIntervals();
  }
});


Bangle.on("lock", (locked) => {
  clearIntervals();
  draw();
});

Bangle.setUI("clock");

// Touch debouncing to prevent rapid face changes
var lastTouchTime = 0;
var touchDebounceMs = 500; // 500ms debounce

// Independent touch listener so it's not overridden by UI helpers
Bangle.on('touch', function(button, xy) {
  var now = Date.now();
  
  // Debounce rapid touches
  if (now - lastTouchTime < touchDebounceMs) {
    return;
  }
  
  // Get current sprite to check its dimensions
  var currentSprite = Bangle.isCharging() ? getSprite("charge") : getSprite(currentFace);
  var centerX = (g.getWidth() - currentSprite.width) / 2;
  var centerY = (g.getHeight() - currentSprite.height) / 2;
  
  // Define touch zones - exclude top area for widget bar access
  var widgetBarHeight = 40; // Reserve top 40px for widget bar gestures
  var faceTouchMargin = 20; // Reduce touch area to center of face
  
  // Check if tap is within the center area of Meeseeks face (excluding top for widget bar)
  if (xy && xy.x >= centerX + faceTouchMargin && xy.x <= centerX + currentSprite.width - faceTouchMargin && 
      xy.y >= centerY + faceTouchMargin && xy.y <= centerY + currentSprite.height - faceTouchMargin &&
      xy.y > widgetBarHeight) { // Exclude top area for widget bar access
    // Only change face if not charging
    if (!Bangle.isCharging()) {
      lastTouchTime = now;
      setNextFace();
      draw();
    }
  }
});

// Fallbacks for devices/firmware without touch delivery
if (typeof BTN1 !== 'undefined') {
  setWatch(function() {
    if (!Bangle.isCharging()) { setNextFace(); draw(); }
  }, BTN1, {repeat:true, edge:'falling'});
}

Bangle.on('swipe', function(LR, UD) {
  if (!Bangle.isCharging()) { setNextFace(); draw(); }
});

// Load widgets, but don't show them
Bangle.loadWidgets();
require("widget_utils").swipeOn(); // hide widgets, make them visible with a swipe
g.clear(1);
// Set initial random face
setRandomFace();
draw();
