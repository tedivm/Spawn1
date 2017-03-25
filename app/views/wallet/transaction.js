var ScreepsAPI = require('../../services/screeps.js')
var Session =    require('../../services/session.js')
var frame = require("ui/frame");

var page;

exports.pageLoaded = function(args) {
  page = args.object;
  var source = {}
  drawer = page.getViewById("drawer");
  page.getViewById("title").text = 'Transaction'
  // Additional on load actions here
};

