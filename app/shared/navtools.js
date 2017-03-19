var Session = require('../services/session.js')
var frame = require('ui/frame');

exports.onTap = function (args) {
  var currentPage = frame.topmost().currentPage;
  var linkedPageName = args.view.text.toLowerCase()
  var drawer = currentPage.getViewById("drawer");

  if(linkedPageName == 'logout') {
    Session.clear()
    linkedPageName = 'login'
  }

  if(currentPage.id != linkedPageName) {
    frame.topmost().navigate({
      'moduleName': "views/" + linkedPageName + "/" + linkedPageName,
      'clearHistory': true
    });
  }
}
