var League =    require('../../services/league.js')
var ScreepsAPI = require('../../services/screeps.js')
var Session =    require('../../services/session.js')
var frame = require("ui/frame");
var timer = require("timer");

exports.onTap = require("../../shared/navtools.js").onTap


var Observable = require("data/observable").Observable;
var ObservableArray = require("data/observable-array").ObservableArray;
var utils = require("utils/utils");

var items = new ObservableArray([]);
var processed_messages = []
var pageData = new Observable();


var page;
var drawer;

var conversationTimerID = false


function loadConversation () {
  console.log('loading conversation')
  ScreepsAPI.messages_list(page.bindingContext.respondent)
  .then(function(data){
    var scroll = false
    for(var message of data['messages']) {

      if(processed_messages.indexOf(message['_id']) < 0) {
        processed_messages.push(message['_id'])

        if(message.type == 'out') {
          message.badge_url = League.getBadgeUrl(Session.userdata.username, false)
        } else {
          message.badge_url = League.getBadgeUrl(page.bindingContext.recipient, false)
        }

        var date = new Date(message['date']);
        message['date_locale'] = date.toLocaleString()
        items.push(message)
        scroll = true
      }
    }

    // If conversation has new messages scroll to read them.
    if(scroll) {
      var conversation_list = page.getViewById("conversation_list");
      conversation_list.scrollToIndex(items.length - 1); // scroll to the bottom
    }

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

  processed_messages = []
  items.length = 0

  page.bindingContext = pageData;
  loadConversation()
  pageData.set("messages", items);

  conversationTimerID = timer.setInterval(function(){
    loadConversation()
  }, 5000)

};

exports.pageUnloaded = function (args) {
  if(conversationTimerID !== false) {
    timer.clearInterval(conversationTimerID)
    conversationTimerID = false
  }
}


exports.toggleDrawer = function() {
  drawer.toggleDrawerState();
};

exports.itemTemplateSelector = function (item) {
  return item.type == 'in' ? 'them' : 'me'
}

exports.addMessage = function (args) {
  var message_input = page.getViewById("message_input")
  var message = message_input.text;
  console.log('making call to api')
  ScreepsAPI.messages_send(page.bindingContext.respondent, message)
  .then(function(data){

    message_input.text = ''
    loadConversation()
  })
  .catch(function(err){
    console.log(err.message)
    console.log(err.stack)
  })
}
