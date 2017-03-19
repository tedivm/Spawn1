var ScreepsAPI = require('../../services/screeps.js')
var Session =    require('../../services/session.js')
var League =    require('../../services/league.js')
var frame = require("ui/frame");
//exports.onTap
exports.onTap = require("../../shared/navtools.js").onTap
//console.dump(navigation)

var page;
var drawer;

exports.pageLoaded = function(args) {
  page = args.object;
  var source = {}
  page.bindingContext = Session.userdata;
  drawer = page.getViewById("drawer");
  page.getViewById("title").text = 'Spawn1'
};

exports.toggleDrawer = function() {
  drawer.toggleDrawerState();
};


exports.loadAlliancePage = function () {
  frame.topmost().navigate({
    moduleName: "views/alliance/alliance",
    bindingContext: League.getAlliance(Session.userdata.alliance)
  })
}
