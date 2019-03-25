var mongoose = require("mongoose");
var db = require("./db.js");

var userSchema = new mongoose.Schema({
    username: {type: String,},//用户名
    password: {type: String},//密码
    date: {type: String, default: new Date().format("yyyy-MM-dd hh:mm:ss")},//注册时间
    avatar: {type: Object, default: {uri: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1553103173205&di=e0c2dc61c69a9628251b502d837ded37&imgtype=0&src=http%3A%2F%2Fimage.biaobaiju.com%2Fuploads%2F20181004%2F18%2F1538648462-ZdXnpKUAzV.jpg'}},//头像
    nickname: {type: String},//昵称
    name: {type: String, default: '未填写'},//姓名
    sex: {type: String, default: '未填写'},//性别
    address: {type: String, default: '未填写'},//所在地
    birthday: {type: String, default: '未填写'},//生日
    sign: {type: String, default: '未填写'},//个性签名
    mail: {type: String},//邮箱
    qq: {type: String, default: '未填写'},//qq
    school: {type: String, default: '未填写'},//学校
    label: {type: String, default: '未填写'}, //标签
    focus: {type: Array, default: []},//关注
    fans: {type: Array, default: []},//粉丝
    shuoshuo_collection: {type: Array, default: []}
});

var User = db.model("User", userSchema);

module.exports = User;