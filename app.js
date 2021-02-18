const express = require('express');
const app = express();
const http = require('http').createServer(app);
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const checkEqual = require('./src/checkEqual.js');//导入自定义模块
const checkCookieEqual = require('./src/checkCookieRepeat.js');//导入自定义模块
const port = 2020;
http.listen(port, () => {
    console.log(`服务器启动成功，正在监听${port}端口`);
})
const io = require('socket.io')(http);

//创建一个用户列表
var userList = [];

//配置中间件
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));
//配置cookie
app.use(cookieParser());

app.get('/', (req, res) => {
    //判断如果用户登录过，则直接跳到聊天界面
    if (req.cookies.userName) {
        return res.redirect('/home');
    } else {
        res.sendFile(__dirname + '/public/login.html');
    }
})

app.get('/home', (req, res) => {
    //如果userNamecookie不存在，则跳到登录页面
    if (!req.cookies.userName) {
        return res.redirect('/');
    } else {
        res.sendFile(__dirname + '/public/home.html');
    }
})

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html')
})

app.post('/doLogin', (req, res) => {
    var body = req.body;
    res.cookie("userName", escape(body.userName), { encode: val => val });
    res.cookie("headSrc", body.headSrc, { encode: val => val });
    var userData = {
        userName: body.userName,
        headSrc: body.headSrc
    }
    //将用户信息保存到用户列表中,判断如果用户列表中已存在相同的用户名和密码则不添加到用户列表
    checkCookieEqual.checkCookieRepeat(userList, userData);
    res.sendFile(__dirname + '/public/home.html');
})

app.get('*', (req, res) => {
    res.sendFile(__dirname + '/public/404.html');
})


//以下的代码是socket.io的代码
io.on('connection', (socket) => {
    //用来判断用户名是否重复
    socket.emit('login', userList);

    //接收home页面的socket请求
    socket.on('compare', (data) => {
        socket.userName = data.userName;
        socket.headSrc = data.headSrc;
        /*
            找到用户列表中跟data.username相同的对象，删除并将当前的添加进去
            目的是为了在刷新的时候用户没有从用户列表中删除
        */
        checkEqual.checkEqual(userList, data);
        userList.push(data);

        //把有用户进入聊天室的信息发送给所有人
        io.emit('addUser', data);
        //把所有的用户信息发送给所有人
        io.emit('userList', userList);
        //把用户列表发给登录页面
    })

    //接收消息
    socket.on('sendMessage', (data) => {
        //私聊消息
        if (data.toName !== "群聊") {
            //发送消息给指定的人
            var tosocket = null;
            for (const key in io.sockets.sockets) {
                if (io.sockets.sockets[key].userName == data.toName) {
                    tosocket = key;
                    break;
                }
            }
            var toOther = {
                type: '私聊',
                userName: socket.userName,
                headSrc: socket.headSrc,
                message: data.message
            }
            var toMe = {
                type: '私聊',
                userName: socket.userName,
                headSrc: socket.headSrc,
                toName: data.toName,
                message: data.message
            }
            //给指定对象发送消息
            socket.to(tosocket).emit('sendBack', toOther);
            //发送消息给自己
            socket.emit('sendBack', toMe);
        } else {
            var moreChatData = {
                type: '群聊',
                userName: socket.userName,
                headSrc: socket.headSrc,
                message: data.message
            }
            //通过io发送给每一个人
            io.emit('sendBack', moreChatData);
        }
    })

    //接收图片
    socket.on('sendImg', (data) => {
        //私聊消息
        if (data.toName !== "群聊") {
            //发送消息给指定的人
            var tosocket = null;
            for (const key in io.sockets.sockets) {
                if (io.sockets.sockets[key].userName == data.toName) {
                    tosocket = key;
                    break;
                }
            }
            var toOther = {
                type: '私聊',
                userName: socket.userName,
                headSrc: socket.headSrc,
                message: data.imgMessage
            }
            var toMe = {
                type: '私聊',
                userName: socket.userName,
                headSrc: socket.headSrc,
                toName: data.toName,
                message: data.imgMessage
            }
            //给指定对象发送消息
            socket.to(tosocket).emit('sendImgBack', toOther);
            //发送消息给自己
            socket.emit('sendImgBack', toMe);
        } else {
            var moreChatData = {
                type: '群聊',
                userName: socket.userName,
                headSrc: socket.headSrc,
                message: data.imgMessage
            }
            //通过io发送给每一个人
            io.emit('sendImgBack', moreChatData);
        }
    })

    //连接断开后
    socket.on('disconnect', () => {
        /*
            用户退出聊天室：
                从用户列表中删除
                更新聊天室人数
                更新用户列表
                提示用户退出聊天室
        */
        //查找是否有相同名字的socket,如果存在,则不删除用户列表
        var i = 0;
        for (const key in io.sockets.sockets) {
            if (io.sockets.sockets[key].userName == socket.userName) {
                i++;
            }
        }
        if (i >= 1) {
        } else {
            //找到当前用户的下标，并删除
            var index = userList.findIndex((item) => {
                return item.userName === socket.userName;
            });
            if (index !== -1) {
                userList.splice(index, 1);
                console.log(`客户端${socket.userName}已断开`);
                var data = {
                    userName: socket.userName,
                    userList: userList
                }
                io.emit('removeUser', data);
            }
        }
    })
})