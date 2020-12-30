/*
* MongooseShema
*/
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var linkRestorePwd = new mongoose.Schema({
    date: Date,
    contact_email: String,
    hash: String
});

module.exports = mongoose.model('linkRestorePwd', linkRestorePwd);  