{
  let bpm_corrected; // result of algorithm

  const updateHrm = (bpm) => {
    bpm_corrected = bpm;
  };

  Bangle.on('HRM', (hrm) => {
    if (bpm_corrected > 0) {
      // replace bpm data in event
      hrm.bpm_orig = hrm.bpm;
      hrm.confidence_orig = hrm.confidence;
      hrm.bpm = bpm_corrected;
      hrm.confidence = 0;
    }
  });

  let run = () => {
    const settings = Object.assign({
        mAremoval: 0
    }, require("Storage").readJSON("hrmmar.json", true) || {});

    // select motion artifact removal algorithm
    switch(settings.mAremoval) {
      case 1:
        require("hrmfftelim").run(settings, updateHrm);
      break;
    }
  }

  // override setHRMPower so we can run our code on HRM enable
  const oldSetHRMPower = Bangle.setHRMPower;
  Bangle.setHRMPower = function(on, id) {
    if (on && run !== undefined) {
      run();
      run = undefined; // Make sure we run only once
    }
    return oldSetHRMPower(on, id);
  };
}
