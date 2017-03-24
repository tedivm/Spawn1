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
var pageData = new Observable();


var page;
var drawer;
var socket = false
var maxbuffer = 1000

var display_errors = true
var display_log = true
var display_results = true
var display = {
  'error': true,
  'result': true,
  'log': true
}


function addItem(type, message) {

  if(!display[type]) {
    return
  }

  if(message.startsWith('ScreepStats')) {
    return
  }

  var color = type == 'error' ? 'DD0000' : '#FFFFFF'

  if(items.length >= maxbuffer) {
    items.shift()
  }

  items.push({
    'type': type,
    'message': '<span style="background-color:#2b2b2b; color:'+color+';">' + message + '</span>'
  })

}

function console_message(socket_data) {
  var should_refocus = false

  // Uncaught errors *in game*
  if(socket_data['error']) {
    should_refocus = true
    addItem('error', socket_data['error'])
  }

  if(socket_data['messages']) {
    // Standard output from console.log
    if(socket_data['messages']['log'] && socket_data['messages']['log'].length > 0) {
      should_refocus = true
      for(var log of socket_data['messages']['log']) {
        addItem('log', log)
      }
    }

    // Return output from console commands
    if(socket_data['messages']['results'] && socket_data['messages']['results'].length > 0) {
      should_refocus = true
      for(var result of socket_data['messages']['results']) {
        addItem('result', result)
      }
    }
  }

  if(should_refocus) {
    refocus()
  }
}


function refocus() {
  var console_buffer = page.getViewById("console_list");
  if(items.length > 0) {
    console_buffer.scrollToIndex(console_buffer.items.length - 1); // scroll to the bottom
  }
}


exports.pageLoaded = function(args) {
  page = args.object;
  var source = {}
  drawer = page.getViewById("drawer");
  page.getViewById("title").text = 'console'
  // Additional on load actions here

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
}

exports.sendConsoleCommand = function (args) {
  var message_input = page.getViewById("message_input")
  var message = message_input.text
  ScreepsAPI.user_console(message)
  message_input.text = ''
}
