/*
    用来判断刷新页面重新提交表单的时候，
    如果用户列表中已存在该用户则不添加到用户列表中
*/
function checkCookieRepeat(userList, userData) {
    //遍历用户列表
    for (var i = 0; i < userList.length; i++) {
        if (userList[i].userName === userData.userName) {
        } else {
            userList.push(userData);
            break;
        }
    }
}

exports.checkCookieRepeat = checkCookieRepeat;