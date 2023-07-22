const jwt = require('jsonwebtoken');
const DOCUMENT = require('./models/document');
// const { io } = require('socket.io-client');
const doc_map = new Map();

io.use(async(socket,next) => {
    const access_token=socket.request._query['token'];
    const docId=socket.request._query['docId'];
    try{
        const {email} = jwt.verify(access_token,process.env.JWT_SECRET);
        if(email){
          const Document = await DOCUMENT.find(
            {
                $and:[
                    {  _id : docId},
                    {   $or:[
                            {shared_users:{$in:[email]}},
                            {owner:email},
                        ]
                    },
                ] 
            }).lean();
          if(!Document[0]){
            const err = new Error("authorisation denied!!")
            next(err);
          }else{ 
            
            socket.join(docId);
            socket.data.room=docId;
            socket.data.email=email;
            const connected_clients = io.sockets.adapter.rooms.get(docId).size;
            if(connected_clients==1){
              console.log("created doc storage")
              // const a = Document[0];
              // a.online_users.push("hello@gmail.com");
              doc_map.set(docId,Document[0]);
              doc_map.get(docId).online_users=[];
              console.log(doc_map.get(docId));
              
              // doc_storage.push(Document[0]);
            }
            const DOC = doc_map.get(docId);
            if(!DOC.online_users.includes(email)){
              DOC.online_users.push(email);
            }
            console.log(`clients connected: ${connected_clients}`); 
      
            console.log("data:",DOC.data);
            const metaDataDoc={
              online_users:DOC.online_users
            }
            socket.emit("room-server","loaded the document",DOC.data,metaDataDoc);
            io.to(docId).emit("room-server",`socket_id:${socket.id} joined the room:${docId}`,DOC.data,metaDataDoc);
           // console.log(`email: ${email} joined the room :${docId}`); 
            console.log({socketID:socket.id,email:email,rooms:socket.rooms}); 
            next();
          } 
        }else{ 
          const err = new Error("sign in!!");
          next(err);
        } 

    }catch(err){
        next(err)
    }
}); 
    




io.on('connection',(socket) => {
    
    //console.log(doc_storage);
    console.log(doc_map);
    console.log(`A new client connected with socket id: ${socket.id}`)
    socket.on("message_sent",(data,docId)=>{
      const DOC = doc_map.get(docId)
      DOC.data=data;
      DOC.updated_at.push({Date:Date.now(),user:socket.data.email,lines:[]});
      if(socket.rooms.has(docId)){
        console.log(`message received from socket_id:${socket.id} to the room: ${docId}`);
        io.to(docId).emit("room-server",`socket_id:${socket.id} sent some message`,data);
      }else{
        socket.emit("connect_error",new Error("unauthorised access!"));
      } 
    }) 

    socket.on("share_doc",async(user,docId)=>{
      if(socket.rooms.has(docId)){
        //await DOCUMENT.find({_id:docId},{$push:{shared_users:[user]}});
        doc_map.get(docId).shared_users.push(user);
        const updatedoc = await DOCUMENT.findOneAndUpdate({_id:docId},doc_map.get(docId));
        console.log(updatedoc);
        console.log(`new user:${user} added to doc:${docId}`);
      }
    })

    socket.on("disconnect", async(reason) => {
      console.log({socket_id:socket.id,
                   room:socket.data.room,
                   reason:reason});
                   console.log(io.sockets.adapter.rooms)

                   if(!io.sockets.adapter.rooms.has(socket.data.room)){
                    //sendData to the server
                    // const removeIndex = doc_storage.findIndex( doc => doc._id == socket.data.room );
                    // doc_storage.splice( removeIndex, 1 );
                    
                    const updatedoc = await DOCUMENT.findOneAndUpdate({_id:socket.data.room},doc_map.get(socket.data.room));
                    doc_map.delete(socket.data.room);
                    console.log(doc_map);
                    console.log("deleted doc storage");
                    //console.log(doc_storage);
                    return console.log({room:socket.data.room,clients_connected:0});
                   }
                   const size = io.sockets.adapter.rooms.get(socket.data.room).size;
                   const DOC = doc_map.get(socket.data.room);
                   const index = DOC.online_users.indexOf(socket.data.email);
                   if (index > -1) { // only splice array when item is found
                     DOC.online_users.splice(index, 1); // 2nd parameter means remove one item only
                   }
                   
                   const metaDataDoc={ 
                     online_users:DOC.online_users
                   }
                   io.to(socket.data.room).emit("room-server",`socket_id:${socket.id} left the room:${socket.data.room}`,DOC.data,metaDataDoc);            
      console.log(`clients connected after disconnection: ${size}`); 
    }); 
    console.log(`clients connected to the server: ${Object.keys(io.eio.clients)}`);
    console.log("--------------------------------------------------");
   

}); 




//module.exports = io_server; 