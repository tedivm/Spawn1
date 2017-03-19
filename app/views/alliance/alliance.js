var ScreepsAPI = require('../../services/screeps.js')
var Session =    require('../../services/session.js')
var frame = require("ui/frame");
var utils = require("utils/utils");
exports.onTap = require("../../shared/navtools.js").onTap

var page;
var drawer;

exports.pageLoaded = function(args) {
  page = args.object;
  var source = {}
  drawer = page.getViewById("drawer");
  //page.getViewById("title").text = ''
  // Additional on load actions here
};

exports.toggleDrawer = function() {
  drawer.toggleDrawerState();
};


exports.loadSlack = function(args) {
  utils.openUrl(page.bindingContext['slackurl'])
}

exports.loadMemberPage = function(args) {
  //page.bindingContext['memberObjects']
  frame.topmost().navigate({
    moduleName: "views/alliance/members",
    bindingContext: page.bindingContext
  });
}
