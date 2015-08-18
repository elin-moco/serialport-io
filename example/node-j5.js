/* global io,SocketIoSerialPort,five */
'use strict';

var io = require('socket.io-client');
var SocketIoSerialPort = require('../index').SerialPort;
var five = require('johnny-five');
var socket = io('http://localhost:3000');

var sp = new SocketIoSerialPort({
  client: socket,
  device: {   //put your device channel/address here
    channel: 'serial',
    address: '/dev/cu.usbmodem1411'
    //channel: 'ble',
    //name: 'BleFirmata',
    //address: 'd0:6a:cf:58:ee:bd'
  }
});

sp.connect().then(function() {
  // have a ready serial port, do something with it:
  var board = new five.Board({port: sp, repl: false});
  board.on('ready', function() {
    var led = new five.Led(7);
    led.blink();
  });
});
