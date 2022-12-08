const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer')
const cors = require("cors");
const cookieParser = require("cookie-parser");
const SocketServer = require("./socketServer");
const { ExpressPeerServer } = require("peer");
const path = require("path");

const { default: mongoose } = require('mongoose');
const app = express();

const user = require('./routes/user.js');
const admin = require('./routes/admin.js');
const post = require('./routes/post.js');
const comment = require('./routes/comment.js');
const message = require('./routes/message.js');
const notification = require('./routes/notification.js');
const reels = require('./routes/reels.js');
const commentReel = require('./routes/commentReel.js');
const shareReel = require('./routes/shareReel.js');
const reelsStory = require('./routes/reelsStory.js');
const news = require('./routes/news.js');
const page = require('./routes/page.js');
const sharePage = require('./routes/sharePage.js');
const organiseEvent = require('./routes/organiseEvent.js');
const question = require('./routes/question.js');

require('dotenv').config();
// //const multer = require("multer")

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer().any())
app.use(express.json());
app.use(cors());
app.use(cookieParser());


// Socket
const http = require("http").createServer(app);
const io = require("socket.io")(http);

io.on("connection", (socket) => {
  SocketServer(socket);
});

// Create peer server
ExpressPeerServer(http, { path: "/" });


mongoose.connect("mongodb+srv://sapna20:Sapnadha20@cluster0.crepr.mongodb.net/Project-socialMedia-db?retryWrites=true&w=majority", {
   useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )

////app.use('/', route);

app.use('/user', user);
app.use('/admin', admin);
app.use('/post', post);
app.use('/comment', comment);
app.use('/message', message);
app.use('/notification', notification);
app.use('/reels', reels);
app.use('/commentReel', commentReel);
app.use('/shareReel', shareReel);
app.use('/reelsStory', reelsStory);
app.use('/news', news);
app.use('/page', page);
app.use('/sharePage', sharePage);
app.use('/organiseEvent', organiseEvent);
app.use('/question', question);


app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});
