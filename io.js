const jwt = require('jsonwebtoken');
const DOCUMENT = require('./models/document');
let data_storage="";
const doc_map = new Map();
let doc_storage=[];
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
                            {shared_users:{$in:["hell"]}},
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
              const a = Document[0];
              a['online_users']=[];
              a.online_users.push(email);
              a.online_users.push("hello@gmail.com");
              console.log(a);
              console.log(Document[0]);
              doc_map.set(docId,Document[0]);
              doc_storage.push(Document[0]);
            }
            console.log(`clients connected: ${connected_clients}`); 
            console.log("data:",doc_map.get(docId).data);
            socket.emit("room-server","loaded the document",doc_map.get(docId).data);
            io.to(docId).emit("room-server",`socket_id:${socket.id} joined the room:${docId}`,doc_map.get(docId).data);
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
      // const docIndex = doc_storage.findIndex( doc => doc._id == socket.data.room );
      // doc_storage[docIndex].data=data;
      doc_map.get(docId).data=data;
      data_storage=data;
      if(socket.rooms.has(docId)){
        console.log(`message received from socket_id:${socket.id} to the room: ${docId}`);
        io.to(docId).emit("room-server",`socket_id:${socket.id} sent some message`,data);
      }else{
        socket.emit("connect_error",new Error("unauthorised access!"));
      } 
    }) 

    socket.on("share_doc",async(user,docId)=>{
      if(socket.rooms.has(docId)){
        await DOCUMENT.find({_id:docId},{$push:{shared_users:[user]}});
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
                    const removeIndex = doc_storage.findIndex( doc => doc._id == socket.data.room );
                    doc_storage.splice( removeIndex, 1 );
                    const updatedoc = await DOCUMENT.findOneAndUpdate({_id:socket.data.room},doc_map.get(socket.data.room));
                    doc_map.delete(socket.data.room);
                    console.log(doc_map);
                    console.log("deleted doc storage");
                    //console.log(doc_storage);
                    return console.log({room:socket.data.room,clients_connected:0});
                   }
                   const size = io.sockets.adapter.rooms.get(socket.data.room).size;
                   
      console.log(`clients connected after disconnection: ${size}`); 
    }); 
    console.log(`clients connected to the server: ${Object.keys(io.eio.clients)}`);
    console.log("--------------------------------------------------");
   

}); 




//module.exports = io_server; 