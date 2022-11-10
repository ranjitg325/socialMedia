const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer')

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

require('dotenv').config();
// //const multer = require("multer")

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer().any())


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


app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});
