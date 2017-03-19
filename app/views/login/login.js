var ScreepsAPI = require('../../services/screeps.js')
var Session =    require('../../services/session.js')
var frames = require("ui/frame");
var page;

exports.loaded = function(args) {
  page = args.object;
  var testing = {}
  page.bindingContext = testing
  page.bindingContext['activity'] = false
  //testing["activity"] = false
  //page.bindingContext.set("activity",false)
};

exports.signIn = function() {

  var username_view = page.getViewById("username");
  var password_view = page.getViewById("password");


  var username = username_view.text;
  var password = password_view.text;



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
  })
  .catch(function (response){
    console.log(response.message)
    page.bindingContext['activity'] = true
    alert('sign in failed')
  })

};
