var applicationModule = require("application");
require("./services/league.js")

var imageCache = require("nativescript-web-image-cache");
if (applicationModule.android) {
    applicationModule.onLaunch = function (intent) {
            imageCache.initialize();
    };
}

// Refresh cache when app is loaded.
imageCache.clearCache();


applicationModule.start({ moduleName: "views/login/login" });
