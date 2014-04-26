var app = require('http').createServer(handler)
  , fs  = require('fs')
  , io  = require('socket.io').listen(app, { log: false })
  , D   = require('daimio')
  , mongo = require('mongodb')
  , db  = new mongo.Db('iv', new mongo.Server('localhost', 27017, {auto_reconnect: true}), {w: 0});

D.Etc.db = db // expose DB connection to Daimio

function handler (req, res) {
  // NOTE: we're grabbing these fresh in response to each request for development. DO NOT DO THIS IN PRODUCTION.
  // move these lines outside the handler so the html is cached over the lifetime of the server.
  var menu_html   = fs.readFileSync(__dirname+'/menu.html', 'utf8')
    , client_html = fs.readFileSync(__dirname+'/client.html', 'utf8')
    , admin_html  = fs.readFileSync(__dirname+'/admin.html', 'utf8')
    , viz_html    = fs.readFileSync(__dirname+'/viz.html', 'utf8')
    , daimio_js   = fs.readFileSync(__dirname+'/daimio_composite.js', 'utf8')

  if(req.url.match(/^\/public\//)) {
    try {
      res.writeHead(200)
      res.end(fs.readFileSync('.' + req.url, 'utf8')) // TODO: async this
    } catch(e) {}
    return
  }

  if(req.url === '/favicon.ico') {
    res.writeHead(200, {'Content-Type': 'image/x-icon'})
    res.end()
    return
  }

  if(req.url === '/daimio_composite.js') {
    res.writeHead(200, {"Content-Type": "application/javascript"})
    res.end(daimio_js)
    return
  }

  if(req.url.replace(/\/$/, '').split('/').slice(-1)[0] == 'admin') {
    res.writeHead(200, {"Content-Type": "text/html"})
    res.end(admin_html)
    return
  }

  if(req.url.replace(/\/$/, '').split('/').slice(-1)[0] == 'viz') {
    res.writeHead(200, {"Content-Type": "text/html"})
    res.end(viz_html)
    return
  }

  if(req.url.match(/^\/([0-9a-f]{24})\/?$/) || req.url.replace(/\/$/, '').split('/').slice(-1)[0] == 'control') {
    res.writeHead(200, {"Content-Type": "text/html"})
    res.end(client_html)
    return
  }
  
  if(req.url.replace(/\/$/, '').split('/').slice(-1)[0] == 'gamedata') {
    res.writeHead(200, {"Content-Type": "text/json"})

    try {
      D.Etc.db.collection('games', function(err, c) {
        c.find({}).toArray(function(err, games) {
          res.end(JSON.stringify(games))
        })
      })
    } catch (e) {return false}
    
    return
  }
  
  if(req.url.replace(/\/$/, '').split('/').slice(-2)[0] == 'gamedata') {
    res.writeHead(200, {"Content-Type": "text/json"})

    var game_id = req.url.replace(/\/$/, '').split('/').slice(-1)[0]

    if(!game_id || game_id.length != 24)
      return '[]'
    
    try {
      D.Etc.db.collection('games', function(err, c) {
        var query = {_id: new mongo.ObjectID(game_id)}
        c.find(query).limit(1).toArray(function(err, games) {
          res.end(JSON.stringify(games[0]))
        })
      })
    } catch (e) {return false}

    return
  }

  res.writeHead(200, {"Content-Type": "text/html"})
  res.end(menu_html)
}


io.on('connection', function (socket) {
  socket.on('get-games', function (data) {
    var query = {}

    try {
      D.Etc.db.collection('games', function(err, c) {
        c.find(query).toArray(function(err, games) {
          socket.emit('games-data', games)
        })
      })
    } catch (e) {return false}

  })

  socket.on('request-data', function (data) {
    var game_id = data.game
      , session = data.session || 1 // TODO: randomize
      , query = {}

    if(!game_id || game_id.length != 24)
      return false

    try {
      query = {_id: new mongo.ObjectID(game_id)}

      console.log('joining: ', game_id, query, data)
      socket.join(game_id)

      D.Etc.db.collection('games', function(err, c) {
        c.find(query).limit(1).toArray(function(err, games) {
          io.sockets.in(game_id).emit('game-data', games[0])
        })
      })
    } catch (e) {return false}

  })

  // TODO: track active room and bounce it to new clients on connection
  // TODO: allow local video paths to punch through, then change the mongo urls
  // YAGNI: multiple sessions

  socket.on('save-game', function (game) {
    try {
      db.collection('games', function(err, c) {
        if(game._id)
          game._id = mongo.ObjectID(game._id)
        
        if(!game.rooms)
          game.rooms = [{"name" : "First Room", "id" : 0, "type" : "text","text" : null,"style" : null,"exits" : [ ],urls:{roomtype: "text",submit: "Add Room"}}]
        
        c.save(game) // sync-style is ok here, because we're not waiting for confirmation

        db.collection('history', function(err, c) {
          c.insert({cron: new Date(), game: game})
        })

        console.log('saved: ', game)
        console.log('save bounce: ', game._id)
        io.sockets.in(game._id).emit('game-data', game)
      })
    } catch (e) {return false}
  })
  
  socket.on('bounce', function (data) {
    io.sockets.in(data.game).emit('bounced', data.room)
  })
})


db.open(function(err, db) {
  if(err)
    return console.log('DB refused to open: ', err)
  app.listen(8808)
})

