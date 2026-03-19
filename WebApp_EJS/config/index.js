var defaultEsp32Ip = '192.168.0.130';
var esp32Ip = process.env.ESP32_IP || defaultEsp32Ip;

module.exports = {
  webserver: process.env.WEBSERVER || '127.0.0.1',
  esp32BaseUrl: process.env.ESP32_BASE_URL || ('http://' + esp32Ip)
};
