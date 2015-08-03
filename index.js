/* global require, module */
'use strict';

var util = require('util');
var stream = require('stream');

function SocketIoSerialPort(options) {
  this.client = options.client;
  this.device = options.device || {};

  this.buffer = null;

  var self = this;

  this.client.on('device-data-read', function(data) {
    try {
      console.log('received', data);
      if (data.buffer && data.device.channel == self.device.channel &&
        data.device.address == self.device.address) {
        self.emit('data', data.buffer);
        console.log('data read');
      }

    } catch (exp) {
      console.log('error on message', exp);
      //self.emit('error', 'error receiving message: ' + exp);
    }
  });

}

util.inherits(SocketIoSerialPort, stream.Stream);

SocketIoSerialPort.prototype.open = function(callback) {
  console.log('open');
  this.client.emit('device-connect', this.device, callback);
};

SocketIoSerialPort.prototype.write = function(data, callback) {

  console.log('sending data:', data);

  var sendObj = {};
  sendObj.device = this.device;
  sendObj.buffer = data;

  this.client.emit('device-data-write', sendObj, callback);
};

SocketIoSerialPort.prototype.close = function(callback) {
  console.log('closing');
  this.client.emit('device-disconnect', this.device, callback);
};

SocketIoSerialPort.prototype.flush = function(callback) {
  console.log('flush');
  if (callback) {
    callback();
  }
};

SocketIoSerialPort.prototype.drain = function(callback) {
  console.log('drain');
  if (callback) {
    callback();
  }
};

module.exports = {
  SerialPort: SocketIoSerialPort
};
