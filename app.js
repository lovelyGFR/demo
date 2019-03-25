var express = require("express");
var app = express();
var session = require("express-session");
var router = require("./router/router.js");
var captcha = require("./models/captcha.js");
// var bodyParser = require('body-parser');
var cors = require('cors');


app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));


app.use("/avatar",express.static("./avatar"));
app.use("/imageWb",express.static("./imageWB"));
app.use(cors());
// // parse application/x-www-form-urlencoded
// app.use(bodyParser.urlencoded({ extended: false }));
// // parse application/json
// app.use(bodyParser.json());

//首页
app.get("/",router.showIndex);
//图片验证码
app.get("/captcha",function(req,res){
    captcha.getCaptcha(req,res);
});
//邮件验证码
app.post("/sendCaptcha",router.sendCaptcha);
//执行注册
app.post("/doRegister",router.doRegister);
//执行登陆
app.post("/doLogin",router.doLogin);
//注销
app.get("/doLogout",router.doLogout);
//展示个人信息
app.get("/showInformation",router.showInformation);
//执行修改
app.post("/doEditInformation",router.doEditInformation);
//发表说说
app.post("/postShuoshuo",router.postShuoshuo);
//删除说说
app.post("/doDelete",router.doDelete);
//转发说说
app.post("/doRelay",router.doRelay);
//关注
app.get("/doFocus",router.doFocus);
//点赞
app.post("/doLike",router.doLike);
//点赞榜
app.get("/likeList",router.likeList);
//转发榜
app.get("/relayList",router.relayList);
//评论
app.post("/doComment",router.doComment);
//收藏
app.post("/doCollect",router.doCollect);
// 查询评论
app.post('/showComment',router.showComment);

app.get('/myLike',router.myLike);

app.get('/myCollection',router.myCollection);

app.post('/uploadAvatar', router.uploadAvatar);

app.post('/uploadImage',router.uploadImage);



// app.post('/judgeLike', router.judgeLike);

app.listen(3000);