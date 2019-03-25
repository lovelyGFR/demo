var mongoose = require('mongoose');
var db = require('./db');

var relaySchema = new mongoose.Schema({
    shuoshuo_id: {type: String},//哪条说说的转发
    relay: {type: Array},//数组元素为对象 每个对象有时间和用户
});

var Relay = db.model('Relay', relaySchema);

module.exports = Relay;