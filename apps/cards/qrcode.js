/*
 * C source adapted from https://github.com/ricmoo/QRCode
 *
 * The MIT License (MIT)
 *
 * This library is written and maintained by Richard Moore.
 * Major parts were derived from Project Nayuki's library.
 *
 * Copyright (c) 2017 Richard Moore     (https://github.com/ricmoo/QRCode)
 * Copyright (c) 2017 Project Nayuki    (https://www.nayuki.io/page/qr-code-generator-library)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

var c = E.compiledC(`
// int get_qr(int, int)

typedef signed char __int8_t;
typedef unsigned char __uint8_t;
typedef signed short int __int16_t;
typedef unsigned short int __uint16_t;
typedef signed int __int32_t;
typedef unsigned int __uint32_t;

typedef __int8_t int8_t;
typedef __int16_t int16_t;
typedef __int32_t int32_t;
typedef __uint8_t uint8_t;
typedef __uint16_t uint16_t;
typedef __uint32_t uint32_t;

typedef struct QRCode {
    uint8_t version;
    uint8_t size;
    uint8_t ecc;
    uint8_t mode;
    uint8_t mask;
    uint8_t *modules;
} QRCode;
uint16_t qrcode_getBufferSize(uint8_t version);

int8_t qrcode_initText(QRCode *qrcode, uint8_t *modules, uint8_t version, uint8_t ecc, const char *data);
int8_t qrcode_initBytes(QRCode *qrcode, uint8_t *modules, uint8_t version, uint8_t ecc, uint8_t *data, uint16_t length);

bool qrcode_getModule(QRCode *qrcode, uint8_t x, uint8_t y);

static const uint16_t NUM_ERROR_CORRECTION_CODEWORDS[4][40] = {
    { 10, 16, 26, 36, 48, 64, 72, 88, 110, 130, 150, 176, 198, 216, 240, 280, 308, 338, 364, 416, 442, 476, 504, 560, 588, 644, 700, 728, 784, 812, 868, 924, 980, 1036, 1064, 1120, 1204, 1260, 1316, 1372},
    { 7, 10, 15, 20, 26, 36, 40, 48, 60, 72, 80, 96, 104, 120, 132, 144, 168, 180, 196, 224, 224, 252, 270, 300, 312, 336, 360, 390, 420, 450, 480, 510, 540, 570, 570, 600, 630, 660, 720, 750},
    { 17, 28, 44, 64, 88, 112, 130, 156, 192, 224, 264, 308, 352, 384, 432, 480, 532, 588, 650, 700, 750, 816, 900, 960, 1050, 1110, 1200, 1260, 1350, 1440, 1530, 1620, 1710, 1800, 1890, 1980, 2100, 2220, 2310, 2430},
    { 13, 22, 36, 52, 72, 96, 108, 132, 160, 192, 224, 260, 288, 320, 360, 408, 448, 504, 546, 600, 644, 690, 750, 810, 870, 952, 1020, 1050, 1140, 1200, 1290, 1350, 1440, 1530, 1590, 1680, 1770, 1860, 1950, 2040},
};

static const uint8_t NUM_ERROR_CORRECTION_BLOCKS[4][40] = {
    { 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49},
    { 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25},
    { 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81},
    { 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68},
};

static const uint16_t NUM_RAW_DATA_MODULES[40] = {
      208, 359, 567, 807, 1079, 1383, 1568, 1936, 2336, 2768, 3232, 3728, 4256, 4651, 5243, 5867, 6523,
       7211, 7931, 8683, 9252, 10068, 10916, 11796, 12708, 13652, 14628, 15371, 16411, 17483, 18587,
       19723, 20891, 22091, 23008, 24272, 25568, 26896, 28256, 29648
};
static int max(int a, int b) {
    if (a > b) { return a; }
    return b;
}

static int abs(int value) {
    if (value < 0) { return -value; }
    return value;
}

static void *memset(void *s, int c, int n) {
    char *arr = (char *)s;
    for (int i = 0; i<n; i++) {
        arr[i] = c;
    }
    return arr;
}

static void *memcpy(void *dest, const void *src, int n) {
    char *arr1 = (char *)dest;
    const char *arr2 = (char *)src;
    for (int i = 0; i<n; i++) {
        arr1[i] = arr2[i];
    }
    return arr1;
}

int strlen(const char *s) {
    int i = 0;
    while (s[i]) ++i;
    return i;
}

static int8_t getAlphanumeric(char c) {
    if (c >= '0' && c <= '9') { return (c - '0'); }
    if (c >= 'A' && c <= 'Z') { return (c - 'A' + 10); }
    switch (c) {
        case ' ': return 36;
        case '$': return 37;
        case '%': return 38;
        case '*': return 39;
        case '+': return 40;
        case '-': return 41;
        case '.': return 42;
        case '/': return 43;
        case ':': return 44;
    }

    return -1;
}

static bool isAlphanumeric(const char *text, uint16_t length) {
    while (length != 0) {
        if (getAlphanumeric(text[--length]) == -1) { return false; }
    }
    return true;
}
static bool isNumeric(const char *text, uint16_t length) {
    while (length != 0) {
        char c = text[--length];
        if (c < '0' || c > '9') { return false; }
    }
    return true;
}
static char getModeBits(uint8_t version, uint8_t mode) {
    unsigned int modeInfo = 0x7bbb80a;
    if (version > 9) { modeInfo >>= 9; }

    if (version > 26) { modeInfo >>= 9; }
    char result = 8 + ((modeInfo >> (3 * mode)) & 0x07);
    if (result == 15) { result = 16; }

    return result;
}

typedef struct BitBucket {
    uint32_t bitOffsetOrWidth;
    uint16_t capacityBytes;
    uint8_t *data;
} BitBucket;
static uint16_t bb_getGridSizeBytes(uint8_t size) {
    return (((size * size) + 7) / 8);
}

static uint16_t bb_getBufferSizeBytes(uint32_t bits) {
    return ((bits + 7) / 8);
}

static void bb_initBuffer(BitBucket *bitBuffer, uint8_t *data, int32_t capacityBytes) {
    bitBuffer->bitOffsetOrWidth = 0;
    bitBuffer->capacityBytes = capacityBytes;
    bitBuffer->data = data;

    memset(data, 0, bitBuffer->capacityBytes);
}

static void bb_initGrid(BitBucket *bitGrid, uint8_t *data, uint8_t size) {
    bitGrid->bitOffsetOrWidth = size;
    bitGrid->capacityBytes = bb_getGridSizeBytes(size);
    bitGrid->data = data;

    memset(data, 0, bitGrid->capacityBytes);
}

static void bb_appendBits(BitBucket *bitBuffer, uint32_t val, uint8_t length) {
    uint32_t offset = bitBuffer->bitOffsetOrWidth;
    for (int8_t i = length - 1; i >= 0; i--, offset++) {
        bitBuffer->data[offset >> 3] |= ((val >> i) & 1) << (7 - (offset & 7));
    }
    bitBuffer->bitOffsetOrWidth = offset;
}

static void bb_setBit(BitBucket *bitGrid, uint8_t x, uint8_t y, bool on) {
    uint32_t offset = y * bitGrid->bitOffsetOrWidth + x;
    uint8_t mask = 1 << (7 - (offset & 0x07));
    if (on) {
        bitGrid->data[offset >> 3] |= mask;
    } else {
        bitGrid->data[offset >> 3] &= ~mask;
    }
}

static void bb_invertBit(BitBucket *bitGrid, uint8_t x, uint8_t y, bool invert) {
    uint32_t offset = y * bitGrid->bitOffsetOrWidth + x;
    uint8_t mask = 1 << (7 - (offset & 0x07));
    bool on = ((bitGrid->data[offset >> 3] & (1 << (7 - (offset & 0x07)))) != 0);
    if (on ^ invert) {
        bitGrid->data[offset >> 3] |= mask;
    } else {
        bitGrid->data[offset >> 3] &= ~mask;
    }
}

static bool bb_getBit(BitBucket *bitGrid, uint8_t x, uint8_t y) {
    uint32_t offset = y * bitGrid->bitOffsetOrWidth + x;
    return (bitGrid->data[offset >> 3] & (1 << (7 - (offset & 0x07)))) != 0;
}

static void applyMask(BitBucket *modules, BitBucket *isFunction, uint8_t mask) {
    uint8_t size = modules->bitOffsetOrWidth;
    for (uint8_t y = 0; y < size; y++) {
        for (uint8_t x = 0; x < size; x++) {
            if (bb_getBit(isFunction, x, y)) { continue; }

            bool invert = 0;
            switch (mask) {
                case 0: invert = (x + y) % 2 == 0; break;
                case 1: invert = y % 2 == 0; break;
                case 2: invert = x % 3 == 0; break;
                case 3: invert = (x + y) % 3 == 0; break;
                case 4: invert = (x / 3 + y / 2) % 2 == 0; break;
                case 5: invert = x * y % 2 + x * y % 3 == 0; break;
                case 6: invert = (x * y % 2 + x * y % 3) % 2 == 0; break;
                case 7: invert = ((x + y) % 2 + x * y % 3) % 2 == 0; break;
            }
            bb_invertBit(modules, x, y, invert);
        }
    }
}

static void setFunctionModule(BitBucket *modules, BitBucket *isFunction, uint8_t x, uint8_t y, bool on) {
    bb_setBit(modules, x, y, on);
    bb_setBit(isFunction, x, y, true);
}
static void drawFinderPattern(BitBucket *modules, BitBucket *isFunction, uint8_t x, uint8_t y) {
    uint8_t size = modules->bitOffsetOrWidth;

    for (int8_t i = -4; i <= 4; i++) {
        for (int8_t j = -4; j <= 4; j++) {
            uint8_t dist = max(abs(i), abs(j));
            int16_t xx = x + j, yy = y + i;
            if (0 <= xx && xx < size && 0 <= yy && yy < size) {
                setFunctionModule(modules, isFunction, xx, yy, dist != 2 && dist != 4);
            }
        }
    }
}
static void drawAlignmentPattern(BitBucket *modules, BitBucket *isFunction, uint8_t x, uint8_t y) {
    for (int8_t i = -2; i <= 2; i++) {
        for (int8_t j = -2; j <= 2; j++) {
            setFunctionModule(modules, isFunction, x + j, y + i, max(abs(i), abs(j)) != 1);
        }
    }
}

static void drawFormatBits(BitBucket *modules, BitBucket *isFunction, uint8_t ecc, uint8_t mask) {

    uint8_t size = modules->bitOffsetOrWidth;
    uint32_t data = ecc << 3 | mask;
    uint32_t rem = data;
    for (int i = 0; i < 10; i++) {
        rem = (rem << 1) ^ ((rem >> 9) * 0x537);
    }

    data = data << 10 | rem;
    data ^= 0x5412;
    for (uint8_t i = 0; i <= 5; i++) {
        setFunctionModule(modules, isFunction, 8, i, ((data >> i) & 1) != 0);
    }

    setFunctionModule(modules, isFunction, 8, 7, ((data >> 6) & 1) != 0);
    setFunctionModule(modules, isFunction, 8, 8, ((data >> 7) & 1) != 0);
    setFunctionModule(modules, isFunction, 7, 8, ((data >> 8) & 1) != 0);

    for (int8_t i = 9; i < 15; i++) {
        setFunctionModule(modules, isFunction, 14 - i, 8, ((data >> i) & 1) != 0);
    }
    for (int8_t i = 0; i <= 7; i++) {
        setFunctionModule(modules, isFunction, size - 1 - i, 8, ((data >> i) & 1) != 0);
    }

    for (int8_t i = 8; i < 15; i++) {
        setFunctionModule(modules, isFunction, 8, size - 15 + i, ((data >> i) & 1) != 0);
    }

    setFunctionModule(modules, isFunction, 8, size - 8, true);
}
static void drawVersion(BitBucket *modules, BitBucket *isFunction, uint8_t version) {

    int8_t size = modules->bitOffsetOrWidth;
    if (version < 7) { return; }
    uint32_t rem = version;
    for (uint8_t i = 0; i < 12; i++) {
        rem = (rem << 1) ^ ((rem >> 11) * 0x1F25);
    }

    uint32_t data = version << 12 | rem;
    for (uint8_t i = 0; i < 18; i++) {
        bool bit = ((data >> i) & 1) != 0;
        uint8_t a = size - 11 + i % 3, b = i / 3;
        setFunctionModule(modules, isFunction, a, b, bit);
        setFunctionModule(modules, isFunction, b, a, bit);
    }
}

static void drawFunctionPatterns(BitBucket *modules, BitBucket *isFunction, uint8_t version, uint8_t ecc) {

    uint8_t size = modules->bitOffsetOrWidth;
    for (uint8_t i = 0; i < size; i++) {
        setFunctionModule(modules, isFunction, 6, i, i % 2 == 0);
        setFunctionModule(modules, isFunction, i, 6, i % 2 == 0);
    }
    drawFinderPattern(modules, isFunction, 3, 3);
    drawFinderPattern(modules, isFunction, size - 4, 3);
    drawFinderPattern(modules, isFunction, 3, size - 4);

    if (version > 1) {

        uint8_t alignCount = version / 7 + 2;
        uint8_t step;
        if (version != 32) {
            step = (version * 4 + alignCount * 2 + 1) / (2 * alignCount - 2) * 2;
        } else {
            step = 26;
        }

        uint8_t alignPositionIndex = alignCount - 1;
        uint8_t alignPosition[alignCount];

        alignPosition[0] = 6;

        uint8_t l_size = version * 4 + 17;
        for (uint8_t i = 0, pos = l_size - 7; i < alignCount - 1; i++, pos -= step) {
            alignPosition[alignPositionIndex--] = pos;
        }

        for (uint8_t i = 0; i < alignCount; i++) {
            for (uint8_t j = 0; j < alignCount; j++) {
                if ((i == 0 && j == 0) || (i == 0 && j == alignCount - 1) || (i == alignCount - 1 && j == 0)) {
                    continue;
                } else {
                    drawAlignmentPattern(modules, isFunction, alignPosition[i], alignPosition[j]);
                }
            }
        }
    }
    drawFormatBits(modules, isFunction, ecc, 0);
    drawVersion(modules, isFunction, version);
}
static void drawCodewords(BitBucket *modules, BitBucket *isFunction, BitBucket *codewords) {

    uint32_t bitLength = codewords->bitOffsetOrWidth;
    uint8_t *data = codewords->data;

    uint8_t size = modules->bitOffsetOrWidth;
    uint32_t i = 0;
    for (int16_t right = size - 1; right >= 1; right -= 2) {
        if (right == 6) { right = 5; }

        for (uint8_t vert = 0; vert < size; vert++) {
            for (int j = 0; j < 2; j++) {
                uint8_t x = right - j;
                bool upwards = ((right & 2) == 0) ^ (x < 6);
                uint8_t y = upwards ? size - 1 - vert : vert;
                if (!bb_getBit(isFunction, x, y) && i < bitLength) {
                    bb_setBit(modules, x, y, ((data[i >> 3] >> (7 - (i & 7))) & 1) != 0);
                    i++;
                }
            }
        }
    }
}
static uint32_t getPenaltyScore(BitBucket *modules) {
    uint32_t result = 0;

    uint8_t size = modules->bitOffsetOrWidth;
    for (uint8_t y = 0; y < size; y++) {

        bool colorX = bb_getBit(modules, 0, y);
        for (uint8_t x = 1, runX = 1; x < size; x++) {
            bool cx = bb_getBit(modules, x, y);
            if (cx != colorX) {
                colorX = cx;
                runX = 1;

            } else {
                runX++;
                if (runX == 5) {
                    result += 3;
                } else if (runX > 5) {
                    result++;
                }
            }
        }
    }
    for (uint8_t x = 0; x < size; x++) {
        bool colorY = bb_getBit(modules, x, 0);
        for (uint8_t y = 1, runY = 1; y < size; y++) {
            bool cy = bb_getBit(modules, x, y);
            if (cy != colorY) {
                colorY = cy;
                runY = 1;
            } else {
                runY++;
                if (runY == 5) {
                    result += 3;
                } else if (runY > 5) {
                    result++;
                }
            }
        }
    }

    uint16_t black = 0;
    for (uint8_t y = 0; y < size; y++) {
        uint16_t bitsRow = 0, bitsCol = 0;
        for (uint8_t x = 0; x < size; x++) {
            bool color = bb_getBit(modules, x, y);
            if (x > 0 && y > 0) {
                bool colorUL = bb_getBit(modules, x - 1, y - 1);
                bool colorUR = bb_getBit(modules, x, y - 1);
                bool colorL = bb_getBit(modules, x - 1, y);
                if (color == colorUL && color == colorUR && color == colorL) {
                    result += 3;
                }
            }
            bitsRow = ((bitsRow << 1) & 0x7FF) | color;
            bitsCol = ((bitsCol << 1) & 0x7FF) | bb_getBit(modules, y, x);
            if (x >= 10) {
                if (bitsRow == 0x05D || bitsRow == 0x5D0) {
                    result += 40;
                }
                if (bitsCol == 0x05D || bitsCol == 0x5D0) {
                    result += 40;
                }
            }
            if (color) { black++; }
        }
    }
    uint16_t total = size * size;
    for (uint16_t k = 0; black * 20 < (9 - k) * total || black * 20 > (11 + k) * total; k++) {
        result += 10;
    }

    return result;
}

static uint8_t rs_multiply(uint8_t x, uint8_t y) {
    uint16_t z = 0;
    for (int8_t i = 7; i >= 0; i--) {
        z = (z << 1) ^ ((z >> 7) * 0x11D);
        z ^= ((y >> i) & 1) * x;
    }
    return z;
}

static void rs_init(uint8_t degree, uint8_t *coeff) {
    memset(coeff, 0, degree);
    coeff[degree - 1] = 1;
    uint16_t root = 1;
    for (uint8_t i = 0; i < degree; i++) {

        for (uint8_t j = 0; j < degree; j++) {
            coeff[j] = rs_multiply(coeff[j], root);
            if (j + 1 < degree) {
                coeff[j] ^= coeff[j + 1];
            }
        }
        root = (root << 1) ^ ((root >> 7) * 0x11D);
    }
}

static void rs_getRemainder(uint8_t degree, uint8_t *coeff, const uint8_t *data, uint8_t length, uint8_t *result, uint8_t stride) {
    for (uint8_t i = 0; i < length; i++) {
        uint8_t factor = data[i] ^ result[0];
        for (uint8_t j = 1; j < degree; j++) {
            result[(j - 1) * stride] = result[j * stride];
        }
        result[(degree - 1) * stride] = 0;

        for (uint8_t j = 0; j < degree; j++) {
            result[j * stride] ^= rs_multiply(coeff[j], factor);
        }
    }
}
static int8_t encodeDataCodewords(BitBucket *dataCodewords, const uint8_t *text, uint16_t length, uint8_t version) {
    int8_t mode = 2;

    if (isNumeric((char*)text, length)) {
        mode = 0;
        bb_appendBits(dataCodewords, 1 << 0, 4);
        bb_appendBits(dataCodewords, length, getModeBits(version, 0));

        uint16_t accumData = 0;
        uint8_t accumCount = 0;
        for (uint16_t i = 0; i < length; i++) {
            accumData = accumData * 10 + ((char)(text[i]) - '0');
            accumCount++;
            if (accumCount == 3) {
                bb_appendBits(dataCodewords, accumData, 10);
                accumData = 0;
                accumCount = 0;
            }
        }
        if (accumCount > 0) {
            bb_appendBits(dataCodewords, accumData, accumCount * 3 + 1);
        }

    } else if (isAlphanumeric((char*)text, length)) {
        mode = 1;
        bb_appendBits(dataCodewords, 1 << 1, 4);
        bb_appendBits(dataCodewords, length, getModeBits(version, 1));

        uint16_t accumData = 0;
        uint8_t accumCount = 0;
        for (uint16_t i = 0; i < length; i++) {
            accumData = accumData * 45 + getAlphanumeric((char)(text[i]));
            accumCount++;
            if (accumCount == 2) {
                bb_appendBits(dataCodewords, accumData, 11);
                accumData = 0;
                accumCount = 0;
            }
        }
        if (accumCount > 0) {
            bb_appendBits(dataCodewords, accumData, 6);
        }

    } else {
        bb_appendBits(dataCodewords, 1 << 2, 4);
        bb_appendBits(dataCodewords, length, getModeBits(version, 2));
        for (uint16_t i = 0; i < length; i++) {
            bb_appendBits(dataCodewords, (char)(text[i]), 8);
        }
    }

    return mode;
}

static void performErrorCorrection(uint8_t version, uint8_t ecc, BitBucket *data) {
    uint8_t numBlocks = NUM_ERROR_CORRECTION_BLOCKS[ecc][version - 1];
    uint16_t totalEcc = NUM_ERROR_CORRECTION_CODEWORDS[ecc][version - 1];
    uint16_t moduleCount = NUM_RAW_DATA_MODULES[version - 1];
    uint8_t blockEccLen = totalEcc / numBlocks;
    uint8_t numShortBlocks = numBlocks - moduleCount / 8 % numBlocks;
    uint8_t shortBlockLen = moduleCount / 8 / numBlocks;

    uint8_t shortDataBlockLen = shortBlockLen - blockEccLen;

    uint8_t result[data->capacityBytes];
    memset(result, 0, sizeof(result));

    uint8_t coeff[blockEccLen];
    rs_init(blockEccLen, coeff);

    uint16_t offset = 0;
    uint8_t *dataBytes = data->data;

    for (uint8_t i = 0; i < shortDataBlockLen; i++) {
        uint16_t index = i;
        uint8_t stride = shortDataBlockLen;
        for (uint8_t blockNum = 0; blockNum < numBlocks; blockNum++) {
            result[offset++] = dataBytes[index];
            if (blockNum == numShortBlocks) { stride++; }

            index += stride;
        }
    }
    {
        uint16_t index = shortDataBlockLen * (numShortBlocks + 1);
        uint8_t stride = shortDataBlockLen;
        for (uint8_t blockNum = 0; blockNum < numBlocks - numShortBlocks; blockNum++) {
            result[offset++] = dataBytes[index];

            if (blockNum == 0) { stride++; }
            index += stride;
        }
    }

    uint8_t blockSize = shortDataBlockLen;
    for (uint8_t blockNum = 0; blockNum < numBlocks; blockNum++) {
        if (blockNum == numShortBlocks) { blockSize++; }

        rs_getRemainder(blockEccLen, coeff, dataBytes, blockSize, &result[offset + blockNum], numBlocks);
        dataBytes += blockSize;
    }

    memcpy(data->data, result, data->capacityBytes);
    data->bitOffsetOrWidth = moduleCount;
}

static const uint8_t ECC_FORMAT_BITS = (0x02 << 6) | (0x03 << 4) | (0x00 << 2) | (0x01 << 0);

uint16_t qrcode_getBufferSize(uint8_t version) {
    return bb_getGridSizeBytes(4 * version + 17);
}
int8_t qrcode_initBytes(QRCode *qrcode, uint8_t *modules, uint8_t version, uint8_t ecc, uint8_t *data, uint16_t length) {
    uint8_t size = version * 4 + 17;
    qrcode->version = version;
    qrcode->size = size;
    qrcode->ecc = ecc;
    qrcode->modules = modules;

    uint8_t eccFormatBits = (ECC_FORMAT_BITS >> (2 * ecc)) & 0x03;
    uint16_t moduleCount = NUM_RAW_DATA_MODULES[version - 1];
    uint16_t dataCapacity = moduleCount / 8 - NUM_ERROR_CORRECTION_CODEWORDS[eccFormatBits][version - 1];
    struct BitBucket codewords;
    uint8_t codewordBytes[bb_getBufferSizeBytes(moduleCount)];
    bb_initBuffer(&codewords, codewordBytes, (int32_t)sizeof(codewordBytes));
    int8_t mode = encodeDataCodewords(&codewords, data, length, version);

    if (mode < 0) { return -1; }
    qrcode->mode = mode;
    uint32_t padding = (dataCapacity * 8) - codewords.bitOffsetOrWidth;
    if (padding > 4) { padding = 4; }
    bb_appendBits(&codewords, 0, padding);
    bb_appendBits(&codewords, 0, (8 - codewords.bitOffsetOrWidth % 8) % 8);
    for (uint8_t padByte = 0xEC; codewords.bitOffsetOrWidth < (dataCapacity * 8); padByte ^= 0xEC ^ 0x11) {
        bb_appendBits(&codewords, padByte, 8);
    }

    BitBucket modulesGrid;
    bb_initGrid(&modulesGrid, modules, size);

    BitBucket isFunctionGrid;
    uint8_t isFunctionGridBytes[bb_getGridSizeBytes(size)];
    bb_initGrid(&isFunctionGrid, isFunctionGridBytes, size);
    drawFunctionPatterns(&modulesGrid, &isFunctionGrid, version, eccFormatBits);
    performErrorCorrection(version, eccFormatBits, &codewords);
    drawCodewords(&modulesGrid, &isFunctionGrid, &codewords);
    uint8_t mask = 0;
    int32_t minPenalty = (2147483647);
    for (uint8_t i = 0; i < 8; i++) {
        drawFormatBits(&modulesGrid, &isFunctionGrid, eccFormatBits, i);
        applyMask(&modulesGrid, &isFunctionGrid, i);
        int penalty = getPenaltyScore(&modulesGrid);
        if (penalty < minPenalty) {
            mask = i;
            minPenalty = penalty;
        }
        applyMask(&modulesGrid, &isFunctionGrid, i);
    }

    qrcode->mask = mask;
    drawFormatBits(&modulesGrid, &isFunctionGrid, eccFormatBits, mask);
    applyMask(&modulesGrid, &isFunctionGrid, mask);

    return 0;
}

int8_t qrcode_initText(QRCode *qrcode, uint8_t *modules, uint8_t version, uint8_t ecc, const char *data) {
    return qrcode_initBytes(qrcode, modules, version, ecc, (uint8_t*)data, strlen(data));
}

bool qrcode_getModule(QRCode *qrcode, uint8_t x, uint8_t y) {
    if (x >= qrcode->size || y >= qrcode->size) {
        return false;
    }

    uint32_t offset = y * qrcode->size + x;
    return (qrcode->modules[offset >> 3] & (1 << (7 - (offset & 0x07)))) != 0;
}

int get_qr (char *string, uint8_t *qrcodeBitmap) {
    // The structure to manage the QR code
    QRCode qrcode;

    // Allocate a chunk of memory to store the QR code
    uint8_t qrcodeBytes[qrcode_getBufferSize(3)];

    qrcode_initText(&qrcode, qrcodeBytes, 3, 0, string);
    for (uint8_t y = 0; y < qrcode.size; y++) {
        for (uint8_t x = 0; x < qrcode.size; x++) {
            qrcodeBitmap[x + y * qrcode.size] = qrcode_getModule(&qrcode, x, y);
        }
    }
    return qrcode.size;
}
`);

function getBinaryQR (value) {
  var qrcodeBitmap = new Uint8Array(850);
  var flatValue = Uint8Array(E.toArrayBuffer(E.toFlatString(value ,0)));
  var valueAddr = E.getAddressOf(flatValue, true);
  var qrAddr = E.getAddressOf(qrcodeBitmap, true);
  if (valueAddr == 0 || qrAddr == 0) {
    console.log ("Failed to get flat arrays..");
    //return;
  }
  var qrsize = c.get_qr(valueAddr, qrAddr);
  return { data: qrcodeBitmap, size: qrsize };
}

module.exports = getBinaryQR;
