var ScreepsAPI = require('../../services/screeps.js')
var Session =    require('../../services/session.js')
var frames = require("ui/frame");
exports.onTap = require("../../shared/navtools.js").onTap

var page;
var drawer;

var currentWalletPage = false

var Observable = require("data/observable").Observable;
var ObservableArray = require("data/observable-array").ObservableArray;
var utilsModule = require("utils/utils");

var items = new ObservableArray([]);
var pageData = new Observable();

function loadWalletHistory () {
  // Toss a few money_history in the list for testing
  return ScreepsAPI.money_history()
  .then(function(data){
    console.log('wallet history loaded')
    currentWalletPage = 0
    items.length = 0

    for(var order of data['list']) {
      if(order['balance']) {
        order['balance'] = order['balance'].toFixed(2)
        order['direction'] = order['change'] > 0 ? 'credit' : 'debit'
      }
      items.push(order)
    }
    return Promise.resolve(true)
  })
}

exports.pageLoaded = function(args) {
  page = args.object;
  var source = {}
  drawer = page.getViewById("drawer");
  page.getViewById("title").text = 'Wallet'

  page.bindingContext = pageData;
  loadWalletHistory()
  pageData.set("items", items);
};

exports.toggleDrawer = function() {
  drawer.toggleDrawerState();
};

exports.pullToRefreshInitiated = function() {
  // Simulate a call to a backend that comes back two seconds later
  loadWalletHistory()
  .then(function(){
    page.getViewById("list-view").notifyPullToRefreshFinished();
  })
};

exports.onLoadMoreItemsRequested = function() {
  currentWalletPage++
  return ScreepsAPI.money_history(currentWalletPage)
  .then(function(data){
    console.log('wallet history loaded')
    for(var order of data['list']) {
      if(order['balance']) {
        order['balance'] = order['balance'].toFixed(2)
        order['direction'] = order['change'] > 0 ? 'credit' : 'debit'
      }
      items.push(order)
    }
    return Promise.resolve(true)
  })
}
