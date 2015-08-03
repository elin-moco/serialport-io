/* global require */
'use strict';

(function(exports) {
  exports.SocketIoSerialPort = require('./index').SerialPort;
  exports.firmata = require('firmata');
}(window));
