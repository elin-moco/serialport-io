SocketIoSerialPort
=============

A virtual [node-serialport] implementation that uses [socket.io] as the transport.

# Prerequisites

First you need [git] and [node.js] to clone this repo and install dependencies:
```
git clone https://github.com/elin-moco/serialport-io
cd serialport-io
npm install
```

Secondly, you'll need an [Arduino] board with [StandardFirmata],
put an LED on pin 7, connect Arduino to you computer via USB cable.

To use socket.io to send/receive data to the device with [firmata] or [Johnny Five],
run below gulp tasks to [browserify] them like:
```
gulp build
```

You'll find the browserified scripts in `build` folder 

# Running Server
```
node server.js
```
Will get you started, server is listening on port 3000 by default.
This server pass data bewteen browser and node.js to control your device,
make sure your server is running before running your code in browser or node.js.

# Use with Johnny Five

Include Johnny Five bundle script in your html file:
```js
  <script src="http://localhost:3000/socket.io/socket.io.js"></script>
  <script type="text/javascript" src="j5-bundle.js"></script>
```
```javascript
var SocketIoSerialPort = require('serialport-io').SerialPort;
var five = require('johnny-five');
```

Then use it directly in your script:
```javascript
var socket = io('ws://localhost:3000');

var sp = new SocketIoSerialPort({
  client: socket,
  device: {   //put your device channel/address here
    channel: 'serial',
    address: '/dev/cu.usbmodem1411'
  }
});

sp.connect().then(function() {
  console.log('SocketIoSerialPort.open');
  // have a ready serial port, do something with it:
  var board = new five.Board({port: sp, repl: false});
  board.on('ready', function() {
    console.log('actually connected to an arduino!');
    var led = new five.Led(7);
    led.blink();
  });
});

```

And you should see the LED blinks once you have the webapp(page) opened.
Or you can open example/browser-j5.html directly to see live demo.

# Use with Firmata

Include the firmata bundle script in your html file:
```html
  <script src="http://localhost:3000/socket.io/socket.io.js"></script>
  <script type="text/javascript" src="firmata-bundle.js"></script>
```
To use with [node.js], you'll need these two require statements:
```javascript
var SocketIoSerialPort = require('serialport-io').SerialPort;
var firmata = require('firmata');
```

Then use it directly in your script:
```javascript
var socket = io('ws://localhost:3000');

var sp = new SocketIoSerialPort({
  client: socket,
  device: {   //put your device channel/address here
    channel: 'serial',
    address: '/dev/cu.usbmodem1411'
  }
});

sp.connect().then(function() {
  console.log('SocketIoSerialPort.open');
  // have a ready serial port, do something with it:
  var board = new firmata.Board(sp);
  board.on('ready', function() {
    console.log('actually connected to an arduino!');
    board.digitalWrite(7, 1);
  });
});

```

And you should see the LED on once you have the webapp(page) opened.
Or you can open example/browser-firmata.html directly to see live demo.

# USB port address

If you don't know which USB port connects to your Arduino,  
you can find it in [Arduino IDE] under 'Tools' menu.


The port pattern on different platform will be:

OSX: /dev/tty.usbmodem\*\*\*\*

Linux: /dev/ttyUSB\*

Windows: COM\*

# See Also

See [ble-serialport] if you are interested in running j5/firmata on Firefox OS
via BLE.

[BLE]: https://en.wikipedia.org/wiki/Bluetooth_low_energy
[Arduino]: http://arduino.cc/
[Arduino IDE]: https://www.arduino.cc/en/main/software
[BleShield]: http://redbearlab.com/bleshield/
[node-serialport]: https://github.com/voodootikigod/node-serialport
[ble-serialport]: https://github.com/elin-moco/ble-serialport
[firmata]: https://github.com/jgautier/firmata/ 
[Johnny Five]: http://github.com/rwaldron/johnny-five/ 
[StandardFirmata]: https://github.com/firmata/arduino/tree/master/examples/StandardFirmata
[browserify]: http://browserify.org/ 
[node.js]: https://nodejs.org/
[git]: https://git-scm.com/
[socket.io]: http://socket.io/
