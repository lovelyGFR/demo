var mongoose = require("mongoose");
var db = require("./db.js");

var likeSchema = new mongoose.Schema({
    shuoshuo_id:{type:String},//哪条说说的点赞
    like:{type:Array},//数组元素为对象 每个对象有时间和用户
});

var Like = db.model("Like",likeSchema);

module.exports = Like;