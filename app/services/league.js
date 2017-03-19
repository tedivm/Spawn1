
class League {
  constructor() {
    this.users = {}
    this.alliances = {}
    this.loadAllianceData()
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
          that.alliances[alliance]['slackurl'] = 'slack://channel?id=' + that.alliances[alliance]['slack_channel'] + '&team=screeeps'
        }

        if(that.alliances[alliance]['logo']) {
          that.alliances[alliance]['logo'] = 'http://www.leagueofautomatednations.com/obj/' + that.alliances[alliance]['logo']
        } else {
          that.alliances[alliance]['logo'] = 'http://www.leagueofautomatednations.com/static/img/leaguelogo.png'
        }

        that.alliances[alliance].memberCount = that.alliances[alliance].members.length
        that.alliances[alliance].memberObjects = []
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
