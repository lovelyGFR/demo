var formidable = require("formidable");
var path = require("path");
var fs = require("fs");
var User = require("../models/User");
var md5 = require("../models/md5.js");
var Shuoshuo = require("../models/Shuoshuo.js");
var Like = require("../models/Like.js");
var Relay = require("../models/Relay.js");
var Comment = require("../models/Comment.js");
var mailCaptcha = require("../models/mailCaptcha.js");
var MyLike = require('../models/myLike');
var async = require('async');



//首页
exports.showIndex = function (req, res, next) {
    console.log(req.session.username);
    Shuoshuo.find({}).sort({'time': -1}).exec(function (err, result) {
        if (err) {
            res.json({
                "code": -4,
                "descript": "服务器错误"
            });
            return;
        }
        res.json({
            "code": 1,
            "descript": "所有说说",
            "data": result
        });
    });
};
//发送邮件验证码
exports.sendCaptcha = function (req, res, next) {
    console.log("lai");
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var mailCaptchaNum = Math.floor(Math.random() * (999999 - 100000 + 1) + 100000);
        req.session.mailCaptcha = mailCaptchaNum;
        console.log(mailCaptchaNum);
        var mail = fields.mail;
        mailCaptcha.doEmail(mail, mailCaptchaNum);
        res.json({
            "code": 1,
            "descript": "邮件注册码发送成功"
        });

    })


};
//注册业务
exports.doRegister = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        console.log(fields);
        var username = fields.username;
        var password = fields.password;
        var captcha = fields.captcha;
        var mail = fields.mail;
        var mailCaptcha = fields.mailCaptcha;
        var nickname = "手机用户" + username;
        if (mailCaptcha != req.session.mailCaptcha) {
            //输入的邮箱注册码错误
            res.json({
                "code": -3,
                "descript": "输入的邮箱注册码错误"
            });
            return;
        }
        //输入的图片注册码错误
        if (captcha != req.session.captcha) {
            res.json({
                "code": -2,
                "descript": "输入的图片注册码错误"
            });
            return;
        }
        console.log("手机号为" + username + "开始注册");
        User.find({"username": username}, function (err, result) {
            if (err) {
                res.json({
                    "code": -4,
                    "descript": "服务器错误"
                });
                return;
            }
            if (result.length != 0) {
                //用户名被占用
                res.json({
                    "code": -1,
                    "descript": "用户名被占用"
                });
                return;
            }
            //设置md5加密
            password = md5(md5(password) + md5(password) + "panda");
            var userInformation = {
                "username": username,
                "password": password,
                "mail": mail,
                "nickname": nickname,
            };
            User.create(userInformation, function (err, result) {
                MyLike.create({"username": username}, function (err, result) {
                });
                if (err) {
                    res.json({
                        "code": -4,
                        "descript": "服务器错误"
                    });
                    return;
                }
                req.session.login = "1";
                req.session.username = username;
                req.session.nickname = nickname;
                res.json({
                    "code": 1,
                    "descript": "注册成功"
                });
                console.log(username + "注册成功");
            });
        });
    });
};
//登陆业务
exports.doLogin = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var username = fields.username;
        var password = fields.password;
        var md5Password = md5(md5(password) + md5(password) + "panda");
        User.find({"username": username}, function (err, result) {
            if (err) {
                res.json({
                    "code": -4,
                    "descript": "服务器错误"
                });
                return;
            }
            if (result.length === 0) {
                //查无此人
                res.json({
                    "code": -2,
                    "descript": "查无此人"
                });
                return;
            }
            if (md5Password === result[0].password) {
                //登陆成功
                req.session.login = "1";
                req.session.username = username;
                console.log(req.session.username + "登陆完成");
                req.session.nickname = result[0].nickname;
                res.json({
                    "code": 1,
                    "descript": "登陆成功"
                });
            } else {
                //密码错误
                res.json({
                    "code": -1,
                    "descript": "密码错误"
                });
                return;
            }
        });
    });
};
//注销业务
exports.doLogout = function (req, res, next) {
    req.session.destroy(function (err, result) {
        if (err) {
            res.json({
                "code": -4,
                "descript": "服务器错误，注销失败"
            });
            return;
        } else {
            console.log("注销成功");
            res.json({
                "code": 1,
                "descript": "注销成功"
            });
        }
    });
};
//个人信息
exports.showInformation = function (req, res, next) {
    if (req.session.login !== "1") {
        res.json({
            "code": 0,
            "descript": "未登录"
        });
        return;
    }
    console.log(req.session.username + "个人信息");
    User.find({"username": req.session.username}, function (err, result) {
        if (err) {
            res.json({
                "code": -4,
                "descript": "服务器错误"
            });
            return;
        }

        //发送个人信息
        res.json({
            "code": 1,
            "descript": "个人信息",
            "data": result
        });
    });
};

