/* global require */
'use strict';

(function(exports) {
  exports.SocketIoSerialPort = require('./index').SerialPort;
  exports.SocketIoFirefox = require('./index').Firefox;
  exports.five = require('johnny-five');
}(window));
