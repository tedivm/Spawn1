var ScreepsAPI = require('../../services/screeps.js')
var Session =    require('../../services/session.js')
var frame = require("ui/frame");1
var utils = require("utils/utils");

exports.onTap = require("../../shared/navtools.js").onTap

var page;
var drawer;

exports.pageLoaded = function(args) {
  page = args.object;
  var source = {}
  drawer = page.getViewById("drawer");
  page.getViewById("title").text = 'About'
  // Additional on load actions here
};

exports.toggleDrawer = function() {
  drawer.toggleDrawerState();
};

exports.goToGithub = function () {
  utils.openUrl('https://github.com/tedivm/Spawn1')
}

exports.goToScreeps = function () {
  utils.openUrl('https://screeps.com/')
}
