var cookie = require('cookie');
var config = require('../config');
var cookieParser = require('cookie-parser');
var sessionStore = require('../lib/sessionStore');
var async = require('async');
var User = require('../models/user').User;

module.exports = function(server) {
    let io = require('socket.io')(server);

function loadSession(sid, callback) {
    sessionStore.load(sid, function (err, session) {
        if (arguments.length == 0) {
            //no arguments => no session
            return callback(null, null);
        } else {
            return callback(null, session);
        }
    });
}

function loadUser (session, callback) {
    if (!session.user) {
        return callback(null, null);
    }

    User.findById(session.user, function(err, user) {
        if (err) return callback(err);
        if (!user) return callback(null, null);
        return callback(null, user);
    });

}


io.use(function(socket, next) {
    async.waterfall([
        function (callback) {
            var cookies = cookie.parse(socket.handshake.headers.cookie || '');
            var sidCookie = cookies[config.get('session:key')];
            var sid = cookieParser.signedCookie(sidCookie, config.get('session:secret'));
            
            loadSession(sid, callback);    
        },
        function (session, callback) {
            if (!session) {
                return callback(new Error(401, "No session"));
            }

            socket.handshake.session = session;
            loadUser(session, callback);
        },
        function (user, callback) {
            if (!user) 
                return callback(new Error(403, "Anonymous session may not connect"));
            
            callback(null, user);
        }
    ], function (err, user) {
        if (err) {
            if (err instanceof HttpError) 
                return next(new Error('not authorized'));
            next(err);
        }

        socket.handshake.user = user;
        next();

    });
});

io.on('connection', function(socket) {
    let user = socket.handshake.user;
    socket.emit('user data', user);

    console.log('a user %s connected', user.username);

    socket.on('disconnect', function() {
        console.log('user %s disconnected', user.username);
    });

    socket.on('message', function(data, cb) {
        data.author = user.username;
        socket.broadcast.emit('message', data);
        cb(); 
    });

    socket.on('sos', function() {
        console.log('sos event');
    })
});
}