
#define N 256
static const float sin_tab[N+1] = {
    // Insert precomputed sinf values over 0..2π:
    // for (i = 0; i <= N; i++) sin_tab[i] = sinf(i * 2π / N);
    0.00000000f, 0.02454123f, 0.04906767f, 0.07356456f, 0.09801714f, 0.12241068f, 0.14673047f, 0.17096189f,
    0.19509032f, 0.21910124f, 0.24298018f, 0.26671276f, 0.29028468f, 0.31368174f, 0.33688985f, 0.35989504f,
    0.38268343f, 0.40524131f, 0.42755509f, 0.44961133f, 0.47139674f, 0.49289819f, 0.51410274f, 0.53499762f,
    0.55557023f, 0.57580819f, 0.59569930f, 0.61523159f, 0.63439328f, 0.65317284f, 0.67155895f, 0.68954054f,
    0.70710678f, 0.72424708f, 0.74095113f, 0.75720885f, 0.77301045f, 0.78834643f, 0.80320753f, 0.81758481f,
    0.83146961f, 0.84485357f, 0.85772861f, 0.87008699f, 0.88192126f, 0.89322430f, 0.90398929f, 0.91420976f,
    0.92387953f, 0.93299280f, 0.94154407f, 0.94952818f, 0.95694034f, 0.96377607f, 0.97003125f, 0.97570213f,
    0.98078528f, 0.98527764f, 0.98917651f, 0.99247953f, 0.99518473f, 0.99729046f, 0.99879546f, 0.99969882f,
    1.00000000f, 0.99969882f, 0.99879546f, 0.99729046f, 0.99518473f, 0.99247953f, 0.98917651f, 0.98527764f,
    0.98078528f, 0.97570213f, 0.97003125f, 0.96377607f, 0.95694034f, 0.94952818f, 0.94154407f, 0.93299280f,
    0.92387953f, 0.91420976f, 0.90398929f, 0.89322430f, 0.88192126f, 0.87008699f, 0.85772861f, 0.84485357f,
    0.83146961f, 0.81758481f, 0.80320753f, 0.78834643f, 0.77301045f, 0.75720885f, 0.74095113f, 0.72424708f,
    0.70710678f, 0.68954054f, 0.67155895f, 0.65317284f, 0.63439328f, 0.61523159f, 0.59569930f, 0.57580819f,
    0.55557023f, 0.53499762f, 0.51410274f, 0.49289819f, 0.47139674f, 0.44961133f, 0.42755509f, 0.40524131f,
    0.38268343f, 0.35989504f, 0.33688985f, 0.31368174f, 0.29028468f, 0.26671276f, 0.24298018f, 0.21910124f,
    0.19509032f, 0.17096189f, 0.14673047f, 0.12241068f, 0.09801714f, 0.07356456f, 0.04906767f, 0.02454123f,
    0.00000000f, -0.02454123f, -0.04906767f, -0.07356456f, -0.09801714f, -0.12241068f, -0.14673047f, -0.17096189f,
    -0.19509032f, -0.21910124f, -0.24298018f, -0.26671276f, -0.29028468f, -0.31368174f, -0.33688985f, -0.35989504f,
    -0.38268343f, -0.40524131f, -0.42755509f, -0.44961133f, -0.47139674f, -0.49289819f, -0.51410274f, -0.53499762f,
    -0.55557023f, -0.57580819f, -0.59569930f, -0.61523159f, -0.63439328f, -0.65317284f, -0.67155895f, -0.68954054f,
    -0.70710678f, -0.72424708f, -0.74095113f, -0.75720885f, -0.77301045f, -0.78834643f, -0.80320753f, -0.81758481f,
    -0.83146961f, -0.84485357f, -0.85772861f, -0.87008699f, -0.88192126f, -0.89322430f, -0.90398929f, -0.91420976f,
    -0.92387953f, -0.93299280f, -0.94154407f, -0.94952818f, -0.95694034f, -0.96377607f, -0.97003125f, -0.97570213f,
    -0.98078528f, -0.98527764f, -0.98917651f, -0.99247953f, -0.99518473f, -0.99729046f, -0.99879546f, -0.99969882f,
    -1.00000000f, -0.99969882f, -0.99879546f, -0.99729046f, -0.99518473f, -0.99247953f, -0.98917651f, -0.98527764f,
    -0.98078528f, -0.97570213f, -0.97003125f, -0.96377607f, -0.95694034f, -0.94952818f, -0.94154407f, -0.93299280f,
    -0.92387953f, -0.91420976f, -0.90398929f, -0.89322430f, -0.88192126f, -0.87008699f, -0.85772861f, -0.84485357f,
    -0.83146961f, -0.81758481f, -0.80320753f, -0.78834643f, -0.77301045f, -0.75720885f, -0.74095113f, -0.72424708f,
    -0.70710678f, -0.68954054f, -0.67155895f, -0.65317284f, -0.63439328f, -0.61523159f, -0.59569930f, -0.57580819f,
    -0.55557023f, -0.53499762f, -0.51410274f, -0.49289819f, -0.47139674f, -0.44961133f, -0.42755509f, -0.40524131f,
    -0.38268343f, -0.35989504f, -0.33688985f, -0.31368174f, -0.29028468f, -0.26671276f, -0.24298018f, -0.21910124f,
    -0.19509032f, -0.17096189f, -0.14673047f, -0.12241068f, -0.09801714f, -0.07356456f, -0.04906767f, -0.02454123f,
    -0.00000000f,
};

