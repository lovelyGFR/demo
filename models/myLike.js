var mongoose = require('mongoose');
var db = require('./db');

var myLikeSchema = new mongoose.Schema({
    shuoshuo_id: {type: Array, default: []},//哪条说说的转发
    username: {type: String}
});

var MyLike = db.model('MyLike', myLikeSchema);

module.exports = MyLike;