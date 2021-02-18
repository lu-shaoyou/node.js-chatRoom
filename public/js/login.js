window.onload = function () {
    //连接服务器，拿到用户列表
    var userList = [];
    var socket = io();
    socket.on('login', (data) => {
        for (var i = 0; i < data.length; i++) {
            userList.push(data[i]);
        }
    })
    //给选中的头像设置样式
    var img = document.querySelectorAll('.swiper-wrapper img');
    var num = 0;
    img.forEach((item, index) => {
        item.onclick = () => {
            img[num].setAttribute('class', '');
            num = index;
            item.setAttribute('class', 'imgstyle');
            //拿到被选中图片地址
            document.getElementsByClassName('hidden')[0].value = '';
            //把它赋给input标签
            document.getElementsByClassName('hidden')[0].value = item.getAttribute('src');
        }
    })
    //设置用户名的正则表达式
    function isName(str) {
        reg = /^[\u0391-\uFFE5\w]{4,8}$/;
        if (reg.test(str)) {
            return true;
        } else {
            return false;
        }
    }
    //匹配正则表达式
    document.querySelector('.input').onchange = () => {
        var value = document.getElementsByClassName('input')[0].value;
        if (!isName(value)) {
            // document.getElementsByClassName('input')[0].getAttributeNode("style").value = "Color:red";
            // document.getElementsByClassName('input')[0].value = '用户名格式是4-8个中英数';
            alert('用户名格式是4-8个中英数');
        }
    }
    //提交表单事件
    document.getElementsByTagName('button')[0].onclick = () => {
        //拿到用户名
        var userName = document.getElementsByClassName('input')[0].value;
        //拿到头像路径
        var headSrc = document.getElementsByClassName('hidden')[0].value;
        if (userName.length > 8 || userName.length < 4) {
            alert('用户名格式是4-8个中英数');
            return false;
        } else {
            var user = userList.find((item) => {
                return item.userName === userName;
            })
            if (user) {
                alert('用户已存在');
                document.getElementsByClassName('input')[0].value = "";
                document.getElementsByClassName('hidden')[0].value = "";
                return false;
            } else {
                return true;
            }
        }
    }
}