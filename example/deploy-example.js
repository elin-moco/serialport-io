/* global io,SocketIoFirefox */
'use strict';

var socket = io('ws://localhost:3000');
var fx = new SocketIoFirefox(socket);
var devicesElem = document.getElementById('devices');

fx.listDevices(function(result) {
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
        fx.connectDevice(parseInt(this.getAttribute('data-port')), function() {
          console.log('FxOS device connected!');
        });
      });
      var btn2 = document.createElement('button');
      btn2.setAttribute('class', 'install');
      btn2.innerHTML = 'Install';
      btn2.addEventListener('click', function(appId) {
        fx.deployOnDevice('/Users/yshlin/Source/ble-explorer',
          function(appId) {
            console.log('App ' + appId + ' deployed on FxOS devie!');
          }
        );
      });
      li.appendChild(btn);
      li.appendChild(btn2);
      devicesElem.appendChild(li);
    });
  }
});
