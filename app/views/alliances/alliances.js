var League =    require('../../services/league.js')
var ScreepsAPI = require('../../services/screeps.js')
var Session =    require('../../services/session.js')
var frame = require("ui/frame");

exports.onTap = require("../../shared/navtools.js").onTap


var Observable = require("data/observable").Observable;
var ObservableArray = require("data/observable-array").ObservableArray;
var utils = require("utils/utils");

var items = new ObservableArray([]);
var pageData = new Observable();


var page;
var drawer;

// http://www.leagueofautomatednations.com/obj/7d0f0ab264d4a26.jpg


function loadAlliances () {
  var alliances = League.getAllianceData()
  alliances.sort(function(a,b){
    var textA = a.abbreviation.toUpperCase();
    var textB = b.abbreviation.toUpperCase();
    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
  })

  // Remove existing itms and repopulate.
  items.length = 0
  for(var alliance of alliances) {
    items.push(alliance)
  }
}




exports.pageLoaded = function(args) {
  page = args.object;
  var source = {}
  drawer = page.getViewById("drawer");
  page.getViewById("title").text = 'Alliances'
  // Additional on load actions here
  page.bindingContext = pageData;
  loadAlliances()
  pageData.set("items", items);
};

exports.toggleDrawer = function() {
  drawer.toggleDrawerState();
};

exports.listViewItemTap = function(args) {
  var item = items.getItem(args.index);
  frame.topmost().navigate({
    moduleName: "views/alliance/alliance",
    bindingContext: League.getAlliance(item.abbreviation)
  });
}
