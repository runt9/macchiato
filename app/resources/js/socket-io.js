// Tiny wrapper around socket.io so we can dependency inject $socket everywhere as a singleton.
angular.module('socket-io', []).provider('$socket', function $socketProvider () {
    this.$get = function $socketFactory() {
        /* global io: true */
        return io();
    };
});