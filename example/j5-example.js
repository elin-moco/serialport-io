/* global io,SocketIoSerialPort,five */
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

    //var proximity = new five.Proximity({
    //  pin: 'A0'
    //});
    //var proximityInput = document.getElementById('proximity');
    //proximity.on("data", function() {
    //  proximityInput.value = this.cm + 'cm';
    //});

    //Need another firmware for this
    //var proximity = new five.Ping({
    //  pin: 7
    //});
    //var proximityInput = document.getElementById('proximity');
    //ping.on("change", function() {
    //  proximityInput.value = this.cm + 'cm';
    //});

    //var servo = new five.Servo(10);
    //servo.min();
    //var servoInput = document.getElementById('servo');
    //servoInput.addEventListener('change', function() {
    //  servo.to(this.value);
    //});

    //var button = new five.Button(2);
    //var buttonInput = document.getElementById('switch');
    //button.on("down", function() {
    //  buttonInput.checked = true;
    //});
    //
    //button.on("up", function() {
    //  buttonInput.checked = false;
    //});

    //var heart = [
    //  "01100110",
    //  "10011001",
    //  "10000001",
    //  "10000001",
    //  "01000010",
    //  "00100100",
    //  "00011000",
    //  "00000000"
    //];
    //
    //var matrix = new five.Led.Matrix({
    //  pins: {
    //    data: 2,
    //    clock: 3,
    //    cs: 4
    //  }
    //});
    //
    //matrix.on();
    //matrix.draw(heart);
    //var msg = "johnny-five".split("");
    //function next() {
    //  var c;
    //
    //  if (c = msg.shift()) {
    //    matrix.draw(c);
    //    setTimeout(next, 1000);
    //  }
    //}
    //next();
  });
});