//执行修改
exports.doEditInformation = function (req, res, next) {
    var data = {};
    var username = req.session.username;
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        for (i in fields) {
            if (fields[i] === "" || i === "data" || i === "show" || i === "avatar") {
                continue;
            }
            data[i] = fields[i];
        }
        if (fields.nickname !== "") {
            User.find({"nickname": data.nickname}, function (err, result) {
                if (result.length !== 0) {
                    res.json({
                        "code": -1,
                        "descript": "昵称已存在"
                    });
                    return
                }
            });
            Shuoshuo.updateMany({"author": username}, {
                $set: {"nickname": data.nickname}
            }, function (err, result) {
                console.log(result);
            });
        }

        if (fields.avatar !== "") {
            Shuoshuo.updateMany({author: username}, {
                $set: {avatar: data.avatar}
            }, function (err, result) {
                if (err) {
                    res.json({
                        "code": -4,
                        "descript": "服务器错误"
                    });
                    return;
                }
            });
        }
        User.updateMany({username: username}, {
            $set: data
        }, function (err, result) {
            if (err) {
                res.json({
                    "code": -4,
                    "descript": "服务器错误"
                });
                return;
            }
            res.json({
                "code": 1,
                "descript": "个人信息修改成功"
            });
        });
    });
};

// 接收图片
exports.uploadAvatar = function (req, res, next) {
    let username = req.session.username;
    var form = new formidable.IncomingForm();
    form.uploadDir = path.normalize(__dirname + "/../avatar");
    form.parse(req, function (err, fields, files) {
        console.log("接收图片");
        console.log(fields);
        console.log(files);
        var num = Math.floor(Math.random() * (999999 - 100000 + 1) + 100000);
        var extname = path.extname(fields.path);
        var oldpath = files.avatar.path;
        var newpath = path.normalize(__dirname + "/../avatar") + "/" + num + extname;
        fs.rename(oldpath, newpath, function (err) {
            if (err) {
                res.json({
                    "code": -4,
                    "descript": "服务器错误"
                });
                return;
            }
            req.session.avatar = "http://192.168.1.101:3000/avatar/" + num + extname;
            console.log(req.session.avatar);
            let avatar = {uri: req.session.avatar};
            console.log("改名成功");
            Shuoshuo.updateMany({author: username}, {
                $set: {avatar: avatar}

            }, function (err, result) {
                if (err) {
                    res.json({
                        "code": -4,
                        "descript": "服务器错误"
                    });
                    return;
                }
            });

            User.updateMany({username: username}, {
                $set: {avatar: avatar}
            }, function (err, result) {
                if (err) {
                    res.json({
                        "code": -4,
                        "descript": "服务器错误"
                    });
                    return;
                }
                res.json({
                    "code": 1,
                    "descript": "修改成功"
                });
                console.log("修改成功");
                return
            });


        });
    })
};

