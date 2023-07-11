// const { io } = require('socket.io-client');
//const socket = io("https://socket-implementation.onrender.com");

//some local variables;
let flag=0;
let timeout=[];
let i=0;
const DBSaveInterval=200;
let client_data=null;

//url path query parameters
const urlParams = new URLSearchParams(window.location.search);
const docId = urlParams.get('docId');
console.log({docId:docId});
console.log({cookie:document.cookie});

//socket connection to server
const socket = io("http://localhost:3000",{query:`${document.cookie}&docId=${docId}`}); 


//data to the server
const sendData =()=>{
  // const input = document.getElementById('w3review');
  // const position = input.selectionStart;
  // document.getElementById("position").innerText = position;
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  console.log(rect);
  client_data=document.getElementById("w3review").value;
  console.log("message sent to the room");
  socket.emit("message_sent",client_data,docId);
  i=0;
}

//data from the server 
socket.on("room-server",(message,data)=>{
  console.log(message); 
  document.getElementById("w3review").value = data;
});

//erro handling 
socket.on("connect_error",(error)=>{
  console.log(error.message);
});

// send a message to the server on input activity delay of 300ms 
document.getElementById("w3review").oninput = function() {
  if(flag==0){
    flag=1;
  }
  else{
    clearTimeout(timeout[i-1])
  }
  timeout[i] = setTimeout(sendData,DBSaveInterval);
  i++;
};




// If the position of the cursor is at the very last character inside the input,
// this will result in 3
alert(position);
  

