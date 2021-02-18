//替换用户列表与当前socket相同的用户名和头像
function checkEqual(userList, data) {
    var index = userList.findIndex((item) => {
        return item.userName === data.userName;
    });
    if (index !== -1) {
        userList.splice(index, 1);
    }
}

exports.checkEqual = checkEqual;