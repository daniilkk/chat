let cookie = require('cookie');
let config = require('../config');
let cookieParser = require('cookie-parser');
let sessionStore = require('../lib/sessionStore');
let async = require('async');
let User = require('../models/user').User;

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
            let cookies = cookie.parse(socket.handshake.headers.cookie || '');
            let sidCookie = cookies[config.get('session:key')];
            let sid = cookieParser.signedCookie(sidCookie, config.get('session:secret'));
            
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
            if (err instanceof Error) 
                return next(new Error('not authorized'));
            next(err);
        }

        socket.handshake.user = user;
        next();

    });
});

let onlineUsers = [];

io.on('connection', function(socket) {
    let user = socket.handshake.user;
    socket.emit('user data', user);
    console.log('a user %s connected', user.username);

    onlineUsers.push(user.username);
    console.log('users online: ', onlineUsers);
    
    io.emit('online list render', onlineUsers);

    socket.on('disconnect', function() {
        console.log('user %s disconnected', user.username);

        onlineUsers.splice(onlineUsers.indexOf(user.username), 1);
        console.log('users online: ', onlineUsers);

        io.emit('online list render', onlineUsers);
    });

    socket.on('message', function(msgObj, cb) {
        let dateString = (new Date).toString();
        let time = dateString.split(' ')[4].slice(0, -3);

        msgObj.author = user.username;
        msgObj.time = time;
        socket.broadcast.emit('message', msgObj);
        cb(msgObj);
    });

});
}