// Fast sine with interpolation
float sinf(float x) {
    float u = x * (N / (2.0f * 3.14159265358979323846f));
    float ui = u >= 0 ? u : u - (int)u - 1;
    int i0 = ((int)ui) & (N - 1);
    float f = ui - (int)ui;
    float y0 = sin_tab[i0];
    float y1 = sin_tab[i0 + 1];
    return y0 + (y1 - y0) * f;
}

// Fast cosine via phase shift
float cosf(float x) {
    return sinf(x + 1.57079632679489661923f); // + π/2
}

typedef struct {
    int quotient;
    int remainder;
} divmod_result;

// __aeabi_idivmod: FIXME this likely needs to return values in registers
divmod_result aeabi_idivmod(int dividend, int divisor) {
    divmod_result result;
    unsigned int quotient = 0;
    unsigned int remainder = 0;

    // If the divisor is 0, division by zero error should be handled
    if (divisor == 0) {
        // Handle division by zero error (return quotient as 0, remainder as dividend)
        result.quotient = 0;
        result.remainder = remainder;
        return result;
    }

    // Ensure we work with positive values for simplicity
    int sign = 1;
    if (dividend < 0) {
        dividend = -dividend;
        sign = -sign;
    }
    if (divisor < 0) {
        divisor = -divisor;
        sign = -sign;
    }

    // Loop over bit positions, simulating long division
    for (int i = 31; i >= 0; i--) {
        // Shift the remainder left and bring in the next bit (simulate multiplication by 2)
        remainder <<= 1;
	remainder |= !! ((1 << i) & dividend);
        int bit = (remainder >= divisor);  // Compare remainder with divisor
        remainder -= bit * divisor;  // Subtract divisor if the bit was set
        quotient |= (bit << i);  // Set the bit in the quotient
    }

    // Apply the sign to the quotient
    result.quotient = sign * quotient;
    result.remainder = sign * remainder;
    
    return result;
}

int __aeabi_idiv(int dividend, int divisor) {
	divmod_result result = aeabi_idivmod(dividend, divisor);
	return result.quotient;
}

typedef struct {
    long long quotient;
    long long remainder;
} ldivmod_result;

// __aeabi_idivmod: FIXME this likely needs to return values in registers
ldivmod_result __aeabi_ldivmod(long long dividend, long long divisor) {
    ldivmod_result result;
    unsigned long long quotient = 0;
    unsigned long long remainder = 0;

    // If the divisor is 0, division by zero error should be handled
    if (divisor == 0) {
        // Handle division by zero error (return quotient as 0, remainder as dividend)
        result.quotient = 0;
        result.remainder = remainder;
        return result;
    }

    // Ensure we work with positive values for simplicity
    int sign = 1;
    if (dividend < 0) {
        dividend = -dividend;
        sign = -sign;
    }
    if (divisor < 0) {
        divisor = -divisor;
        sign = -sign;
    }

    // Loop over bit positions, simulating long division
    for (int i = 63; i >= 0; i--) {
        // Shift the remainder left and bring in the next bit (simulate multiplication by 2)
        remainder <<= 1;
	remainder |= !! ((1 << i) & dividend);
        int bit = (remainder >= divisor);  // Compare remainder with divisor
        remainder -= bit * divisor;  // Subtract divisor if the bit was set
        quotient |= (bit << i);  // Set the bit in the quotient
    }

    // Apply the sign to the quotient
    result.quotient = sign * quotient;
    result.remainder = sign * remainder;
    
    return result;
}
