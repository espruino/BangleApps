/*
 * AVWX Bangle Module
 *
 * AVWX doco: https://avwx.docs.apiary.io/
 * test AVWX API request with eg.: curl -X GET 'https://avwx.rest/api/metar/43.9844,-88.5570?token=...'
 *
 */


const AVWX_BASE_URL = 'https://avwx.rest/api/';   // must end with a slash
const AVWX_CONFIG_FILE = 'avwx.json';


// read in the settings
var AVWXsettings = Object.assign({
  AVWXtoken: '',
}, require('Storage').readJSON(AVWX_CONFIG_FILE, true) || {});


/**
 * Make an AVWX API request
 *
 * @param    {string}    requestPath   API path (after /api/), eg. 'meta/KOSH'
 * @param    {string}    params        optional request parameters, eg. 'onfail=nearest' (use '&' in the string to combine multiple params)
 * @param    {function}  successCB     callback if the API request was successful - will supply the returned data: successCB(data)
 * @param    {function}  failCB        callback in case the API request failed - will supply the error: failCB(error)
 *
 * @returns  {number}                  the HTTP request ID
 *
 * Example:
 *  reqID = avwx.request('metar/'+lat+','+lon,
 *                       'filter=sanitized&onfail=nearest',
 *                       data => { console.log(data); },
 *                       error => { console.log(error); });
 *
 */
exports.request = function(requestPath, optParams, successCB, failCB) {
  if (! AVWXsettings.AVWXtoken) {
    failCB('No AVWX API Token defined!');
    return undefined;
  }
  let params = 'token='+AVWXsettings.AVWXtoken;
  if (optParams)
    params += '&'+optParams;
  return Bangle.http(AVWX_BASE_URL+requestPath+'?'+params).then(successCB).catch(failCB);
};

