// === example.c ===
// Position-independent, nostdlib binary function

// arm-none-eabi-gcc -mlittle-endian -mthumb -mcpu=cortex-m3  -mfix-cortex-m3-ldrd  -mthumb-interwork -mfloat-abi=soft -nostdinc -nostdlib -c test.c -o test.o


typedef unsigned char uint8_t;
typedef unsigned long uint32_t;
typedef unsigned long size_t;
typedef long long int64_t;
typedef unsigned long long uint64_t;

int cload_main(int cmd, uint32_t *io, char *ram, char *fb);

// Don't call it main, it goes into different section
// Make it assembly jump, so that if optimizer reorders stuff, this is still first
__attribute__((naked, used, section(".text.startup")))  int cload_entry(int cmd, uint32_t *io, char *ram, char *fb) {
    __asm__ volatile (
	    "b cload_main");
}

static char *dmesg;

void putchar(char v)
{
	*dmesg++ = v;
}

void puts(const char *s) {
    while (*s) {
        putchar(*s++);
    }
    putchar('\n');
}

void reverse(char *str, int len) {
    int i = 0, j = len - 1;
    while (i < j) {
        char tmp = str[i];
        str[i++] = str[j];
        str[j--] = tmp;
    }
}

void itoa(int value, char *str) {
    int i = 0;
    int is_negative = 0;

    if (value == 0) {
        str[i++] = '0';
        str[i] = '\0';
        return;
    }

    if (value < 0) {
        is_negative = 1;
        value = -value;
    }

    while (value != 0) {
        int digit = value % 10;
        str[i++] = digit + '0';
        value /= 10;
    }

    if (is_negative)
        str[i++] = '-';

    str[i] = '\0';
    reverse(str, i);
}

void *memset(void *dest, int val, size_t len) {
    unsigned char *ptr = dest;
    while (len-- > 0) {
        *ptr++ = (unsigned char)val;
    }
    return dest;
}

typedef struct {
    uint32_t sp;   // offset 0 -- aka r13
    uint32_t lr;   // offset 4 -- aka r14
    uint32_t r4;   // offset 8
    uint32_t r5;   // ...
    uint32_t r6;
    uint32_t r7;
    uint32_t r8;
    uint32_t r9;
    uint32_t r10;
    uint32_t r11;  // offset 40
} context_t;

__attribute__((naked)) void switch_stack(context_t *old_ctx, context_t *new_ctx) {
    __asm__ volatile (
        // Save old context
        "str sp, [r0, #0]       \n"
        "str lr, [r0, #4]       \n"
        "str r4, [r0, #8]       \n"
        "str r5, [r0, #12]      \n"
        "str r6, [r0, #16]      \n"
        "str r7, [r0, #20]      \n"
        "str r8, [r0, #24]      \n"
        "str r9, [r0, #28]      \n"
        "str r10, [r0, #32]     \n"
        "str r11, [r0, #36]     \n"

        // Load new context
        "ldr sp, [r1, #0]       \n"
        "ldr lr, [r1, #4]       \n"
        "ldr r4, [r1, #8]       \n"
        "ldr r5, [r1, #12]      \n"
        "ldr r6, [r1, #16]      \n"
        "ldr r7, [r1, #20]      \n"
        "ldr r8, [r1, #24]      \n"
        "ldr r9, [r1, #28]      \n"
        "ldr r10, [r1, #32]     \n"
        "ldr r11, [r1, #36]     \n"

        "bx lr                  \n"
    );
}

volatile char welcome[] = "Hello\nwatch\n:-)";
uint32_t *g_io = 1;
char *g_ram = 2, *g_fb = 3;

context_t main_ctx, alt_ctx;
uint8_t alt_stack[4096] __attribute__((aligned(8)));

extern void olive_step(float dt, char *fb);

void msg(char *m) {
		dmesg = g_ram;
		puts(m);
		g_io[1] = 1;
		g_io[2] = 0;
		g_io[3] = dmesg - g_ram;
		switch_stack(&alt_ctx, &main_ctx);
	
}

