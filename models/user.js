let mongoose = require('../lib/mongoose');
let crypto = require('crypto');
let async = require('async');
let util = require('util');


let schema = new mongoose.Schema({
	username: {
		type: String,
		unique: true,
		required: true
	},
	hashedPassword: {
		type: String,
		required: true
	},
	salt: {
		type: String,
		required: true
	},
	creationDate: {
		type: Date,
		default: Date.now
	}
});

schema.methods.encryptPassword = function(password) {
	return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
}

schema.virtual('password')
	.set(function(password) {
		this._plainPassword = password;
		this.salt = Math.random() + '';
		this.hashedPassword = this.encryptPassword(password);
	})
	.get(function() {
		return this._plainPassword;
	})

schema.methods.checkPassword = function(password) {
	return this.encryptPassword(password) === this.hashedPassword;
};

schema.statics.authorize = function(username, password, callback) {
	let User = this;

	async.waterfall([
		callback => {
			User.findOne({username: username}, callback);	
		},
		(user, callback) => {
			if (user) {
				if (user.checkPassword(password)){
					callback(null, user);
				}
			 	else {
			 		callback(new AuthError('Wrong password'));
			 		//res.status(403).end();
			 	}
			} else {
				var user = new User({username: username, password: password});
				user.save(function(err) {
					if (err) return call(err);
					callback(null, user);
				});
			}
		}
	], callback);
};

exports.User = mongoose.model('User', schema);

function AuthError(message) {
	Error.apply(this, arguments);
	Error.captureStackTrace(this, AuthError);

	this.message = message;
}

util.inherits(AuthError, Error);

AuthError.prototype.name = 'AuthError';

exports.AuthError = AuthError;