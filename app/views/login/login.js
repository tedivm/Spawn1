var ScreepsAPI = require('../../services/screeps.js')
var Session =    require('../../services/session.js')
var frames = require("ui/frame");
var page;

var isAttempting = false

exports.loaded = function(args) {
  page = args.object;
  var testing = {}
  page.bindingContext = testing
  page.bindingContext['activity'] = false
  isAttempting = false
  //testing["activity"] = false
  //page.bindingContext.set("activity",false)
};

exports.signIn = function() {

  if(isAttempting) {
    return
  }
  isAttempting = true

  var username_view = page.getViewById("username");
  var password_view = page.getViewById("password");


  var username = username_view.text;
  var password = password_view.text;

  if(!!ScreepsAPI.token) {
    if(ScreepsAPI.username == username) {
      if(ScreepsAPI.password == password) {
        // already logged in as this user- probably hit the button too fast.
        return
      }
    }
  }


  ScreepsAPI.username = username
  ScreepsAPI.password = password
  page.bindingContext['activity'] = true

  ScreepsAPI.auth()
  .then(function(data){
    if(data['token']) {
      Session.loadUser().then(function(){
        var indicator = frames.topmost().currentPage.getViewById('ActivityIndicator')
        //indicator.busy = false
        page.bindingContext["activity"] = false
        frames.topmost().navigate({
          'moduleName': "views/home/home",
          'clearHistory': true
        });
      })
    } else {
      alert('sign in failed')
      password_view.text = ''
    }
    isAttempting = false
  })
  .catch(function (response){
    isAttempting = false
    console.log(response.message)
    page.bindingContext['activity'] = true
    alert('sign in failed')
  })

};
