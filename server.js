// dependencies 
const express = require('express');
const routes = require('./controllers');
const sequelize = require('./config/connection.js');
const path = require('path');
const exphbs = require('express-handlebars');
const helpers = require('./utils/helpers');
const hbs = exphbs.create({ helpers });
const session = require('express-session');
require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

const app = express(); // creates express application
const PORT = process.env.PORT || 3001; // selects port 3001 for production environment Heroku

// middleware
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.get('/', routes.index);
//app.set('public', path.join(__dirname, 'public' )); //troubleshooting mysql error

// connects session to Sequelize database (reference module 14.2.5)
const SequelizeStore = require('connect-session-sequelize')(session.Store);

const sess = {
    secret: 'Super secret secret',
    cookie: {expires: 30 * 60 * 1000}, //expires after 30 minutes
    resave: false,
    saveUnitialized: true,
    store: new SequelizeStore({
        db: sequelize
    })
};

app.use(session(sess)); // connects session to Sequelize database (reference module 14.2.5)

//app.use(session(sess));
// if there is inactivity for 30 minutes, the session expires
app.get('/session', function(req, res, next) {
  if(req.session.views){
    req.session.views++
    res.end();
  }
  else{
    req.session.views = 1
    res.end();
  }
});

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

if (typeof (process.env.CLOUDINARY_URL) === 'undefined') {
  console.warn('!! cloudinary config is undefined !!');
  console.warn('export CLOUDINARY_URL or set dotenv file');
} else {
}

const storage = multer.diskStorage({
  destination: function(req,file, cb) {
    cb(null, file.originalname)
  }
});

const upload = multer({ storage });

//app.use(routes); //turn on routes
app.post('/upload', upload.fields([{ name: 'file' }]), routes.upload);


sequelize.sync({ force: false }).then(() => { // turn on connection to database and server (reference module 13.1.6)
    app.listen(PORT, () => console.log('Now Listening'));
});