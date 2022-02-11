const express= require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');

const app= express();
const server = http.createServer(app);
const io = socketio(server);
const formatMessage = require('./utils/message');
const {userJoin, getCurrentUser,userLeave,
    getRoomUsers} = require('./utils/user');
const botname = 'admin';

app.use(express.static(path.join(__dirname,'public')));

//run when client connects
io.on('connection',socket =>{
    socket.on('joinroom',({username,room})=>{
        const user = userJoin(socket.id, username,room);

        socket.join(user.room);

     //welcome new user
    socket.emit('message',formatMessage(botname,'welcome to ChatApp!'));

    //broadcast when a user connect
    socket.broadcast
    .to(user.room)
    .emit('message',formatMessage(botname,`${user.username} has joined the chat`));

    io.to(user.room).emit('roomUsers',{
        room: user.room,
        users: getRoomUsers(user.room)
    });

    });

    

    //runs when user disconnect
    socket.on('disconnect',()=>{
        const user = userLeave(socket.id);
        if (user) {
            io.to(user.room).emit(
              'message',
              formatMessage(botname, `${user.username} has left the chat`)
            );
            io.to(user.room).emit('roomUsers',{
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
        
    });
    socket.on('chatMessage',(msg)=>{
        const user= getCurrentUser(socket.id);
        io.to(user.room).emit('message',formatMessage(user.username,msg));
    });

});

const PORT= 5000|| process.env.PORT;
server.listen(PORT,()=>
  console.log(`Server running on port ${PORT}`)  
);