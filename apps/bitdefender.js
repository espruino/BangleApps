const bitdefenderLogo = require("heatshrink").decompress(atob("vF4whC/AC3MAAw44H2MMHRoAB4B02PVZ0QPVI6WHkY6YHkI6aHj46cHjw6dAAI66HjSxeWrg6hPDA6jHiyxiWrA6lPCh2mPCg6nPCR2oPCQ6pPCB2qPCA6rPB476WQ/P/4ASmfcWjgUH4Y7TAAPzHp52SAANPHkp4KHZPEHao8PHZQVKWq3/+S0WOxIACn48Wnh4VHZh4X+Y7VRxp4lHap4X/o7TWRgAB4S0rHZ3EHa3/7g7SHRvM5reNoj/IeCY7dAANPHY38HaKyOHaPMPI39eCI7h4YRF+Y7z5g7YHRw7TWgo7NeAg7ip4SFHenPHazuPHbKzOeAQ7/He46PHaffCIn0FBw7ln4RE/g70CKI7o4YRFFB47kWQvzHaEMHcPfCAruP5nAHcHNOoqyRHbXzmYADHA4AB+g7qABztQHdT+JHeA6SHafMHSUsHSQ7n+dMHfIABno76eKQ7p//cHfXyHfX/pg7ob43EokjHY/9Hd4+Dl48GHeQABn4SRHdHECQv8HefMWovzHZ0AHcnPeCcAHcvCCYvcHebwGCZg7nCag7t/g7Ohg734A7/Hf47e4g7VgA7j4YTSHQQ7k7476CQv/pg7PeCA7RWQ3/dx47i4g6G+Y7QWiA7P4U/HY3yWR47XnvdAAvTHI4AB/g7RWh4rIAB8sWSA7odyS0QHa6ySHdFMHaa0OHS30WSY7ldpg7JWhw7VlgjMHRA7jngjNHZK0NWCZ1NWRR4OHSMypg6NOxR4OG5szmckHBx2NWhwAgHZi0NAEA6MPFp2NPFo6OPFZ2PPFY6QPFJ2RPFI6SPE52TPE46UPEp2VHkg6XWsY6YgEFHT9QHbK1fWLI8gHToABrg6Z4o6eHjQ6hWzCwfHjQ6lAAQ6RHM4ACgo5NqA6qAAdcHA/FHFwAl"));

g.clear();

let scale = 0.2;
let flag = 1.5;

const scaleLogo = () => {
    let x = 120 - (scale / 2 * 120);
    let y = x;

    if (scale >= flag) {
        clearInterval(getInt);
    }

    g.drawImage(bitdefenderLogo, x, y, {
        scale: scale
    });

    if (scale >= flag) {
        setTimeout(() => {
            g.clear();
            g.setFontAlign(0,0); // center font
            g.setFont("6x8",2);
            g.drawImage(bitdefenderLogo, 60, 0);
            g.drawString("Protect your device", 120, 160);
            g.drawString("at NodeConfEU 2019", 120, 180);
            g.drawString("www.bitdefender.com", 120, 200);
            stayAwake();
        }, 700);
    }

    g.flip();

    scale += 0.08;
};

let getInt = setInterval(() => {
    scaleLogo();
}, 25);

const stayAwake = () => {
    setInterval(() => {
        g.flip();
    }, 100);
};

setWatch(() => {
    clearInterval(getInt);
    g.clear();
    Bangle.buzz();
    g.drawImage(bitdefenderLogo, 0, 0, {
        scale: 2
    });
    stayAwake();
}, BTN2, {repeat:true});

setWatch(() => {
    scale = 0.2;
    clearInterval(getInt);
    g.clear();
    Bangle.buzz();
    getInt = setInterval(() => {
        scaleLogo();
    }, 25);
}, BTN1, {repeat:true});

setWatch(() => {
    load();
}, BTN3, {repeat:true});
