/* global require, Buffer */
'use strict';

var Server = require('socket.io');
var io = new Server(3000);
//var SERIAL_PORT = process.env.SERIAL_PORT || '/dev/cu.usbmodem1411';
var SerialPort = require('serialport').SerialPort;
var BleSerialPort = require('ble-serialport').SerialPort;
var firefox = require('node-firefox');
var fxosClient;

var allDevices = {};

io.on('connection', function(socket) {
  console.log('socket connected');
  var connectedDevices = [];

  function _toBuffer(ab) {
    var buffer = new Buffer(ab.byteLength);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) {
      buffer[i] = view[i];
    }
    return buffer;
  }

  function initDevice(sp, device, callback) {
    if (sp) {
      sp.on('data', function(data) {
        if (!Buffer.isBuffer(data)) {
          if (data instanceof ArrayBuffer) {
            data = _toBuffer(data);
          } else if (data instanceof Uint8Array) {
            data = _toBuffer(data.buffer);
          } else {
            throw 'Unsupported read data type ' + data.constructor.name +
            ', must be Uint8Array, ArrayBuffer or Buffer';
          }
        }

        var sendObj = {};
        sendObj.device = device;
        sendObj.buffer = data;

        io.emit('device-data-read', sendObj);
      });
      var deviceKey = device.channel + ':' + device.address;
      allDevices[deviceKey] = sp;
      connectedDevices.push(deviceKey);
    }

    if (callback) {
      callback();
    }
  }

  //write data to device
  socket.on('device-data-write', function(data, callback) {
    var device = data.device;
    var deviceKey = device.channel + ':' + device.address;
    data = data.buffer;
    if (!(data instanceof Buffer)) {
      throw 'Unsupported write data type ' + data.constructor.name +
      ', must be Buffer';
    }
    if (connectedDevices.indexOf(deviceKey) >= 0 && allDevices[deviceKey]) {
      //allDevices[deviceKey].write(new Uint8Array(data.buffer.data));
      allDevices[deviceKey].write(data);
    }
    if (callback) {
      callback();
    }
  });

  socket.on('device-connect', function(device, callback) {
    try {
      console.log('device connected');
      //read data from device
      var sp;
      if (device.channel == 'serial') {
        sp = new SerialPort(device.address, {
          baudrate: 57600,
          buffersize: 1
        });
        initDevice(sp, device, callback);
      } else if (device.channel == 'ble') {
        //Initialize BLE serial port
        sp = new BleSerialPort(device);
        sp.connect().then(function() {
          initDevice(sp, device, callback);
        });
      }
    } catch (exp) {
      console.log('error connecting device', device, exp);
    }
  });

  socket.on('device-disconnect', function(device, callback) {
    try {
      console.log('device disconnected');
      //reset and clear device
      var deviceKey = device.channel + ':' + device.address;
      var sp = allDevices[deviceKey];
      sp.write(new Uint8Array([0xFF]));
      if (sp.disconnect) {
        sp.disconnect().then(function() {
          console.log('disconnect serialport');
        });
      }
      connectedDevices.splice(connectedDevices.indexOf(deviceKey), 1);
      if (callback) {
        callback();
      }
    } catch (exp) {
      console.log('error disconnecting device', device, exp);
    }
  });

  socket.on('list-fxos-devices', function(callback, errorCallback) {
    console.log('list fxos devices');
    firefox.findDevices().then(firefox.forwardPorts).then(function(result) {
      if (callback) {
        console.log('list fxos devices callback');
        callback(result);
      }
    }).catch(function() {
      if (errorCallback) {
        errorCallback();
      }
    });
  });

  socket.on('connect-fxos-device', function(port, callback, errorCallback) {
    console.log('connect fxos device');
    firefox.connect(port).then(function(client) {
      fxosClient = client;
      if (callback) {
        callback();
      }
    }).catch(function() {
      if (errorCallback) {
        errorCallback();
      }
    });
  });

  socket.on('deploy-on-fxos-device', function(app, callback, errorCallback) {
    console.log('install on fxos device');
    firefox.installApp({
      //appPath: '/Users/yshlin/Source/ble-explorer',
      appPath: app,
      client: fxosClient
    }).then(function(appId) {
      console.log('App was installed with appId = ', appId);
      if (callback) {
        callback(appId);
      }
    }, function(error) {
      console.error('App could not be installed: ', error);
      if (errorCallback) {
        errorCallback();
      }
    });
  });

  socket.on('disconnect', function() {
    console.log('socket disconnected');
    //reset and clear all connected devices
    connectedDevices.forEach(function(deviceKey) {
      allDevices[deviceKey].write(new Uint8Array([0xFF]));
    });
    connectedDevices = [];
  });
});
console.log('server ready');
