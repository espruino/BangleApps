// === Makefile ===
TARGET=cload
ARCH_FLAGS=
CROSS=arm-linux-gnueabihf-
CC=$(CROSS)gcc
#  -nostdinc -- ouch, olive needs stddef.h
#  -mfloat-abi=soft -- breaks build with __aeabi_fsub references
CFLAGS=-ffreestanding -Os -nostdlib -fPIC $(ARCH_FLAGS) -mlittle-endian -mthumb -mcpu=cortex-m3  -mfix-cortex-m3-ldrd  -mthumb-interwork
#  --emit-relocs
LDFLAGS=-Ttext=0x0100 $(ARCH_FLAGS)

all: $(TARGET).bin

$(TARGET).o: $(TARGET).c lib.c
	#-Wl,--emit-relocs
	$(CC) $(CFLAGS) -c -o $@  $<

triangle3d.o: olive/triangle3d.c olive/vc.c olive/olive.c
	$(CC) $(CFLAGS) -DVC_PLATFORM=VC_ESPRUINO_PLATFORM -Iolive/ -c -o $@  $<

triangle.o: olive/triangle.c olive/vc.c olive/olive.c
	$(CC) $(CFLAGS) -DVC_PLATFORM=VC_ESPRUINO_PLATFORM -Iolive/ -c -o $@  $<

$(TARGET).elf: $(TARGET).o $(TARGET).ld triangle.o
	#$(CC) $(LDFLAGS) -o $@ $<
	#  --emit-relocs
	arm-linux-gnueabihf-ld -T cload.ld  -o cload.elf cload.o triangle.o

$(TARGET).bin: $(TARGET).elf
	# --only-section=.text
	$(CROSS)objcopy -O binary $< $@

dump: cload.elf
	$(CROSS)objdump --disassemble-all cload.elf

qemu:
	$(CC) cload.c -o cload-static -static
	qemu-arm-static ./cload-static

put: cload.bin
	../wt put cload.bin

clean:
	rm -f *.o *.elf *.bin

