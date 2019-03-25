var mongoose = require("mongoose");
var db = require("./db.js");

var shuoshuoSchema = new mongoose.Schema({
    content: {type: String},
    author: {type: String},
    nickname: {type: String},
    time: {type: String, default: new Date().format("yyyy-MM-dd hh:mm:ss")},
    images: {type: Array, default: []},
    like_num: {type: Number, default: 0},
    relay_num: {type: Number, default: 0},
    avatar: {type: Object}
});

var Shuoshuo = db.model("Shuoshuo", shuoshuoSchema);

module.exports = Shuoshuo;