/* global io,SocketIoSerialPort,firmata */
'use strict';

var socket = io('ws://localhost:3000');

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

var toggle = document.getElementById('led-toggle');

sp.connect().then(function() {
  // have a ready serial port, do something with it:
  var board = new firmata.Board(sp);
  board.on('ready', function() {
    board.digitalWrite(7, 1);
    toggle.addEventListener('change', function() {
      board.digitalWrite(7, this.checked);
    });
  });
});
