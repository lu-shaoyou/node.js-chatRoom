var socket = io();
let toName = "群聊";//私聊时接收信息的人
window.onload = () => {
    //获取浏览器中的cookie
    var userName = unescape(getCookie('userName'));
    var headSrc = getCookie('headSrc');
    //设置socket的名字
    socket.userName = userName;
    function getCookie(name) {
        var strcookie = document.cookie;//获取cookie字符串
        var arrcookie = strcookie.split("; ");//分割
        //遍历匹配
        for (var i = 0; i < arrcookie.length; i++) {
            var arr = arrcookie[i].split("=");
            if (arr[0] == name) {
                return arr[1];
            }
        }
        return "";
    }
    //将用户名和头像传给服务器
    socket.emit('compare', {
        userName: userName,
        headSrc: headSrc
    })
    //把用户进入聊天室的信息打印到聊天界面
    socket.on('addUser', (data) => {
        document.querySelector('.joinName').innerHTML = `欢迎${data.userName}进入聊天室`;
    })
    //加载用户列表
    socket.on('userList', (data) => {
        var len = data.length;
        //清空列表
        var userUl = document.querySelector('.userUl');
        //从后往前删除，索引就不会移动
        var userUlchlid = userUl.childNodes;
        for (i = userUlchlid.length - 1; i >= 0; i--) {
            userUl.removeChild(userUlchlid[i]);
        }
        //添加群聊选项
        document.querySelector('.userUl').innerHTML += `<li class="userli">
            <img class="userli_img" height="30px" width="30px" src="imgs/morechat.jpg">
            <span class="userli_span">群聊</span>
            </li>`;
        //把用户添加到用户列表
        for (var i = 0; i < len; i++) {
            document.querySelector('.userUl').innerHTML += `<li class="userli">
                <img height="30px" width="30px" src="${data[i].headSrc}">
                <span >${data[i].userName}</span>
                </li>`;
        }
        //显示在线人数
        document.querySelector('.onlineNums').innerText = len;
    })

    //获取选中的人的名字,通过事件委托机制获取到ul下的任意li
    var ul = document.querySelector('.userUl');
    ul.addEventListener('click', function (e) {
        var ele = e.target;
        while (ele.nodeName !== 'LI') {
            if (ele === ul) {
                ele = null;
                break;
            }
            ele = ele.parentNode;
        }
        if (ele) {
            var children = ele.parentNode.childNodes;
            children.forEach((item) => {
                item.setAttribute('class', 'userli');
            })
            ele.setAttribute('class', 'userli2');
            //选中某个人，将他的名字赋给toName
            toName = ele.childNodes[3].innerText;
        }
    })
    //向服务器发送消息
    var btn = document.getElementsByTagName('button')[0];
    btn.addEventListener('click', () => {
        //获取输入框的内容
        var message = document.querySelector('#content').innerHTML;
        if (message === "") {
            alert("发送的消息不能为空");
        } else {
            var data = {
                message: message,
                toName: toName
            }
            socket.emit('sendMessage', data);
            //清空输入框
            document.querySelector('#content').innerHTML = "";
            toName = "群聊";
            var userlis = document.querySelectorAll('li');
            userlis.forEach((item) => {
                item.setAttribute('class', 'userli');
            })
        }
    })
    //发送表情
    let i = 0;
    document.querySelector('.face').addEventListener('click', () => {
        $('#content').emoji({
            button: '.face',
            showTab: false,
            animation: 'slide',
            position: 'topRight',
            icons: [{
                name: "QQ表情",
                path: "lib/jquery-emoji/img/qq/",
                maxNum: 91,
                excludeNums: [41, 45, 54],
                file: ".gif"
            }]
        })
        if (i === 0) {
            document.querySelector('.face').setAttribute('src', '../imgs/face.png');
            i++;
        } else {
            document.querySelector('.face').setAttribute('src', '../imgs/表情.png');
            i--;
        }
    })

    //获取当前时间
    let date = new Date();
    let hour = date.getHours();
    let minute = date.getMinutes();
    if (hour > 12) {
        hour = '下午' + (hour - 12);
    } else {
        hour = '上午' + hour;
    }
    date = hour + ':' + minute;
    //接收从服务器发送回来的数据
    socket.on('sendBack', (obj) => {
        if (obj.type === '私聊') {
            //判断如果是发送信息的用户则显示在左边，其他用户在右边
            if (obj.userName === socket.userName) {
                //自己的消息，在只在当前页显示
                document.querySelector('.chat').innerHTML += `<div class="me_msg">
                    <div><img class="headImg" src="${obj.headSrc}"><span>${date}</span></div>
                    <span></span>
                    <div class="me_main">
                        <div class="meBubble"></div>
                        <div class="mesay_flex">
                            <div class="myMessage"><span>${obj.message}</span></div>
                            <div class="say_other"></div>
                        </div>
                    </div>
                </div>
                <div class="time_msg"></div>`;
                //让一直刷在底部
                scrollBottom();
            } else {
                document.querySelector('.chat').innerHTML += `<div class="other_msg">
                    <div class="other_style">
                        <span>${obj.userName}</span>
                        <div><img class="otherHeadImg" src="${obj.headSrc}"><span>${date}</span></div>
                    </div>
                    <div>
                        <div class="otherBubble"></div>
                        <div class="say_otherflex">
                            <div class="otherMessage"><span>${obj.message}</span></div>
                            <div class="siliao">私聊</div>
                            <div class="say_other"></div>
                        </div>
                    </div>
                </div>
                <div class="time_msg"></div>`;
                //让一直刷在底部
                scrollBottom();
            }
        } else {
            //判断如果是发送信息的用户则显示在右边，其他用户在左边
            if (obj.userName === socket.userName) {
                //自己的消息，在只在当前页显示
                document.querySelector('.chat').innerHTML += `<div class="me_msg">
                    <div><img class="headImg" src="${obj.headSrc}"><span>${date}</span></div>
                    <span></span>
                    <div class="me_main">
                        <div class="meBubble"></div>
                        <div class="mesay_flex">
                            <div class="myMessage"><span>${obj.message}</span></div>
                            <div class="say_other"></div>
                        </div>
                    </div>
                </div>
                <div class="time_msg"></div>`
                //让一直刷在底部
                scrollBottom();
            } else {
                document.querySelector('.chat').innerHTML += `<div class="other_msg">
                    <div class="other_style">
                        <span>${obj.userName}</span>
                        <div><img class="otherHeadImg" src="${obj.headSrc}"><span>${date}</span></div>
                    </div>
                    <div>
                        <div class="otherBubble"></div>
                        <div class="say_otherflex">
                            <div class="otherMessage"><span>${obj.message}</span></div>
                            <div class="say_other"></div>
                        </div>
                    </div>
                </div>
                <div class="time_msg"></div>`;
                //让一直刷在底部
                scrollBottom();
            }
        }
    })

    //接收图片信息
    socket.on('sendImgBack', (obj) => {
        if (obj.type === '私聊') {
            //判断如果是发送信息的用户则显示在左边，其他用户在右边
            if (obj.userName === socket.userName) {
                //自己的消息，在只在当前页显示
                document.querySelector('.chat').innerHTML += `<div class="me_msg">
                    <div><img class="headImg" src="${obj.headSrc}"><span>${date}</span></div>
                    <span></span>
                    <div class="me_main">
                        <div class="meBubble"></div>
                        <div class="mesay_flex">
                            <div class="myMessage"><img class="gifImg" src="${obj.message}"></div>
                            <div class="say_other"></div>
                        </div>
                    </div>
                </div>
                <div class="time_msg"></div>`;
                //让一直刷在底部
                scrollBottom();
            } else {
                document.querySelector('.chat').innerHTML += `<div class="other_msg">
                    <div class="other_style">
                        <span >${obj.userName}</span>
                        <div><img class="otherHeadImg" src="${obj.headSrc}"><span>${date}</span></div>
                    </div>
                    <div>
                        <div class="otherBubble"></div>
                        <div class="say_otherflex">
                            <div class="otherMessage"><img class="gifImg" src="${obj.message}"></div>
                            <div class="siliao">私聊</div>
                            <div class="say_other"></div>
                        </div>
                    </div>
                </div>
                <div class="time_msg"></div>`;
                //让一直刷在底部
                scrollBottom();
            }
        } else {
            //判断如果是发送信息的用户则显示在右边，其他用户在左边
            if (obj.userName === socket.userName) {
                //自己的消息，在只在当前页显示
                document.querySelector('.chat').innerHTML += `<div class="me_msg">
                    <div><img class="headImg" src="${obj.headSrc}"><span>${date}</span></div>
                    <span></span>
                    <div class="me_main">
                        <div class="meBubble"></div>
                        <div class="mesay_flex">
                            <div class="myMessage"><img class="gifImg" src="${obj.message}"></div>
                            <div class="say_other"></div>
                        </div>
                    </div>
                </div>
                <div class="time_msg"></div>`
                //让一直刷在底部
                scrollBottom();
            } else {
                document.querySelector('.chat').innerHTML += `<div class="other_msg">
                    <div class="other_style">
                        <span>${obj.userName}</span>
                        <div><img class="otherHeadImg" src="${obj.headSrc}"><span>${date}</span></div>
                    </div>
                    <div>
                        <div class="otherBubble"></div>
                        <div class="say_otherflex">
                            <div class="otherMessage"><img src="${obj.message}"></div>
                            <div class="say_other"></div>
                        </div>
                    </div>
                </div>
                <div class="time_msg"></div>`;
                //让一直刷在底部
                scrollBottom();
            }
        }
    })

    //用户断开连接
    socket.on('removeUser', (data) => {
        //把用户离开聊天室的信息打印到聊天界面
        document.querySelector('.joinName').innerHTML = `恭送${data.userName}离开聊天室`;
        //更新用户列表
        var len = data.userList.length;
        //清空列表
        var userUl = document.querySelector('.userUl');
        //从后往前删除，索引就不会移动
        var userUlchlid = userUl.childNodes;
        for (i = userUlchlid.length - 1; i >= 0; i--) {
            userUl.removeChild(userUlchlid[i]);
        }
        //添加群聊选项
        document.querySelector('.userUl').innerHTML += `<li class="userli">
            <img class="userli_img" height="30px" width="30px" src="imgs/morechat.jpg">
            <span class="userli_span">群聊</span>
            </li>`;
        //把用户添加到用户列表
        for (var i = 0; i < len; i++) {
            document.querySelector('.userUl').innerHTML += `<li class="userli">
                <img class="userli_img" height="30px" width="30px" src="${data.userList[i].headSrc}">
                <span class="userli_span">${data.userList[i].userName}</span>
                </li>`;
        }
        //显示在线人数
        document.querySelector('.onlineNums').innerText = len;
    })

    //滚动在底部的方法
    function scrollBottom() {
        var chat = document.querySelector('.chat');
        // chat.lastElementChild.scrollIntoView(false);
        chat.scrollTop = chat.scrollHeight;
        
    }

    //鼠标移动到指定img触发事件
    document.querySelector('.face').addEventListener('mouseover', () => {
        document.querySelector('.face').setAttribute('src', '../imgs/face.png');
    })
    document.querySelector('.openDiv').addEventListener('mouseover', () => {
        document.querySelector('.openDiv').setAttribute('src', '../imgs/gif.png');
    })
}

