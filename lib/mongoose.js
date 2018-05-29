let mongoose = require('mongoose');
let config = require('../config');

mongoose.connect(config.get('mongoose:uri'));

module.exports = mongoose;