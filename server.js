const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const connectDB = require('./db/connect');
const mongoose = require('mongoose');
require('dotenv').config();
const USER = require('./models/user');
const app = express();
const server = http.createServer(app);
const io = socketIO(server,{cors:{
  origin:'*',
  extended:true
}});
// app.use(cors({
//   origin:'*',
//   extended:true
// }));

// Event handler for new client connections
io.on('connection', async(socket) => {
  try{
    console.log(`A client connected with socket id:${socket.id}`);
    await USER.create({socket_id:socket.id});
  }catch(error){
    console.log(error.message);
  }
  // Event handler for message events from the client
  socket.on('message', async(_data,_socket_id) => {
    try{
      console.log(_socket_id);
      const updated= await USER.findOneAndUpdate({socket_id:_socket_id},{data:_data},{new:true})
      console.log(updated);
      console.log(_data);
    }catch(error){
      console.log(error.message);
    }
  });

  // Emit a message event to the client
  socket.emit('message', 'Hello, client!');
});

// Start the server
const port = 3000||process.env.PORT;
const start_server = async()=>{
  try{
      await connectDB(process.env.MONGO_URI);
      server.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
      });
  }catch(error){
    console.log(error.message);
  }
}
start_server();






// const { Server } = require('socket.io');

// const io = new Server(3000)
 
// io.on("connection", (socket) => {
//   // send a message to the client
//   socket.emit("hello from server", 1, "2", { 3: Buffer.from([4]) });

//   // receive a message from the client
//   socket.on("hello from client", (message) => {
//     // ...
//     console.log(message);
//   });
// });