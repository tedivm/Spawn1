require('nativescript-websockets');

// Time- in milliseconds- after which we reauthenticate.
const authentication_timeout = 45000

class ScreepsAPI {

  set username (v) {
    this.opts.username = v
  }

  set password (v) {
    this.opts.password = v
  }

  constructor(opts) {
    this.opts = opts
    this.token = false

    if(!this.opts.host) {
      this.opts.host = opts.ptr ? 'screeps.com/ptr/' : 'screeps.com/'
    }
    this.opts.prefix = this.opts.insecure ? 'http://' : 'https://'
  }

  authcheck() {
    var lastcall = this.lastcall || 1
    this.lastcall = (new Date()).getTime()

    if(!this.token || (this.lastcall - lastcall) > authentication_timeout) {
      return this.auth()
    }

    return Promise.resolve(true)
  }

  get_web_socket() {
    if(!this.socket) {
      this.socket = new ScreepsSocket(this, this.opts)
    }
    return this.socket
  }

  reset() {
    delete this.opts.username
    delete this.opts.password
    this.token = false
  }

  req(endpoint, method, body, contenttype) {
    var that = this
    var request_options = {
      method: method,
      headers: {
        'X-Token': this.token,
        'X-Username': this.token,
        'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
      }
    }

    if(contenttype) {
      request_options['headers']['Content-Type'] = contenttype
    }

    if(body) {
      request_options['body'] = body
    }
    var base = this.opts.prefix + this.opts.host + 'api/'
    console.log(base + endpoint)
    var that = this
    return fetch(base + endpoint, request_options)

    // Update authentication token and procress json response.
    // @todo deal with compressed data.
    .then(function(response) {
      if(!response.ok) {
        if(!!that.token && response.status == '403') {
          that.token = false
        }
        throw new Error(response.status + ': ' + response.statusText)
      }
      if(!!response.headers.has('X-Token')) {
        that.token = response.headers.get('X-Token')
      }
      that.lastcall = (new Date()).getTime()
      return response.json()
    })
    .then(function(data){
      if(data['token']) {
        that.token = data['token']
      }
      return data
    })
  }

  get(endpoint, args) {
    var that = this
    return this.authcheck().then(function(){
      if(!!args) {
        endpoint += '?' + Object.keys(args).map(function(key) {
            return [key, args[key]].map(encodeURIComponent).join("=");
        }).join("&");
      }
      return that.req(endpoint, 'GET')
    })
  }

  post(endpoint, args) {
    var that = this
    return this.authcheck().then(function(){
      console.log(endpoint)
      if(endpoint != 'auth/signin') {
        console.log(JSON.stringify(args))
      }
      var formData = new FormData();
      var keys = Object.keys(args)
      for(var index of keys) {
        formData.append(index, args[index]);
      }
      return that.req(endpoint, 'POST', formData, 'application/x-www-form-urlencoded; charset=utf-8')
    })
  }

  auth() {
    console.log('auth/signin')
    var formData = new FormData();
    formData.append('email', this.opts.username)
    formData.append('password', this.opts.password)
    return this.req('auth/signin', 'POST', formData, 'application/x-www-form-urlencoded; charset=utf-8')
  }

  whoami() {
    return this.get('auth/me')
  }

  seasons() {
    return this.get('leaderboard/seasons')
  }

  find(mode, season, user) {
    return this.get('leaderboard/find', {
      'mode': mode,
      'season': season,
      'username': user
    })
  }

  overview(interval, statName) {
    return this.get('user/overview', {
      'interval': interval,
      'statName': statName
    })
  }

  my_orders() {
    return this.get('game/market/my-orders')
  }

  money_history(page=0) {
    return this.get('user/money-history', {
      'page': page
    })
  }

  user_console(cmd) {
    return this.post('user/console', {'expression':cmd})
  }

  messages() {
    return this.get('user/messages/index')
  }

  messages_list(respondent) {
    return this.get('user/messages/list', {'respondent': respondent})
  }

  messages_send(respondent, message) {
    return this.post('user/messages/send', {'respondent': respondent, 'text': message})
  }

  userdata_from_id(id) {
    if(!this.id_user_map) {
      this.id_user_map = {}
    }
    if(!this.user_id_map) {
      this.user_id_map = {}
    }

    if(!!this.id_user_map[id]) {
      return Promise.resolve(this.id_user_map[id])
    }
    var that = this
    return this.user_find({'id':id})
    .then(function(data){
      that.id_user_map[id] = data
      that.id_user_map[data['user']['username']] = data
      return data
    })
  }

  userdata_from_username(username) {
    if(!this.user_id_map) {
      this.user_id_map = {}
    }
    if(!this.id_user_map) {
      this.id_user_map = {}
    }

    if(!!this.user_id_map[username]) {
      return Promise.resolve(this.user_id_map[username])
    }
    var that = this
    return this.user_find({'username':username})
    .then(function(data){
      that.user_id_map[username] = data
      that.id_user_map[data['user']['_id']] = data
      return data
    })
  }

  user_find(options) {
    return this.get('user/find', options)
  }

}

class ScreepsSocket {

  constructor(api, opts) {
    this.api = api
    this.opts = opts
    this.socket = false
    this.subscriptions = []
    this.handlers = {}
  }