//发表说说
exports.postShuoshuo = function (req, res, next) {
    if (req.session.login !== "1") {
        res.json({
            "code": -1,
            "descript": "未登录"
        });
        return;
    }
    var username = req.session.username;
    var nickname = req.session.nickname;
    var form = new formidable.IncomingForm();
    form.uploadDir = path.normalize(__dirname + "/../imageWB");
    form.parse(req, function (err, fields, files) {
        if (err) {
            res.json({
                "code": -4,
                "descript": "服务器错误"
            });
            return;
        }
        User.find({"username": username}, function (err, result) {
            if (err) {
                res.json({
                    "code": -4,
                    "descript": "服务器错误"
                });
                return;
            }
            var content = fields.shuoshuo;
            var avatar = result[0].avatar;
            Shuoshuo.create({
                "content": content,
                "author": username,
                "nickname": nickname,
                "avatar": avatar,
            }, function (err, result) {
                if (err) {
                    res.json({
                        "code": -4,
                        "descript": "服务器错误"
                    });
                    return;
                }
                var shuoshuo_id = result._id;
                Like.create({"shuoshuo_id": shuoshuo_id}, function (err, result) {
                    if (err) {
                        res.json({
                            "code": -4,
                            "descript": "服务器错误"
                        });
                        return;
                    }
                    console.log("点赞创建成功");
                });
                Relay.create({"shuoshuo_id": shuoshuo_id}, function (err, result) {
                    if (err) {
                        res.json({
                            "code": -4,
                            "descript": "服务器错误"
                        });
                        return;
                    }
                    console.log("转发创建成功");
                });
                Comment.create({"shuoshuo_id": shuoshuo_id}, function (err, result) {
                    if (err) {
                        res.json({
                            "code": -4,
                            "descript": "服务器错误"
                        });
                        return;
                    }
                    console.log("评论创建成功");
                });

                console.log("发表成功");
                res.json({
                    "code": 1,
                    "descript": "发表成功",
                    "id": result._id
                });
            });
        });
    });
};

// 接收说说图片
exports.uploadImage = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.uploadDir = path.normalize(__dirname + "/../imageWB");
    form.parse(req, function (err, fields, files) {
        console.log("接收图片");
        console.log(fields);
        console.log(files);
        var num = Math.floor(Math.random() * (999999 - 100000 + 1) + 100000);
        var extname = path.extname(fields.path);
        var oldpath = files.avatar.path;
        var newpath = path.normalize(__dirname + "/../imageWB") + "/" + num + extname;
        fs.rename(oldpath, newpath, function (err) {
            if (err) {
                res.json({
                    "code": -4,
                    "descript": "服务器错误"
                });
                return;
            }
            Shuoshuo.find({_id: fields.id},function (err,result) {
                result[0].images.push("http://192.168.1.101:3000/imageWB/" + num + extname);
                Shuoshuo.updateMany({_id: fields.id}, {
                    $set: {images: result[0].images}
                }, function (err, result) {
                    if (err) {
                        res.json({
                            "code": -4,
                            "descript": "服务器错误"
                        });
                        return;
                    }
                    res.json({
                        "code": 1,
                        "descript": "图片上传成功"
                    });
                });
            });

        });
    })
};

