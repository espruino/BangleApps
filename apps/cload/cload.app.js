/* 
   Code Load, or C load.

   I'm looking for loader for binaries for bangle.js2. Idea would be
   I'd compile binary (likely gcc -fpic -nostdlibs -o ...) and than
   have a javascript loader/linker that would load the binary into
   memory and execute it.

   Ideally I'd like some way to do "syscalls" from loaded
   binary. Perhaps start with implementing print() syscall.

   I'd like two word name for this, ideally steampunk-themed and
   rhyming. I'm thinking about "Tin Bin".

   (Bin Spin, Bit kit, Code Load -- Tin Bin)

Proof of concept, please. You can include design notes. And yes, code
is for Espruino.

*/

// === loader.js ===
// Espruino-side loader (run on Bangle.js2)
// Copy example.bin to Bangle.js2 Storage manually before use
// For example, upload using Espruino IDE and name it 'example.bin'

var img = {
  width : 176, height : 176, bpp : 3,
  buffer : new Uint8Array(176*176*(3/8)).buffer
};

function msg(s) {
  g.reset().clear().setFont("Vector", 33).drawString(s, 10, 30).flip();
}

var bin, io, ios, ram, rams, code, ccode;

function step() {
  io[0] = ios;
  io[1] = rams;
  io[2] = code;
  print("Running at: ", io[2].toString(16));
  let a1 = E.getAddressOf(io.buffer, true);
  let a2 = E.getAddressOf(ram.buffer, true);
  let a3 = E.getAddressOf(img.buffer, true);
  print(a1, a2, a3);
  return ccode(0x8a61c, a1, a2, a3);
}

var binData;

function load() {
  bin = new Uint8Array(12*1024);
  binData = Uint8Array(require("Storage").readArrayBuffer("cload.bin"));
  if (!binData) {
    console.log("Binary not found!");
    return;
  }
  bin.set(binData);
  code = E.getAddressOf(bin.buffer, true);

  // Create native function from binary
  // '1' = use Thumb mode (bit 0 set in address)
  // First 256 bytes are .got, +1 for thumb mode
  ccode = E.nativeCall(code+257, "int(int,int,int,int)");
  
  g.reset().clear();
  print("Fill");
  //j_test(img.buffer);
  
  print("Buffers");
  ios = 128;
  io = new Uint32Array(ios);
  rams = 2*1024;
  ram = new Uint8Array(rams);
  
  msg("Reloc");
  io[3] = 0x51a87;
  let relocated = step();
  if (relocated != 0xa11600d) {
    print("Relocation failed:", relocated.toString(16));
    return;
  }
  
  msg("Go");
  while (1) {
    io[3] = 0x606060;
    let going = step();
    if (going != 0x60176) {
      print("Step failed", going.toString(16));
      return;
    }
    switch(io[1]) {
      case 1: // print: start, len
        print("Should print");
        {
          let slice = ram.subarray(io[2], io[2]+io[3]);
          let text = String.fromCharCode.apply(null, slice);
          print(text);
          msg(text);
        }
        break;
      case 2: // draw
        g.drawImage(img, 0, 0);
        break;
      default:
        print("Unknown op: ", io[1]);
        return;
      }
      g.flip();
  }
}

msg("Cload\nready");
function go() {
  load();
}
go();
