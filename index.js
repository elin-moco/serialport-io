/* global require, module */
'use strict';

var util = require('util');
var stream = require('stream');

function SocketIoSerialPort(options) {
  this.client = options.client;
  this.device = options.device || {};

  this.buffer = null;

  var self = this;
  var START_SYSEX = 0xF0;
  var END_SYSEX = 0xF7;

  this.client.on('device-data-read', function(data) {
    try {
      //Make sure we only get data that's targeting this device
      if (data.buffer && data.device.channel == self.device.channel &&
        data.device.address == self.device.address) {
        data = new Uint8Array(data.buffer);
        if (null !== self.buffer) {
          self.buffer = self._concatBuffer(self.buffer, data);
          if (data[data.length - 1] === END_SYSEX) {
            //end of SYSEX response
            self.emit('data', self.buffer);
            self.buffer = null;
          }
        } else if (data[0] === START_SYSEX &&
          data[data.length - 1] !== END_SYSEX) {
          //SYSEX response incomplete, wait for END_SYSEX byte
          self.buffer = data;
        } else {
          self.emit('data', data);
        }
      }
    } catch (e) {
      console.log('error on message', e);
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
  try {
    var sendObj = {};
    sendObj.device = this.device;
    sendObj.buffer = data;

    this.client.emit('device-data-write', sendObj, callback);
  } catch (e) {
    console.log('error on message', e);
    //self.emit('error', 'error receiving message: ' + exp);
  }
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

SocketIoSerialPort.prototype._concatBuffer = function(buffer1, buffer2) {
  var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
  tmp.set(buffer1 , 0);
  tmp.set(buffer2, buffer1.byteLength);
  return tmp;
};

function SocketIoFirefox(socket) {
  this.client = socket;
}

SocketIoFirefox.prototype.listDevices = function(callback) {
  this.client.emit('list-fxos-devices', callback);
};

SocketIoFirefox.prototype.connectDevice =
  function(port, callback) {
    this.client.emit('connect-fxos-device', port, callback);
  };

SocketIoFirefox.prototype.deployOnDevice =
  function(app, callback) {
    this.client.emit('deploy-on-fxos-device', app, callback);
  };

module.exports = {
  SerialPort: SocketIoSerialPort,
  Firefox: SocketIoFirefox
};