//个人信息页删除说说
exports.doDelete = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        if (err) {
            res.json({
                "code": -4,
                "descript": "服务器错误"
            });
            return;
        }
        var _id = fields.id;
        Shuoshuo.remove({"_id": _id}, function (err, result) {
            if (err) {
                res.json({
                    "code": -4,
                    "descript": "服务器错误"
                });
                return;
            }
            Like.remove({"shuoshuo_id": _id}, function (err, result) {
                if (err) {
                    res.json({
                        "code": -4,
                        "descript": "服务器错误"
                    });
                    return;
                }
                console.log("对应的点赞信息删除成功");
            });
            Relay.remove({"shuoshuo_id": _id}, function (err, result) {
                if (err) {
                    res.json({
                        "code": -4,
                        "descript": "服务器错误"
                    });
                    return;
                }
                console.log("对应的转发信息删除成功");
            });
            Comment.remove({"shuoshuo_id": _id}, function (err, result) {
                if (err) {
                    res.json({
                        "code": -4,
                        "descript": "服务器错误"
                    });
                    return;
                }
                console.log("对应的评论信息删除成功");
            });
            console.log("删除说说成功");
            res.json({
                "code": 1,
                "descript": "删除说说成功"
            });
        });
    });
}
//转发
exports.doRelay = function (req, res) {
    var username = req.session.username;
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        if (err) {
            res.json({
                "code": -4,
                "descript": "服务器错误"
            });
            return;
        }
        var shuoshuo_id = fields.id;
        User.find({"username": username}, function (err, result) {
            if (err) {
                res.json({
                    "code": -4,
                    "descript": "服务器错误"
                });
                return;
            }
            var avatar = result[0].avatar;
            var nickname = result[0].nickname;
            Shuoshuo.find({"_id": shuoshuo_id}, function (err, result) {
                // 说说集合中新建一条说说
                var content = result[0].content;
                var relay_num = result[0].relay_num + 1;
                Shuoshuo.update({"_id": shuoshuo_id}, {
                    $set: {
                        "relay_num": relay_num
                    }
                }, function (err, result) {
                    if (err) {
                        res.json({
                            "code": -4,
                            "descript": "服务器错误"
                        });
                        return;
                    }
                    console.log("原说说的转发+1");
                    //转发数+1
                });
                var new_relay_num = 0;
                var new_like_num = 0;
                Shuoshuo.create({
                    "author": username,
                    "content": content,
                    "relay_num": new_relay_num,
                    "like_num": new_like_num,
                    "avatar": avatar,
                    "nickname": nickname
                }, function (err, result) {
                    if (err) {
                        res.json({
                            "code": -4,
                            "descript": "服务器错误"
                        });
                        return;
                    }
                    var relay_Id = result._id;
                    Like.create({"shuoshuo_id": relay_Id}, function (err, result) {
                        if (err) {
                            res.json({
                                "code": -4,
                                "descript": "服务器错误"
                            });
                            return;
                        }
                        console.log("点赞创建成功");
                    });
                    Relay.create({"shuoshuo_id": relay_Id}, function (err, result) {
                        if (err) {
                            res.json({
                                "code": -4,
                                "descript": "服务器错误"
                            });
                            return;
                        }
                        console.log("转发创建成功");
                    });
                    Comment.create({"shuoshuo_id": relay_Id}, function (err, result) {
                        if (err) {
                            res.json({
                                "code": -4,
                                "descript": "服务器错误"
                            });
                            return;
                        }
                        console.log("评论创建成功");
                    });
                    Relay.find({"shuoshuo_id": shuoshuo_id}, function (err, result) {
                        var relay = {relay_user: username, relay_time: new Date().format("yyyy-MM-dd hh:mm:ss")};
                        result[0].relay.push(relay);
                        Relay.update({"shuoshuo_id": shuoshuo_id}, {
                            $set: {
                                "relay": result[0].relay
                            }
                        }, function (err, result) {
                            if (err) {
                                res.json({
                                    "code": -4,
                                    "descript": "服务器错误"
                                });
                                return;
                            }
                            console.log("转发成功");
                            res.json({
                                "code": 1,
                                "descript": "转发成功"
                            });
                        });
                    });
                });
            });
        });
    });
};
//关注功能
exports.doFocus = function (req, res, next) {
    var focusUsername = req.query.username;
    var username = req.session.username;
    User.find({"username": username}, function (err, result) {
        if (err) {
            res.json({
                "code": -4,
                "descript": "服务器错误"
            });
            return;
        }
        if (result[0].focus.indexOf(focusUsername) != -1) {
            res.json({
                "code": -1,
                "descript": "已关注"
            });
            return;
        }
        result[0].focus.push(focusUsername);
        var focus = result[0].focus;
        User.update({"username": username}, {$set: {"focus": focus}}, function (err, result) {
            if (err) {
                res.json({
                    "code": -4,
                    "descript": "服务器错误"
                });
                return;
            }
            User.find({"username": focusUsername}, function (err, result) {
                if (err) {
                    res.json({
                        "code": -4,
                        "descript": "服务器错误"
                    });
                    return;
                }
                result[0].fans.push(username);
                var fans = result[0].fans;
                User.update({"username": focusUsername}, {$set: {"fans": fans}}, function (err, result) {
                    if (err) {
                        res.json({
                            "code": -4,
                            "descript": "服务器错误"
                        });
                        return;
                    }
                    console.log("关注成功");
                    res.json({
                        "code": 1,
                        "descript": "关注成功"
                    });
                });
            });
        });
    });
}

