var socket = io();

angular.module('Macchiato', [
    'ui.bootstrap',
    'socket-io',
    'ngLodash',
    'ngCookies',
    'Macchiato.Controllers'
]);

var macchiatoControllers = angular.module('Macchiato.Controllers', []);