  connect() {

    if(!!this.socket) {
      // If socket is closed or closing then open a new one.
      if(this.socket.readyState == 2 || this.socket.readyState == 3) {
        this.socket = false
      } else {
        return
      }
    }

    var uri = !!this.opts.insecure ? 'ws://' : 'wss://'
    uri += this.opts.host + 'socket/websocket'
    console.log('connecting to websocket: ' + uri)
    this.socket = new WebSocket(uri)

    var that = this
    this.socket.addEventListener('open', function(evt){
      evt.target.send('auth ' + that.api.token)
    })


    this.socket.addEventListener('message', function(evt){
      console.log('message received')

      var message = evt.data
      if(message.startsWith('auth ok')) {
        console.log('authenticated')
        var splitmessage = message.split(' ')
        if(splitmessage.length >= 3) {
          that.api.token = splitmessage[2]
        }
        // Set Subscriptions
        for(var watchpoint of that.subscriptions) {
          that.subscribe(watchpoint)
        }
        return
      }

      if(message.startsWith('time')) {
        return
      }

      if(message.startsWith('gz')) {
        message = inflate(message)
      }

      if (message[0] == '[') {
        var data = JSON.parse(message)
      } else {
        // emulate normal responses but with blank subscription key
        // this will mean only raw handlers will run on message
        var data = ['', message]
      }

      var handlers = []
      switch (true) {
        case data[0].endsWith('console'):
          var type = 'console'
          break;
        case data[0].endsWith('cpu'):
          var type = 'cpu'
          break;
        case data[0].endsWith('money'):
          var type = 'money'
          break;
        default:
          var type = 'raw'
          break;
      }

      console.log('websocket handler type: ' + type)
      if(that.handlers[type]) {
        handlers = that.handlers[type]
      }

      if(that.handlers['*']) {
        handlers = handlers.concat(that.handlers[raw])
      }

      for(var handler of handlers) {
        handler(data[1])
      }
    })


    this.socket.addEventListener('close', function(evt){
      that.socket = false
      console.log("The Socket was Closed:", evt.code, evt.reason);
    })


    this.socket.addEventListener('error', function(evt){
      console.log("The socket had an error", evt.error)
    })
  }

  disconnect() {
    if(this.socket) {
      console.log('closing socket')
      this.socket.close()
      this.socket = false
    }
  }

  subscribe(watchpoint) {
    if(this.subscriptions.indexOf(watchpoint) < 0) {
      this.subscriptions.push(watchpoint)
      this.connect()
    }

    if(this.socket && this.socket.readyState == 1) {
      var that = this
      this.api.userdata_from_username(this.opts.username)
      .then(function(userinfo){
        var message = 'subscribe user:' + userinfo['user']['_id'] + '/' + watchpoint
        console.log(message)
        that.socket.send(message)
      }).catch(function(err){
        console.log(err.message)
        console.log(err.stack)
      })
    }
  }

  unsubscribe(watchpoint) {
    if(this.socket && this.socket.readyState == 1) {
      var that = this
      this.api.userdata_from_username(this.opts.username)
      .then(function(userinfo){
        var message = 'unsubscribe user:' + userinfo['user']['_id'] + '/' + watchpoint
        console.log(message)
        that.socket.send(message)
      })
    }
    var index = this.subscriptions.indexOf(watchpoint)
    if(index < 0) {
      this.subscriptions.splice(index,1)
    }
    if(this.subscriptions.length < 1) {
      this.disconnect()
    }
  }

  registerHandler(watchpoint, callback) {
    if(!this.handlers[watchpoint]) {
      this.handlers[watchpoint] = []
    }
    this.handlers[watchpoint].push(callback)
    this.subscribe(watchpoint)
  }

  deregisterHandler(watchpoint, callback) {
    if(!this.handlers[watchpoint]) {
      return
    }

    var index = this.handlers[watchpoint].indexOf(callback)
    if(index >= 0) {
      console.log('removing handler from ' + watchpoint)
      this.handlers[watchpoint].splice(index, 1)
    } else {
      console.log('unable to find registered handler for ' + watchpoint)
    }

    if(this.handlers[watchpoint].length < 1) {
      console.log('unsubscribing from ' + watchpoint + ' due to lack of subscriptions')
      delete this.handlers[watchpoint]
      this.unsubscribe(watchpoint)
    }

    var handlercount = 0
    Object.values(this.handlers).forEach(function(e){handlercount += e.length; })

    if(handlercount < 1) {
      console.log('closing socket due to lack of active subscriptions')
      this.disconnect()
    }
  }
}



var GCL_POW= 2.4
var GCL_MULTIPLY = 1000000


var POWER_POW = 1.15
var POWER_MULTIPLY = 1000

var powertotals = [{level:0, total:0}]
var powerlevels = {}
var total = 0
for(var i=1; i <= 350; i++) {
  total += Math.pow(POWER_POW, i) * POWER_MULTIPLY
  powertotals.push({
    level: i,
    total: total
  })
  powerlevels[i] = total
}
powertotals.reverse() // store from highest to lowest


var ScreepsUtils = {
  gclToControlPoints: function(gcl) {
    return Math.pow(gcl - 1, GCL_POW) * GCL_MULTIPLY;
  },

  controlPointsToGcl: function(points) {
    return Math.floor(Math.pow(points / GCL_MULTIPLY, 1 / GCL_POW) + 1);
  },

  powerToLevel: function (power) {
    if(power <= 0) {

    }
    for(var powerdata of powertotals) {
      if(powerdata.total < power) {
        return powerdata.level
      }
    }
    return false
  },

  powerAtLevel: function (level) {
    return powerlevels[level]
  },

  powerToNextLevel: function (level) {
    return Math.pow(POWER_POW, level) * POWER_MULTIPLY
  }
}

function gz (data) {
  let buf = new Buffer(data.slice(3), 'base64')
  let zlib = require('zlib')
  let ret = zlib.gunzipSync(buf).toString()
  return JSON.parse(ret)
}

function inflate (data) {
  let buf = new Buffer(data.slice(3), 'base64')
  let zlib = require('zlib')
  let ret = zlib.inflateSync(buf).toString()
  return JSON.parse(ret)
}

var api = new ScreepsAPI({})
api.utils = ScreepsUtils
module.exports = api
