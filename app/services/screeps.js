

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
    if(!this.opts.url) {
      this.opts.url = opts.ptr ? 'https://screeps.com/ptr/api/' : 'https://screeps.com/api/'
    }
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
    console.log(this.opts.url + endpoint)
    var that = this
    return fetch(this.opts.url + endpoint, request_options)

    // Update authentication token and procress json response.
    // @todo deal with compressed data.
    .then(function(response) {
      if(!response.ok) {
        throw new Error(response.status + ': ' + response.statusText)
      }
      if(!!response.headers.has('X-Token')) {
        that.token = response.headers.get('X-Token')
      }
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
    if(!!args) {
      endpoint += '?' + Object.keys(args).map(function(key) {
          return [key, args[key]].map(encodeURIComponent).join("=");
      }).join("&");
    }

    console.log(endpoint)

    return this.req(endpoint, 'GET')
  }

  post(endpoint, args) {

    console.log(endpoint)
    console.log(JSON.stringify(args))

    var formData = new FormData();
    var keys = Object.keys(args)
    for(var index of keys) {
      formData.append(index, args[index]);
    }

    return this.req(endpoint, 'POST', formData, 'application/x-www-form-urlencoded; charset=utf-8')
  }

  auth() {
    return this.post('auth/signin', {
      email:this.opts.username,
      password:this.opts.password
    })
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

    if(!!this.id_user_map[id]) {
      return Promise.resolve(this.id_user_map[id])
    }
    var that = this
    return this.user_find({'id':id})
    .then(function(data){
      that.id_user_map[id] = data
      return data
    })
  }


  userdata_from_username(username) {
    if(!this.user_id_map) {
      this.user_id_map = {}
    }

    if(!!this.user_id_map[username]) {
      return Promise.resolve(this.user_id_map[username])
    }
    var that = this
    return this.user_find({'username':username})
    .then(function(data){
      that.user_id_map[username] = data
      return data
    })
  }

  user_find(options) {
    return this.get('user/find', options)
  }

}

module.exports = new ScreepsAPI({})
