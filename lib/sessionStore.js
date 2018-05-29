let mongoose = require('mongoose');
let session = require('express-session');
let MongoStore = require('connect-mongo')(session);

let sessionStore = new MongoStore({ mongooseConnection: mongoose.connection });

module.exports = sessionStore;