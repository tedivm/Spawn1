var ScreepsAPI = require('../../services/screeps.js')
var Session =    require('../../services/session.js')
var League =    require('../../services/league.js')
var frame = require("ui/frame");

exports.onTap = require("../../shared/navtools.js").onTap

var page;
var drawer;

exports.pageLoaded = function(args) {
  page = args.object;
  var source = {}
  page.bindingContext = Session.userdata//JSON.parse(JSON.stringify(Session.userdata))


  //ScreepsAPI.utils.controlPointsToGcl(Session.userdata.gcl)

  drawer = page.getViewById("drawer");
  page.getViewById("title").text = 'Spawn1'
};

exports.toggleDrawer = function() {
  drawer.toggleDrawerState();
};


exports.loadAlliancePage = function () {
  var new_context = League.getAlliance(Session.userdata.alliance)
  new_context.delayedReload = true
  frame.topmost().navigate({
    moduleName: "views/alliance/alliance",
    bindingContext: new_context
  })
}

exports.loadWalletPage = function () {
  frame.topmost().navigate({
    'moduleName': "views/wallet/wallet",
    'clearHistory': true
  })
}
