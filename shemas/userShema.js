/*
* MongooseShema
*/
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var user = new mongoose.Schema({
    firstname: String,
    lastname: String,
    email: String,
    password: String
});

module.exports = mongoose.model('user', user);   