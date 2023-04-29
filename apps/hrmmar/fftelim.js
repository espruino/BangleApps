exports.run = (settings, updateHrm, isInternal) => {
  const SAMPLE_RATE = 12.5;
  const NUM_POINTS = 256; // fft size
  const ACC_PEAKS = 2; // remove this number of ACC peaks

  // ringbuffers
  const hrmvalues = new Int16Array(8*SAMPLE_RATE);
  const accvalues = new Int16Array(8*SAMPLE_RATE);
  // fft  buffers
  const hrmfftbuf = new Int16Array(NUM_POINTS);
  const accfftbuf = new Int16Array(NUM_POINTS);
  let BPM_est_1 = 0;
  let BPM_est_2 = 0;

  let hrmdata;
  let idx=0, wraps=0;

  // init settings
  Bangle.setOptions({hrmPollInterval: 40, powerSave: false}); // hrm=25Hz
  Bangle.setPollInterval(80); // 12.5Hz

  calcfft = (values, idx, normalize, fftbuf) => {
    fftbuf.fill(0);
    let i_out=0;
    let avg = 0;
    if (normalize) {
      const sum = values.reduce((a, b) => a + b, 0);
      avg = sum/values.length;
    }
    // sort ringbuffer to fft buffer
    for(let i_in=idx; i_in<values.length; i_in++, i_out++) {
      fftbuf[i_out] = values[i_in]-avg;
    }
    for(let i_in=0; i_in<idx; i_in++, i_out++) {
      fftbuf[i_out] = values[i_in]-avg;
    }

    E.FFT(fftbuf);
    return fftbuf;
  };

  getMax = (values) => {
    let maxVal = -Number.MAX_VALUE;
    let maxIdx = 0;

    values.forEach((value,i) => {
      if (value > maxVal) {
        maxVal = value;
        maxIdx = i;
      }
    });
    return {idx: maxIdx, val: maxVal};
  };

  getSign = (value) => {
    return value < 0 ? -1 : 1;
  };

  // idx in fft buffer to frequency
  getFftFreq = (idx, rate, size) => {
    return idx*rate/(size-1);
  };

  // frequency to idx in fft buffer
  getFftIdx = (freq, rate, size) => {
    return Math.round(freq*(size-1)/rate);
  };

  calc2ndDeriative = (values) => {
    const result = new Int16Array(values.length-2);
    for(let i=1; i<values.length-1; i++) {
      const diff = values[i+1]-2*values[i]+values[i-1];
      result[i-1] = diff;
    }
    return result;
  };

  const minFreqIdx = getFftIdx(1.0, SAMPLE_RATE, NUM_POINTS); // 60 BPM
  const maxFreqIdx = getFftIdx(3.0, SAMPLE_RATE, NUM_POINTS); // 180 BPM
  let rangeIdx = [0, maxFreqIdx-minFreqIdx]; // range of search for the next estimates
  const freqStep=getFftFreq(1, SAMPLE_RATE, NUM_POINTS)*60;
  const maxBpmDiffIdxDown = Math.ceil(5/freqStep); // maximum down BPM
  const maxBpmDiffIdxUp = Math.ceil(10/freqStep); // maximum up BPM

  calculate = (idx) => {
    // fft
    const ppg_fft = calcfft(hrmvalues, idx, true, hrmfftbuf).subarray(minFreqIdx, maxFreqIdx+1);
    const acc_fft = calcfft(accvalues, idx, false, accfftbuf).subarray(minFreqIdx, maxFreqIdx+1);

    // remove spectrum that have peaks in acc fft from ppg fft
    const accGlobalMax = getMax(acc_fft);
    const acc2nddiff = calc2ndDeriative(acc_fft); // calculate second derivative
    for(let iClean=0; iClean < ACC_PEAKS; iClean++) {
      // get max peak in ACC
      const accMax = getMax(acc_fft);

      if (accMax.val >= 10 && accMax.val/accGlobalMax.val > 0.75) {
        // set all values in PPG FFT to zero until second derivative of ACC has zero crossing
        for (let k = accMax.idx-1; k>=0; k--) {
          ppg_fft[k] = 0;
          acc_fft[k] = -Math.abs(acc_fft[k]); // max(acc_fft) should no longer find this
          if (k-2 > 0 && getSign(acc2nddiff[k-1-2]) != getSign(acc2nddiff[k-2]) && Math.abs(acc_fft[k]) < accMax.val*0.75) {
            break;
          }
        }
        // set all values in PPG FFT to zero until second derivative of ACC has zero crossing
        for (let k = accMax.idx; k < acc_fft.length-1; k++) {
          ppg_fft[k] = 0;
          acc_fft[k] = -Math.abs(acc_fft[k]); // max(acc_fft) should no longer find this
          if (k-2 >= 0 && getSign(acc2nddiff[k+1-2]) != getSign(acc2nddiff[k-2]) && Math.abs(acc_fft[k]) < accMax.val*0.75) {
            break;
          }
        }
      }
    }

    // bpm result is maximum peak in PPG fft
    const hrRangeMax = getMax(ppg_fft.subarray(rangeIdx[0], rangeIdx[1]));
    const hrTotalMax = getMax(ppg_fft);
    const maxDiff = hrTotalMax.val/hrRangeMax.val;
    let idxMaxPPG = hrRangeMax.idx+rangeIdx[0]; // offset range limit

    if ((maxDiff > 3 && idxMaxPPG != hrTotalMax.idx) || hrRangeMax.val === 0) { // prevent tracking from loosing the real heart rate by checking the full spectrum
      if (hrTotalMax.idx > idxMaxPPG) {
        idxMaxPPG = idxMaxPPG+Math.ceil(6/freqStep); // step 6 BPM up into the direction of max peak
      } else {
        idxMaxPPG = idxMaxPPG-Math.ceil(2/freqStep); // step 2 BPM down into the direction of max peak
      }
    }

    idxMaxPPG = idxMaxPPG + minFreqIdx;
    const BPM_est_0 = getFftFreq(idxMaxPPG, SAMPLE_RATE, NUM_POINTS)*60;

    // smooth with moving average
    let BPM_est_res;
    if (BPM_est_2 > 0) {
      BPM_est_res = 0.9*BPM_est_0 + 0.05*BPM_est_1 + 0.05*BPM_est_2;
    } else {
      BPM_est_res = BPM_est_0;
    }

    return BPM_est_res.toFixed(1);
  };

  Bangle.on('HRM-raw', (hrm) => {
    hrmdata = hrm;
  });

  Bangle.on('accel', (acc) => {
    if (hrmdata !== undefined && isInternal(hrmdata)) {
      hrmvalues[idx] = hrmdata.filt;
      accvalues[idx] = acc.x*1000 + acc.y*1000 + acc.z*1000;
      idx++;
      if (idx >= 8*SAMPLE_RATE) {
        idx = 0;
        wraps++;
      }

      if (idx % (SAMPLE_RATE*2) == 0) { // every two seconds
        if (wraps === 0) { // use rate of firmware until hrmvalues buffer is filled
          updateHrm(undefined);
          BPM_est_2 = BPM_est_1;
          BPM_est_1 = hrmdata.bpm;
        } else {
          let bpm_result;
          if (hrmdata.confidence >= 90) { // display firmware value if good
            bpm_result = hrmdata.bpm;
            updateHrm(undefined);
          } else {
            bpm_result = calculate(idx);
            bpm_corrected = bpm_result;
            updateHrm(bpm_result);
          }
          BPM_est_2 = BPM_est_1;
          BPM_est_1 = bpm_result;

          // set search range of next BPM
          const est_res_idx = getFftIdx(bpm_result/60, SAMPLE_RATE, NUM_POINTS)-minFreqIdx;
          rangeIdx = [est_res_idx-maxBpmDiffIdxDown, est_res_idx+maxBpmDiffIdxUp];
          if (rangeIdx[0] < 0) {
            rangeIdx[0] = 0;
          }
          if (rangeIdx[1] > maxFreqIdx-minFreqIdx) {
            rangeIdx[1] = maxFreqIdx-minFreqIdx;
          }
        }
      }
    }
  });
};
