var esp32Client = require('../services/esp32Client');

function createHttpError(message, statusCode) {
  var error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function parseMode(value) {
  var mode = Number(value);

  if (!Number.isInteger(mode) || ![0, 1, 2].includes(mode)) {
    throw createHttpError('mode must be 0, 1, or 2', 400);
  }

  return mode;
}

async function getSensors(req, res) {
  var data = await esp32Client.getSensors();
  res.json(data);
}

async function getStatus(req, res) {
  var data = await esp32Client.getStatus();
  res.json(data);
}

async function setMode(req, res) {
  var mode = parseMode(req.body.mode);
  var message = await esp32Client.setMode(mode);
  res.type('text/plain').send(message);
}

async function setActuators(req, res) {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    throw createHttpError('Actuator payload must be a JSON object', 400);
  }

  var message = await esp32Client.setActuators(req.body);
  res.type('text/plain').send(message);
}

async function getSchedule(req, res) {
  var data = await esp32Client.getSchedule();
  res.json(data);
}

async function setSchedule(req, res) {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    throw createHttpError('Schedule payload must be a JSON object', 400);
  }

  var message = await esp32Client.setSchedule(req.body);
  res.type('text/plain').send(message);
}

module.exports = {
  getSensors: getSensors,
  getStatus: getStatus,
  setMode: setMode,
  setActuators: setActuators,
  getSchedule: getSchedule,
  setSchedule: setSchedule
};
