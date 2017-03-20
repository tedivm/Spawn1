var ScreepsAPI = require('../../services/screeps.js')
var Session =    require('../../services/session.js')
var frames = require("ui/frame");
var dialogs = require("ui/dialogs");
exports.onTap = require("../../shared/navtools.js").onTap

var page;
var drawer;


var Observable = require("data/observable").Observable;
var ObservableArray = require("data/observable-array").ObservableArray;
var utilsModule = require("utils/utils");

var items = new ObservableArray([]);
var pageData = new Observable();

function loadOrders () {
  // Toss a few numbers in the list for testing
  return ScreepsAPI.my_orders()
  .then(function(data){
    console.log('market orders loaded')
    items.length = 0
    for(var order of data['list']) {
      // Subscription tokens will need to be excluded until the layout
      // templates are updated.
      if(!order['roomName']) {
        continue
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
  page.getViewById("title").text = 'Orders'

  page.bindingContext = pageData;
  loadOrders()
  pageData.set("items", items);
};

exports.toggleDrawer = function() {
  drawer.toggleDrawerState();
};

exports.pullToRefreshInitiated = function() {
  // Load orders and then reset the UI
  loadOrders()
  .then(function(){
    page.getViewById("list-view").notifyPullToRefreshFinished();
  })
};

function getSwipeThreshold() {
  return 100 * utilsModule.layout.getDisplayDensity();
}

exports.itemSwipeProgressStarted = function(args) {
  var swipeLimits = args.data.swipeLimits;
  var threshold = getSwipeThreshold()
  swipeLimits.threshold = threshold
  swipeLimits.left = threshold
  swipeLimits.right = threshold
}

// Clear order
exports.itemSwipeProgressEnded = function(args) {
  var item = items.getItem(args.itemIndex);

  var swipeThreshold = getSwipeThreshold()
  if (args.data.x <= -(swipeThreshold) || args.data.x >= swipeThreshold) {
    // @todo ask for confirmation and then delete it
    dialogs.confirm("Are you sure you want to cancel this order?")
    .then(function (result) {
      if(result) {
        // Delete Order
        items.splice(args.itemIndex, 1);
        ScreepsAPI.user_console('Game.market.cancelOrder("' + item['_id'] + '")')
      }
      return result
    })
  }
};
