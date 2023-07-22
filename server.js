//npm dependencies
const express = require('express');
const http = require('http');
const cookieParser = require('cookie-parser');
const socketIO = require('socket.io');
const cors = require('cors');
require('dotenv').config();

//functions
const connectDB = require('./db/connect');
const router = require('./routes/routes');
const notFound = require('./middleware/notfound');
const errorHandler = require('./middleware/errorhandler');

//server initialization
const app = express();
const server = http.createServer(app);
module.exports= io = socketIO(server,{cors:{
  origin:'*',
  extended:true
}});
require('./io');
const corsConfig = {
  origin: true,
  credentials: true,
};


//global middlewares
app.use(cors(corsConfig));
app.options('*', cors(corsConfig))
app.use(express.json());
app.use(cookieParser());

//template engine assets
app.set("view engine","ejs"); 
app.use(express.static('public')); 

// route specific middlewares
app.use('/api/v1',express.static('public'));
app.use('/loginPage',express.static('public'))
app.get('/',(req,res)=>{console.log("inside /");res.render("index.ejs");});
app.get('/loginPage',(req,res)=>{res.render("login.ejs")});
app.use('/api/v1',router);
app.use(notFound);
app.use(errorHandler);      





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

 