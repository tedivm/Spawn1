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
      that.userdata.controlpoints = Math.ceil(data.gcl)
      that.userdata.gcl = Math.ceil(ScreepsAPI.utils.controlPointsToGcl(data.gcl))

      var gcl_current_start = ScreepsAPI.utils.gclToControlPoints(that.userdata.gcl)
      var gcl_next_start = ScreepsAPI.utils.gclToControlPoints(that.userdata.gcl+1)


      that.userdata.gcl_progressTotal = Math.ceil(gcl_next_start - gcl_current_start)
      that.userdata.gcl_progress = Math.ceil(that.userdata.controlpoints - gcl_current_start)
      var percentage = that.userdata.gcl_progress / that.userdata.gcl_progressTotal


      if(that.userdata.gcl_progressTotal > 1000000000) {
        var divider = 1000000000
        var unit = 'B'
      } else if(that.userdata.gcl_progressTotal > 1000000) {
        var divider = 1000000
        var unit = 'M'
      } else if(that.userdata.gcl_progressTotal > 1000) {
        var divider = 1000
        var unit = 'K'
      } else {
        var divider = 1
        var unit = ''
      }

      that.userdata.gcl_progressTotal_string = ((that.userdata.gcl_progressTotal / divider).toPrecision(3)) + unit
      that.userdata.gcl_progress_string = ((that.userdata.gcl_progress / divider).toPrecision(3)) + unit

      that.userdata.power = data.power
      that.userdata.power_level = ScreepsAPI.utils.powerToLevel(data.power)
      var power_current_start = ScreepsAPI.utils.powerAtLevel(that.userdata.power_level)
      var power_next_start = ScreepsAPI.utils.powerAtLevel(that.userdata.power_level+1)

      that.userdata.power_progressTotal = Math.ceil(power_next_start - power_current_start)
      that.userdata.power_progress = Math.ceil(that.userdata.power - power_current_start)
      var percentage = that.userdata.power_progress / that.userdata.power_progressTotal

      if(that.userdata.power_progressTotal > 1000000000) {
        var divider = 1000000000
        var unit = 'B'
      } else if(that.userdata.power_progressTotal > 1000000) {
        var divider = 1000000
        var unit = 'M'
      } else if(that.userdata.power_progressTotal > 1000) {
        var divider = 1000
        var unit = 'K'
      } else {
        var divider = 1
        var unit = ''
      }
      that.userdata.power_progressTotal_string = ((that.userdata.power_progressTotal / divider).toPrecision(3)) + unit
      that.userdata.power_progress_string = ((that.userdata.power_progress / divider).toPrecision(3)) + unit



      that.userdata.money = (Math.round(100*data.money)/100).toFixed(2)
      that.userdata.alliance = League.getUserAlliance(data.username)

      var alliance = League.getAlliance(League.getUserAlliance(data.username))
      if(alliance) {
        that.userdata.alliance = alliance.abbreviation
        that.userdata.alliance_name = alliance.name
      }

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