//点击GIF图片按钮显示或隐藏发送图片的div
let j = 0;
function sendImgs(obj) {
    if (j == 0) {
        var parent = obj.parentNode;
        parent.lastChild.remove();
        parent.innerHTML += `<div class="gifDiv">
                <img class="gif" src="imgs/bq01.jpg">
                <img class="gif" src="imgs/bq02.jpg">
                <img class="gif" src="imgs/bq03.jpg">
                <img class="gif" src="imgs/bq04.jpg">
                <img class="gif" src="imgs/bq05.gif">
                <img class="gif" src="imgs/bq06.jpg">
                <img class="gif" src="imgs/bq07.gif">
                <img class="gif" src="imgs/bq08.gif">
                <img class="gif" src="imgs/bq09.gif">
                <img class="gif" src="imgs/bq10.gif">
                <img class="gif" src="imgs/bq11.gif">
                <img class="gif" src="imgs/bq12.gif">
                <img class="gif" src="imgs/bq13.gif">
                <img class="gif" src="imgs/bq14.gif">
                <img class="gif" src="imgs/bq15.gif">
                <img class="gif" src="imgs/bq16.gif">
                <img class="gif" src="imgs/bq17.gif">
                <img class="gif" src="imgs/bq18.gif">
            <div>` ;
        j++;
        //获取发送的图片地址
        var gif = document.querySelectorAll('.gif');
        gif.forEach((item) => {
            item.addEventListener('click', () => {
                //获取图片的地址
                var imgsrc = item.getAttribute('src');
                var data = {
                    toName: toName,//获取接收者的用户名
                    imgMessage: imgsrc
                }
                socket.emit('sendImg', data);
                toName = "群聊";
                document.querySelector('.gifDiv').style.display = 'none';
                j--;
            })
        })
    } else {
        document.querySelector('.gifDiv').style.display = 'none';
        j--;
    }
}
