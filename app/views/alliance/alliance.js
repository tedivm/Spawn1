var ScreepsAPI = require('../../services/screeps.js')
var Session =    require('../../services/session.js')
var frame = require("ui/frame");
var utils = require("utils/utils");
var timer = require("timer");
exports.onTap = require("../../shared/navtools.js").onTap

var page;
var drawer;
var timerid = false

exports.pageLoaded = function(args) {
  page = args.object;
  var source = {}
  drawer = page.getViewById("drawer");
  //page.getViewById("title").text = ''
  // Additional on load actions here

  if(!!page.bindingContext.delayedReload) {
    timerid = timer.setTimeout(() => {
      delete page.bindingContext.delayedReload
      //frame.reloadPage()

      frame.topmost().navigate({
        moduleName: "views/alliance/alliance",
        bindingContext: page.bindingContext,
        backstackVisible: false,
        animated: false
      });

    }, 1000 * 3);
  }

};

exports.pageUnloaded = function(args) {
  if(!!timerid) {
    timer.clearInterval(timerid)
    timerid = false
  }
}

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
