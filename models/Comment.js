var mongoose = require("mongoose");
var db = require("./db.js");

var commentSchema = new mongoose.Schema({
    shuoshuo_id:{type:String},//哪条说说的评论
    comment:{type:Array},////数组元素为对象 每个对象有评论内容 用户 和时间
});

var Comment = db.model("Comment",commentSchema);

module.exports = Comment;