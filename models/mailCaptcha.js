// 引入 nodemailer
var nodemailer = require('nodemailer');
// 创建一个SMTP客户端配置
var config = {
    host: 'smtp.qq.com',
    port: 465,
    auth: {
        user: '493043746@qq.com', //刚才注册的邮箱账号
        pass: 'ghzrdpdxgyvxbigd'  //邮箱的授权码，不是注册时的密码
    }
};
// 创建一个SMTP客户端对象
var transporter = nodemailer.createTransport(config);

// 发送邮件
function send(mail) {
    transporter.sendMail(mail, function (error, info) {
        if (error) {
            return console.log(error);
        }
        console.log('mail sent:', info.response);
    });
};
// 创建一个邮件对象
exports.doEmail = function (perEmail, num) {
    var mail = {
        // 发件人
        from: '493043746@qq.com',
        // 主题
        subject: '云顶JS一组简易微博',
        // 收件人
        to: perEmail,
        // 邮件内容，HTML格式
        text: "【云顶微博APP】您好，欢迎使用云顶简易微博APP，您本次注册码为：" + num + "，若非本人操作，请忽略！" //接收激活请求的链接
    };
    send(mail);
}


