let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let config = require('./config');
let mongoose = require('./lib/mongoose');
let async = require('async');
let favicon = require('serve-favicon');


let User = require('./models/user').User;
let AuthError = require('./models/user').AuthError;
//let logger = require('morgan');

let session = require('express-session');
let sessionStore = require('./lib/sessionStore')

let app = express();

let routes = ['/', '/login', 'favicon.ico'];

app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(session({
	secret: config.get('session:secret'),
	key: config.get('session:key'),
	resave: config.get('session:resave'),
	saveUninitialized: config.get('session:saveUninitialized'),
	cookie: config.get('session:cookie'),
	store: sessionStore
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
	if (!routes.includes(req.originalUrl))
		res.redirect('/');
	next();
});

app.get('/', function(req, res, next) {
	let uid = req.session.user;
	if (uid) {
		User.findOne({_id: uid}, function(err, user) {
			if (err) return next(err);
			if (user) {
				res.sendFile(path.join(__dirname + '/public/pages/index.html'));
			} else {
				res.redirect('/login');
			}
		});
	} else {
		res.redirect('/login');
	}
});

app.get('/login', function(req, res) {
	res.sendFile(path.join(__dirname + '/public/pages/login.html'));
});

app.post('/login', function(req, res, next) {
	let username = req.body.username;
	let password = req.body.password;

	User.authorize(username, password, function(err, user) {
		if (err) {
			if (err instanceof AuthError) {
				res.status(403).end();
			} else {
				return next(err);
			}
		} else {
			req.session.user = user._id;
			res.send({});
		}
	});
});

app.post('/logout', function(req, res) {
    req.session.destroy();
    res.end();
});


/*app.use(function(req, res, next) {
  next(createError(418));
});*/


app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  console.log('Error:' + err.message);
  res.end();
});

module.exports = app;
