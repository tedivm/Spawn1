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
var socket = false

function console_message(socket_data) {

  // Uncaught errors
  if(socket_data['error']) {
    console.log('error')
  }

  if(socket_data['messages']) {

    // Standard output from console.log
    if(socket_data['messages']['log']) {
      console.log('log')
    }

    // Return output from console commands
    if(socket_data['messages']['results']) {
      console.log('results')
    }
  }

}

exports.pageLoaded = function(args) {
  page = args.object;
  var source = {}
  drawer = page.getViewById("drawer");
  //page.getViewById("title").text = ''
  // Additional on load actions here

  processed_messages = []
  items.length = 0

  page.bindingContext = pageData;

  // create websocket connection to server
  console.log('loading socket')
  socket = ScreepsAPI.get_web_socket()
  socket.registerHandler('console', console_message)
  pageData.set("messages", items);

};

exports.pageUnloaded = function (args) {
  console.log('unloading console')
  if(!!socket) {
    socket.deregisterHandler('console', console_message)
  }
}


exports.toggleDrawer = function() {
  drawer.toggleDrawerState();
};

exports.itemTemplateSelector = function (item) {
  //return item.type == 'in' ? 'them' : 'me'
  return 'console'
}

exports.sendConsoleCommand = function (args) {
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
