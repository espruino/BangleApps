const storage = require('Storage');

exports.load = function () {
  const medicalinfo = storage.readJSON('medicalinfo.json') || {
    bloodType: "",
    height: "",
    weight: "",
    medicalAlert: [""]
  };

  // Don't return anything unexpected
  const expectedMedicalinfo = [
    "bloodType",
    "height",
    "weight",
    "medicalAlert"
  ].filter(key => key in medicalinfo)
    .reduce((obj, key) => (obj[key] = medicalinfo[key], obj), {});

  return expectedMedicalinfo;
};
