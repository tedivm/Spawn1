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



function loadConversation () {
  console.log('loading conversation')
  ScreepsAPI.messages_list(page.bindingContext.respondent)
  .then(function(data){
    items.length = 0
    for(var conversation of data['messages']) {
      items.push(conversation)
    }
    var conversation_list = page.getViewById("conversation_list");
    conversation_list.scrollToIndex(items.length - 1); // scroll to the bottom
  }).catch(function(err){
    console.log(err.message)
    console.log(err.trace)
  })
}


exports.pageLoaded = function(args) {
  page = args.object;
  var source = {}
  drawer = page.getViewById("drawer");
  //page.getViewById("title").text = ''
  // Additional on load actions here

  pageData.recipient = page.bindingContext.recipient
  pageData.respondent = page.bindingContext.respondent

  page.bindingContext = pageData;
  loadConversation()
  pageData.set("messages", items);
};


exports.toggleDrawer = function() {
  drawer.toggleDrawerState();
};

exports.itemTemplateSelector = function (item) {
  return item.type == 'in' ? 'them' : 'me'
}
