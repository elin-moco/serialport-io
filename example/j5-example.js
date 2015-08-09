/* global io,SocketIoSerialPort,five */
'use strict';

var socket = io('ws://localhost:3000');

var sp = new SocketIoSerialPort({
  client: socket,
  device: {   //put your device channel/address here
    channel: 'serial',
    address: '/dev/cu.usbmodem1411'
  }
});

var toggle = document.getElementById('led-blink');

sp.open(function() {
  console.log('SocketIoSerialPort.open');
  // have a ready serial port, do something with it:
  var board = new five.Board({port: sp, repl: false});
  board.on('ready', function() {
    console.log('actually connected to an arduino!');
    var led = new five.Led(7);
    led.blink();
    toggle.addEventListener('change', function() {
      if (this.checked) {
        led.blink();
      }
      else {
        led.stop();
      }
    });
  });
});
