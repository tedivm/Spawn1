var ScreepsAPI = require('./screeps.js')
var League = require('./league.js')

class Session {

  isLoaded() {
    return(!!this.userdata && !!this.userdata.username)
  }

  loadUser() {
    this.userdata = {}
    var that = this
    var session = that
    var current_season = false

    // Return promise chain

    return ScreepsAPI.whoami()

    .then(function(data){

      that.userdata.username = data.username
      that.userdata.cpu = data.cpu
      that.userdata.badge = data.badge
      that.userdata.gcl = data.gcl
      that.userdata.power = data.power
      that.userdata.money = (Math.round(100*data.money)/100).toFixed(2)
      that.userdata.alliance = League.getUserAlliance(data.username)
      return ScreepsAPI.seasons()
    })

    // Set Current Season
    .then(function(data){
      var seasons = data['seasons']
      seasons.sort(function(a,b){
        a = new Date(a.dateModified);
        b = new Date(b.dateModified);
        return a>b ? -1 : a<b ? 1 : 0;
      })
      current_season = seasons[0]['_id']
      return Promise.resolve(true)
    })

    // Get and store Power Ranking
    .then(function(){
      return ScreepsAPI.find('power', current_season, that.userdata.username)
    })
    .then(function(data){
      // Rankings start at zero so add one
      that.userdata.powerRank = data.rank+1
      that.userdata.powerScore = data.score
    })

    // Get and store Control Ranking
    .then(function(){
      return ScreepsAPI.find('world', current_season, that.userdata.username)
    })
    .then(function(data){
      // Rankings start at zero so add one
      that.userdata.controlRank = data.rank+1
      that.userdata.controlScore = data.score
      return ScreepsAPI.overview(1440, 'energyControl')
    })
    .then(function(data) {
      that.userdata.rooms = data.rooms
      that.userdata.roomCount = data.rooms.length
    })

    // Process Errors
    .catch(function(err) {
      console.log(err.message)
      console.log(err.stack)
      return err
    })

  }

  clear() {
    this.userdata = {}
    ScreepsAPI.reset()
  }

}

var current_session = new Session()

module.exports = current_session