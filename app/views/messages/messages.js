var League =    require('../../services/league.js')
var ScreepsAPI = require('../../services/screeps.js')
var Session =    require('../../services/session.js')
var dialogs = require("ui/dialogs");
var frame = require("ui/frame");
var timer = require("timer");

exports.onTap = require("../../shared/navtools.js").onTap


var Observable = require("data/observable").Observable;
var ObservableArray = require("data/observable-array").ObservableArray;
var utils = require("utils/utils");

var items = new ObservableArray([]);
var pageData = new Observable();


var page;
var drawer;
var conversationTimerID = false


function loadMessages () {
  return ScreepsAPI.messages()
  .then(function(data){

    var promiseCollection = []
    var username_mapping = {}
    for(var conversation of data['messages']) {
      promiseCollection.push(
        ScreepsAPI.userdata_from_id(conversation.message.respondent)
        .then(function(data){
          username_mapping[data['user']['_id']] = data['user']['username']
          return Promise.resolve(true)
        })
      )
    }

    return Promise.all(promiseCollection)
    .then(function(){
      for(var conversation of data['messages']) {
        conversation['message']['rusername'] = username_mapping[conversation['message']['respondent']]
        var date = new Date(conversation['message']['date']);
        conversation['message']['date_locale'] = date.toLocaleString()
      }
      return data
    })
  })

  .then(function(data){
    // Remove existing itms and repopulate.
    items.length = 0
    for(var conversation of data['messages']) {
      items.push(conversation['message'])
    }

    return Promise.resolve(true)
  })
  .catch(function(err) {
    console.log(err.message)
    console.log(err.stack)
  })
}


exports.pageLoaded = function(args) {
  page = args.object;
  var source = {}
  drawer = page.getViewById("drawer");
  page.getViewById("title").text = 'Messages'

  // Additional on load actions here
  page.bindingContext = pageData;
  loadMessages()
  pageData.set("conversations", items);
  conversationTimerID = timer.setInterval(function(){
    loadMessages()
  }, (1000 * 45))
};

exports.composeMessage = function (args) {

  dialogs.prompt({
    title: "Compose Message",
    message: "Select User",
    okButtonText: "Ok",
    cancelButtonText: "Cancel",
    neutralButtonText: false,
    defaultText: "",
    inputType: dialogs.inputType.text
  })
  .then(function (r) {
    return r.text
  })
  .then(function(username){
    return ScreepsAPI.userdata_from_username(username)
  })
  .then(function(data){
    var pageData = new Observable();
    pageData.recipient = data['user']['username']
    pageData.respondent = data['user']['_id']
    pageData.messages = []
    frame.topmost().navigate({
      moduleName: "views/messages/conversation",
      bindingContext: pageData
    })
  })
  .catch(function(err){
    console.log(err.message)
    console.log(err.stack)
  })
}

exports.toggleDrawer = function() {
  drawer.toggleDrawerState();
};

exports.listViewItemTap = function (args) {
  var item = items.getItem(args.index);
  var pageData = new Observable();
  pageData.recipient = item.rusername
  pageData.respondent = item.respondent
  pageData.messages = []
  frame.topmost().navigate({
    moduleName: "views/messages/conversation",
    bindingContext: pageData
  })
}

exports.pageUnloaded = function (args) {
  if(conversationTimerID !== false) {
    timer.clearInterval(conversationTimerID)
    conversationTimerID = false
  }
}
