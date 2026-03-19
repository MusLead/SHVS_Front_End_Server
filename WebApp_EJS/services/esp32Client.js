var config = require('../config');

function createHttpError(message, statusCode) {
  var error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function readErrorMessage(response) {
  try {
    var body = await response.text();
    return body || ('ESP32 request failed with status ' + response.status);
  } catch (err) {
    return 'ESP32 request failed with status ' + response.status;
  }
}

async function request(path, options, responseType) {
  var response;
  var requestOptions = options || {};
  var type = responseType || 'json';

  try {
    response = await fetch(config.esp32BaseUrl + path, requestOptions);
  } catch (err) {
    throw createHttpError('ESP32 not reachable', 502);
  }

  if (!response.ok) {
    throw createHttpError(await readErrorMessage(response), response.status);
  }

  return type === 'text' ? response.text() : response.json();
}

function getSensors() {
  return request('/api/v1/sensors');
}

function getStatus() {
  return request('/api/v1/status');
}

function setMode(mode) {
  return request('/api/v1/mode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: mode })
  }, 'text');
}

function setActuators(payload) {
  return request('/api/v1/actuators', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }, 'text');
}

function getSchedule() {
  return request('/api/v1/schedule');
}

function setSchedule(payload) {
  return request('/api/v1/schedule', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }, 'text');
}

module.exports = {
  getSensors: getSensors,
  getStatus: getStatus,
  setMode: setMode,
  setActuators: setActuators,
  getSchedule: getSchedule,
  setSchedule: setSchedule
};