//说说点赞
exports.doLike = function (req, res, next) {
    var likePerson = req.session.username;
    var time = new Date().format("yyyy-MM-dd hh:mm:ss");
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var shuoshuo_id = fields.id;
        Like.find({"shuoshuo_id": shuoshuo_id}, function (err, result) {
            if (err) {
                res.json({
                    "code": -4,
                    "descript": "服务器错误"
                });
                return;
            }
            if (result[0].like.findIndex((element) => element.like_user == likePerson) != -1) {
                console.log("你已经点过赞了，点了之后将会取消点赞");
                Shuoshuo.find({"_id": shuoshuo_id}, function (err, result) {
                    if (err) {
                        res.json({
                            "code": -4,
                            "descript": "服务器错误"
                        });
                        return;
                    }
                    var like_num = result[0].like_num - 1;
                    Shuoshuo.update({"_id": shuoshuo_id}, {
                        $set: {
                            "like_num": like_num
                        }
                    }, function (err, result) {
                        if (err) {
                            res.json({
                                "code": -4,
                                "descript": "服务器错误"
                            });
                            return;
                        }
                        console.log("原说说的点赞-1");
                        //点赞数+1
                    });
                });
                var index = result[0].like.findIndex((element) => element.like_uer == likePerson);
                result[0].like.splice(index, 1);
                Like.update({"shuoshuo_id": shuoshuo_id}, {
                    $set: {
                        "like": result[0].like
                    }
                }, function (err, result) {
                    if (err) {
                        res.json({
                            "code": -4,
                            "descript": "服务器错误"
                        });
                        return;
                    }
                });

                MyLike.find({"username": req.session.username}, function (err, result) {
                    if (err) {
                        res.json({
                            "code": -4,
                            "descript": "服务器错误"
                        });
                        return;
                    }
                    let arr = result[0].shuoshuo_id;
                    for (i in arr) {
                        if (arr[i] === shuoshuo_id) {
                            arr.splice(i, 1);
                        }
                    }

                    MyLike.updateMany({"username": req.session.username}, {
                        $set: {
                            "shuoshuo_id": arr,
                        }
                    }, function (err, result) {
                        if (err) {
                            res.json({
                                "code": -4,
                                "descript": "服务器错误"
                            });
                            return;
                        }
                        console.log("取消点赞成功");
                        res.json({
                            "code": 2,
                            "descript": "取消点赞成功"
                        });
                    });


                });
            } else {
                Shuoshuo.find({"_id": shuoshuo_id}, function (err, result) {
                    var like_num = result[0].like_num + 1;
                    Shuoshuo.update({"_id": shuoshuo_id}, {
                        $set: {
                            "like_num": like_num
                        }
                    }, function (err, result) {
                        if (err) {
                            res.json({
                                "code": -4,
                                "descript": "服务器错误"
                            });
                            return;
                        }
                        console.log("原说说的点赞+1");
                        //点赞数+1
                    });
                });
                var like = {like_user: likePerson, like_time: time};
                result[0].like.push(like);
                Like.update({"shuoshuo_id": shuoshuo_id}, {
                    $set: {
                        "like": result[0].like,
                    }
                }, function (err, result) {
                    if (err) {
                        res.json({
                            "code": -4,
                            "descript": "服务器错误"
                        });
                        return;
                    }
                });

                MyLike.find({"username": req.session.username}, function (err, result) {
                    if (err) {
                        res.json({
                            "code": -4,
                            "descript": "服务器错误"
                        });
                        return;
                    }
                    result[0].shuoshuo_id.push(shuoshuo_id);
                    MyLike.updateMany({"username": req.session.username}, {
                        $set: {
                            "shuoshuo_id": result[0].shuoshuo_id,
                        }
                    }, function (err, result) {
                        if (err) {
                            res.json({
                                "code": -4,
                                "descript": "服务器错误"
                            });
                            return;
                        }
                        console.log("点赞成功");
                        res.json({
                            "code": 1,
                            "descript": "点赞成功"
                        });
                    });
                });
            }
        });
    });
};

//点赞榜
exports.likeList = function (req, res, next) {
    Shuoshuo.find({}).sort({"like_num": -1, "relay_num": -1}).exec(function (err, result) {
        if (err) {
            res.json({
                "code": -4,
                "descript": "服务器错误"
            });
            return;
        }
        res.json({
            "code": 1,
            "descript": "点赞榜",
            "data": result
        });
    })
};

//转发榜
exports.relayList = function (req, res, next) {
    Shuoshuo.find({}).sort({"relay_num": -1, "like_num": -1}).exec(function (err, result) {
        if (err) {
            res.json({
                "code": -4,
                "descript": "服务器错误"
            });
            return;
        }
        res.json({
            "code": 1,
            "descript": "转发榜",
            "data": result
        });
    })
};

