var applicationModule = require("application");
require("nativescript-nodeify");
require("./services/league.js")

var imageCache = require("nativescript-web-image-cache");
if (applicationModule.android) {
    applicationModule.onLaunch = function (intent) {
            imageCache.initialize();
            imageCache.clearCache();
    };
}

// Refresh cache when app is loaded.


applicationModule.start({ moduleName: "views/login/login" });
