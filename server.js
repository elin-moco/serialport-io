/* global require, Buffer */
'use strict';

var Server = require('socket.io');
var io = new Server(3000);
var SerialPort = require('serialport').SerialPort;
//var SERIAL_PORT = process.env.SERIAL_PORT || '/dev/cu.usbmodem1411';

var allDevices = {};

io.on('connection', function(socket) {
  console.log('socket connected');
  var connectedDevices = [];

  //write data to device
  socket.on('device-data-write', function(data, callback) {
    try {
      if (data.buffer) {
        var deviceKey = data.device.channel + ':' + data.device.address;
        if (connectedDevices.indexOf(deviceKey) >= 0 && allDevices[deviceKey]) {
          allDevices[deviceKey].write(data.buffer);
        }
        if (callback) {
          callback();
        }
      }
    } catch (exp) {
      console.error('error reading message', data.device, exp);
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
      } else if (device.channel == 'ble') {
        //TODO: Initialize BLE serial port
      }
      if (sp) {
        sp.on('data', function(data) {
          if (!Buffer.isBuffer(data)) {
            data = new Buffer(data);
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
    } catch (exp) {
      console.log('error connecting device', device, exp);
    }
  });

  socket.on('device-disconnect', function(device, callback) {
    try {
      console.log('device connected');
      //reset and clear device
      var deviceKey = device.channel + ':' + device.address;
      allDevices[deviceKey].write(new Uint8Array([0xFF]));
      connectedDevices.splice(connectedDevices.indexOf(deviceKey), 1);
      if (callback) {
        callback();
      }
    } catch (exp) {
      console.log('error disconnecting device', device, exp);
    }
  });

  socket.on('disconnect', function () {
    console.log('socket disconnected');
    //reset and clear all connected devices
    connectedDevices.forEach(function(deviceKey) {
      allDevices[deviceKey].write(new Uint8Array([0xFF]));
    });
    connectedDevices = [];
  });
});
console.log('server ready');