void flip(void) {
		g_io[1] = 2;
		switch_stack(&alt_ctx, &main_ctx);
}

// Save 32 FPU registers (S0–S31) and FPSCR (Floating Point Status and Control Register)
void call_with_fpu_preserved(void (*func)(void)) {
    __asm volatile (
        // Allocate space on the stack
        "sub sp, sp, #136\n"          // 32*4 + 4 = 128 + 8 = 136 bytes

        // Save FPU registers S0–S31
        "vstmia sp, {s0-s31}\n"

        // Save FPSCR to last 4 bytes
        "vmrs r1, fpscr\n"
        "str r1, [sp, #128]\n"

        // Call the C function
        "mov r0, %0\n"
        "blx r0\n"

        // Restore FPSCR
        "ldr r1, [sp, #128]\n"
        "vmsr fpscr, r1\n"

        // Restore FPU registers
        "vldmia sp, {s0-s31}\n"

        // Restore stack
        "add sp, sp, #136\n"
        :
        : "r" (func)
        : "r0", "r1", "lr", "memory", "cc",
          "s0", "s1", "s2", "s3", "s4", "s5", "s6", "s7",
          "s8", "s9", "s10", "s11", "s12", "s13", "s14", "s15",
          "s16", "s17", "s18", "s19", "s20", "s21", "s22", "s23",
          "s24", "s25", "s26", "s27", "s28", "s29", "s30", "s31"
    );
}

void olive_ind(void)
{
	olive_step(.3, g_fb);
}

void new_stack_fn(void) {
	for (int i = 0; i<10; i++) {
		dmesg = g_ram;
		puts(welcome);
		putchar(i+'0');
		g_io[1] = 1;
		g_io[2] = 0;
		g_io[3] = dmesg - g_ram;
		switch_stack(&alt_ctx, &main_ctx);
	}
	while (1) {
		msg("Compute");
		for (int i = 0; i < 20; i++) {
			call_with_fpu_preserved(olive_ind);
			//olive_ind();
			flip();
		}
		msg("Done");		
	}
}

void prepare_alt_context(void) {
    uint32_t *stack_top = (uint32_t *)(alt_stack + sizeof(alt_stack));

    for (int i=0; i<sizeof(alt_stack); i++)
	    alt_stack[i] = 0xbe;

    // Simulate a call to new_stack_fn by pushing its address as "lr"
    *(--stack_top) = (uint32_t)new_stack_fn;

    alt_ctx.sp = (uint32_t)stack_top;
    alt_ctx.lr = (uint32_t)new_stack_fn;
    alt_ctx.r4 = alt_ctx.r5 = alt_ctx.r6 = alt_ctx.r7 = 0;
    alt_ctx.r8 = alt_ctx.r9 = alt_ctx.r10 = alt_ctx.r11 = 0;
}

#include "lib.c"

int cload_main(int cmd, uint32_t *io, char *ram, char *fb) {
	int i;
	uint32_t *got = io[2];

	if (cmd != 0x8a61c)
		return 0xbad001;
	if (io[3] == 0x51a87) {
		/* Perform relocation */
		for (i=0; i<256/4; i++)
			got[i] = got[i] + io[2];
		g_io = io;
		g_ram = ram;
		g_fb = fb;
		prepare_alt_context();
		return 0xa11600d;
	}
#if 0	
	for (i=0; i<176*176/3; i++)
		fb[i] = 0;
#endif
#if 1
	if (g_io != io || g_ram != ram || g_fb != fb)
		return 0xbad002;
#endif

	if (1 && io[3] == 0x606060) {
		io[1] = 0;
		switch_stack(&main_ctx, &alt_ctx);
		return 0x60176;
	}
	if (0 && io[3] == 0x606060) {
		io[1] = 2;
		olive_ind();
		return 0x60176;
	}
	return 0;
}