//评论
exports.doComment = function (req, res, next) {
    var nickname = req.session.nickname;
    var time =new Date().format("yyyy-MM-dd hh:mm:ss");
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var shuoshuo_id = fields.id;
        var content = fields.content;
        Comment.find({"shuoshuo_id": shuoshuo_id}, function (err, result) {
            if (err) {
                res.json({
                    "code": -4,
                    "descript": "服务器错误"
                });
                return;
            }
            var comment = {comment_content: content, comment_user: nickname, comment_time: time};
            result[0].comment.push(comment);
            Comment.update({"shuoshuo_id": shuoshuo_id}, {
                $set: {
                    "comment": result[0].comment
                }
            }, function (err, result) {
                if (err) {
                    res.json({
                        "code": -4,
                        "descript": "服务器错误"
                    });
                    return;
                }
                console.log("评论成功");
                res.json({
                    "code": 1,
                    "descript": "评论成功"
                });
            });
        });
    });
};

//收藏
exports.doCollect = function (req, res, next) {
    var username = req.session.username;
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var shuoshuo_id = fields.id;
        User.find({"username": username}, function (err, result) {
            if (err) {
                res.json({
                    "code": -4,
                    "descript": "服务器错误"
                });
                return;
            }
            if (result[0].shuoshuo_collection.indexOf(shuoshuo_id) != -1) {
                // 已收藏
                var index = result[0].shuoshuo_collection.findIndex((element) => element === fields.id);
                result[0].shuoshuo_collection.splice(index, 1);
                User.updateMany({"username": username}, {
                    $set: {
                        "shuoshuo_collection": result[0].shuoshuo_collection
                    }
                }, function (err, result) {
                    if (err) {
                        res.json({
                            "code": -4,
                            "descript": "服务器错误"
                        });
                        return;
                    }
                    res.json({
                        "code": 2,
                        "descript": "取消收藏"
                    });
                    return;
                });
            } else {
                result[0].shuoshuo_collection.push(shuoshuo_id);
                User.updateMany({"username": username}, {$set: {"shuoshuo_collection": result[0].shuoshuo_collection}}, function (err, result) {
                    if (err) {
                        res.json({
                            "code": -4,
                            "descript": "服务器错误"
                        });
                        return;
                    }
                    res.json({
                        "code": 1,
                        "descript": "收藏成功",
                    });
                });
            }

        });
    });
};

// 我的点赞
exports.myLike = function (req, res, next) {
    MyLike.find({username: req.session.username}, function (err, result) {
        async.map(result, (item, callback) => {
            let data = [];
            item.shuoshuo_id.forEach((value) => {
                Shuoshuo.find({_id: value}, (err, result) => {
                    data.push(result[0]);
                    if (data.length === item.shuoshuo_id.length) {
                        callback(err, data);
                    }
                })
            });
        }, (err, data) => {
            res.json({
                code: 1,
                descript: "我的点赞",
                data: data
            })
        });
    })
};

// 我的收藏
exports.myCollection = function (req, res, next) {
    User.find({username: req.session.username}, function (err, result) {
        async.map(result, (item, callback) => {
            let data = [];
            item.shuoshuo_collection.forEach((value) => {
                Shuoshuo.find({_id: value}, (err, result) => {
                    data.push(result[0]);
                    if (data.length === item.shuoshuo_collection.length) {
                        callback(err, data);
                    }
                })
            });
        }, (err, data) => {
            res.json({
                code: 1,
                descript: "我的收藏",
                data: data
            })
        });
    })
};

// 查询评论
exports.showComment = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        Comment.find({"shuoshuo_id": fields.id}, function (err, result) {
            if (err) {
                res.json({
                    "code": -1,
                    "descript": "服务器错误"
                });
                return;
            }

            res.json({
                "code": 1,
                "descript": "评论内容",
                "data": result[0].comment
            });
        })
    })
};

// exports.judgeLike = function (req, res, next) {
//     var form = new formidable.IncomingForm();
//     form.parse(req, function (err, fields, files) {
//         MyLike.find({"username": req.session.username}, function (err, result) {
//             if (err) {
//                 res.json({
//                     "code": -1,
//                     "descript": "服务器错误"
//                 });
//                 return;
//             }
//             console.log(req.session.username);
//             console.log(fields);
//             result[0].shuoshuo_id.forEach((value) => {
//                 if (fields.id === value) {
//                     res.json({
//                         "code": 2,
//                         "descript": "已点赞"
//                     });
//                     return;
//                 }
//             });
//             res.json({
//                 "code": 1,
//                 "descript": "未点赞"
//             });
//         })
//     })
// };










