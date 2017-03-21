var timer = require("timer");

class League {
  constructor() {
    this.users = {}
    this.alliances = {}
    this.loadAllianceData()

    var that = this

    // The server updates stats every 6 hours, so update the docs every
    // 6.1 hours to make sure it gets new data.
    timer.setInterval(function(){
      that.loadAllianceData()
    }, (1000 * 60 * 6.1))

  }

  loadAllianceData() {
    var that = this
    return fetch("http://www.leagueofautomatednations.com/alliances.js")
    .then(response => { return response.json(); })
    .then(function (r) {
      that.alliances = r
      that.users = {}
      for(var alliance in that.alliances) {

        if(that.alliances[alliance]['slack_channel']) {
          that.alliances[alliance]['slackurl'] = 'slack://channel?team=T0HJCPP9T'
          if(that.alliances[alliance]['slack_channelid']) {
            that.alliances[alliance]['slackurl'] += '&id=' + that.alliances[alliance]['slack_channelid']
          }
        }

        if(that.alliances[alliance]['logo']) {
          that.alliances[alliance]['logo'] = 'http://www.leagueofautomatednations.com/obj/' + that.alliances[alliance]['logo']
        } else {
          that.alliances[alliance]['logo'] = 'http://www.leagueofautomatednations.com/static/img/leaguelogo.png'
        }

        that.alliances[alliance].memberCount = that.alliances[alliance].members.length
        that.alliances[alliance].memberObjects = []

        that.alliances[alliance].members.sort(function(a,b){
          var textA = a.toUpperCase();
          var textB = b.toUpperCase();
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        })

        for(var user of that.alliances[alliance].members) {
          that.alliances[alliance].memberObjects.push({'name':user})
          that.users[user] = alliance
        }
      }
    })
    .catch(function(err){
      console.log(err.message)
      console.log(err.stack)
    })
  }

  getUserAlliance(user) {
    return !!this.users[user] ? this.users[user] : false
  }

  getAlliance(alliance) {
    return !!this.alliances[alliance] ? this.alliances[alliance] : false
  }

  getAllianceList() {
    return Object.keys(this.alliances())
  }

  getAllianceData() {
    return Object.values(this.alliances)
  }
 }

module.exports = new League()
