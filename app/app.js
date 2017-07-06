var application = require("application");
require("nativescript-nodeify");
require("./prototypes/numbers.js")
require("./services/league.js")
var ScreepsAPI = require("./services/screeps.js")
var imageCache = require("nativescript-web-image-cache");

// Refresh cache when app is loaded.

application.on(application.launchEvent, function (args) {
  if (application.android) {
    imageCache.initialize();
    imageCache.clearCache();
  }

  var ScreepsSocket = ScreepsAPI.get_web_socket()
  if(!!ScreepsSocket.subscriptions && ScreepsSocket.subscriptions.length > 0) {
    ScreepsSocket.connect()
  }
})

application.on(application.suspendEvent, function (args) {
  ScreepsAPI.get_web_socket().disconnect()
})

application.on(application.resumeEvent, function (args) {
  var ScreepsSocket = ScreepsAPI.get_web_socket()
  if(!!ScreepsSocket.subscriptions && ScreepsSocket.subscriptions.length > 0) {
    ScreepsSocket.connect()
  }
})

application.on(application.exitEvent, function (args) {
  ScreepsAPI.get_web_socket().disconnect()
})


application.start({ moduleName: "views/login/login" });
