/**
 * Created by huangmiao on 16-7-14.
 */
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);//会被客户端引用

app.get('/',function(req,res){
    res.send('<h1>Welcome Realtime Server</h1>');
});

var onlineUsers = {}

var onlineCount = 0;

io.on('connection',function(socket){
    console.log('a user connected');

    socket.on('server-login',function(obj){//监听客户端事件
        socket.name = obj.userid;

        if(!onlineUsers.hasOwnProperty(obj.userid)) {
            onlineUsers[obj.userid] = obj.username;

            onlineCount++;
        }

        io.emit('client-login',{onlineUsers:onlineUsers,onlineCount:onlineCount,user:obj});//触发客户端监听事件
        console.log(obj.username+'加入聊天室');
    });

    socket.on('disconnect',function(){
        if(onlineUsers.hasOwnProperty(socket.name)){
            var obj = {userid:socket.name,username:onlineUsers[socket.name]};

            delete onlineUsers[socket.name];
            onlineCount--;

            io.emit('client-logout',{onlineUsers:onlineUsers,onlineCount:onlineCount,user:obj});//触发客户端监听事件

            console.log(obj.username+'退出聊天室');
        }
    });

    socket.on('server-message',function(obj){
        io.emit('client-message',obj);//触发客户端监听事件

        console.log(obj.username+'说：'+obj.content);
    });

});

http.listen(3000,function(){
    console.log('listening on *:3000');
});
