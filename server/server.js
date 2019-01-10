//****************REQUIRES**********************
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const network = require('network')
const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const _ = require('lodash');
const {ObjectID} = require('mongodb')
const path = require('path');
const {PythonShell} = require('python-shell');




//Vars
const {Users} = require('./utils/users')
const {generateMessage, generateLocationMessage} = require('./utils/message');
const {isRealString} = require('./utils/validation')
const {Rooms} = require('./utils/chatNodes.js')
const port = process.env.PORT || 3000
const publicPath = path.join(__dirname, '../public');
//------------------------------------------------

//*************Init*****************************
var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();
var rooms = new Rooms

app.use(express.static(publicPath));
//-----------------------------------------------
// // sending to individual socketid (private message)
//  io.to(`${socketId}`).emit('hey', 'I just met you');
// // sending to all clients on this node (when using multiple nodes)
//  io.local.emit('hi', 'my lovely babies');
//*************Body*****************************

//CONNECTION
io.on('connection', (socket) => {
  console.log('New user connected');


// JOIN Function
  socket.on('join', (params, location, callback) =>{
    if(!isRealString(params.uname)){
      return callback('Name is required');
    }

    //Use Location to determine "room", should give an array of all eligible rooms
    var radius = 5000;
    var localRoomList = rooms.getLocalRooms(location, radius)
    var selectedRoom;
    var index = 0;
    //chooses room
    if (localRoomList > 1) {
      for (var i = 0; i < localRoomList.length; i++) {
        if (i === 0) {
          continue;
        }

        if(getUserList(localRoomList[index].id).length < getUserList(localRoomList[i].id).length){
          index = i;
        }
      }
      selectedRoom = localRoomList[index].id;
    }
    else{
      selectedRoom = localRoomList[0].id;
    }
    console.log(selectedRoom);
    console.log(rooms);
    //Gets all users in room
    //var userlist = users.getUserList(params.room)

    // //Checks for unique name
    // if(users.filter((user) => user.name === params.uname).length > 0){
    //   return callback('Name is currently taken')
    // }

    //Makes room uppercase
    selectedRoom = selectedRoom.toUpperCase();

    socket.join(selectedRoom);

    //Updates user list
    users.removeUser(socket.id);
    users.addUser(socket.id, params.uname, selectedRoom);

    io.to(selectedRoom).emit('updateUserList', users.getUserList(selectedRoom));
    //Update users chat to reflect the previous messages


    socket.emit('newMessage', generateMessage('Admin', 'Welcome'));
    var adminMessage = generateMessage('Admin', `${params.uname} has joined`)
    socket.broadcast.to(selectedRoom).emit('newMessage', adminMessage);
    rooms.updateChatLog(selectedRoom, adminMessage);
    callback();
  });


// Chat Message Func
  socket.on('createMessage', (message, callback) =>{
    var user = users.getUser(socket.id);

    if(user && isRealString(message.text)){
      var userMessage = generateMessage(user.name, message.text);
      io.to(user.room).emit('newMessage', userMessage);
      rooms.updateChatLog(user.room, userMessage);
    }
    callback('This is from the server');
  });


    // io.emit('newMessage', {
    //   from: message.from,
    //   text: message.text,
    //   createdAt: new Date().getTime()
    // })

    //sends to everyone except the person sending it
    // socket.broadcast.emit('newMessage', {
    //   from: message.from,
    //   text: message.text,
    //   createdAt: new Date().getTime()
    // });


//Disconnect Func
  socket.on('disconnect', () =>{
    console.log('User has disconnected');
    var user = users.removeUser(socket.id);

    if(user){
      io.to(user.room).emit('updateUserList', users.getUserList(user.room));
      io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left the room`))
    }
  });
});
//


//-----------------------------------------------

//************Server Boot***********************
server.listen(port, () =>{
  console.log("Server is up on Port " + port);
});
//-----------------------------------------------
