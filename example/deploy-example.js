/* global io,SocketIoSerialPort,firmata */
'use strict';

var socket = io('ws://localhost:3000');
var devicesElem = document.getElementById('devices');

socket.emit('list-fxos-devices', function(result) {
  if (result) {
    devicesElem.innerHTML = '';
    result.forEach(function(device) {
      console.log(device);
      var port = device.ports[0].port;
      var li = document.createElement('li');
      li.innerHTML = '<span>' + device.id + '</span>';
      var btn = document.createElement('button');
      btn.setAttribute('class', 'connect');
      btn.setAttribute('data-port', port);
      btn.innerHTML = 'Connect';
      btn.addEventListener('click', function() {
        socket.emit('connect-fxos-device',
          parseInt(this.getAttribute('data-port')), function() {
            console.log('FxOS device connected!');
          });
      });
      var btn2 = document.createElement('button');
      btn2.setAttribute('class', 'install');
      btn2.innerHTML = 'Install';
      btn2.addEventListener('click', function(appId) {
        socket.emit('deploy-on-fxos-device',
          '/Users/yshlin/Source/ble-explorer', function(appId) {
            console.log('App ' + appId + ' deployed on FxOS devie!');
          });
      });
      li.appendChild(btn);
      li.appendChild(btn2);
      devicesElem.appendChild(li);
    });

  }
});