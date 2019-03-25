var svgCaptcha = require('svg-captcha');

exports.getCaptcha  = function (req,res) {
    codeConfig = {
        size: 4,// 验证码长度
        ignoreChars: '0o1i', // 验证码字符中排除 0o1i
        noise: 3, // 干扰线条的数量
        height: 44,
        background: "white"
    };

    var captcha = svgCaptcha.create(codeConfig);
    req.session.captcha = captcha.text.toLowerCase(); //存session用于验证接口获取文字码
    console.log(req.session.captcha);
    res.type('svg');
    res.status(200).send(captcha.data);
};