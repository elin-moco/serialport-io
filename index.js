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

        if (data.buffer instanceof ArrayBuffer) {
          data = new Uint8Array(data.buffer);
        }
        else {
          data = new Uint8Array(self._toArrayBuffer(data.buffer));
        }
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

SocketIoSerialPort.prototype.connect = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    try {
      self.client.emit('device-connect', self.device, function() {
        resolve();
      });
    } catch(e) {
      reject(e);
    }
  });
};

SocketIoSerialPort.prototype.disconnect = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    try {
      self.client.emit('device-disconnect', self.device, function() {
        resolve();
      });
    } catch(e) {
      reject(e);
    }
  });
};

SocketIoSerialPort.prototype.write = function(data, callback) {
  if (data instanceof Uint8Array) {
    data = data.buffer;
  }
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

SocketIoSerialPort.prototype.open = function(callback) {
  if (callback) {
    callback();
  }
};

SocketIoSerialPort.prototype.close = function(callback) {
  if (callback) {
    callback();
  }
};

SocketIoSerialPort.prototype.flush = function(callback) {
  if (callback) {
    callback();
  }
};

SocketIoSerialPort.prototype.drain = function(callback) {
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

SocketIoSerialPort.prototype._toBuffer = function(ab) {
  var buffer = new Buffer(ab.byteLength);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buffer.length; ++i) {
    buffer[i] = view[i];
  }
  return buffer;
};

SocketIoSerialPort.prototype._toArrayBuffer = function(buffer) {
  var ab = new ArrayBuffer(buffer.length);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buffer.length; ++i) {
    view[i] = buffer[i];
  }
  return ab;
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
