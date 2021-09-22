const express = require("express");
const passport = require('passport');
const mongoose = require("mongoose");
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const cors = require("cors");
const keys = require("./config/keys");
const fileUpload = require("express-fileupload")
const PUBLIC_DIR = "public";
const STATIC_DIR = "static";
const timeout = require('connect-timeout')

mongoose.Promise = global.Promise;
const options = {
	 useNewUrlParser: true
 }
mongoose.connect(keys.mongoURI, options,
    function(err){
        if(err){
            throw err
        }
});

const app = express();
app.use(timeout('15s'))
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(cors());
app.use(
	cookieSession({
		maxAge: 30 * 24 * 60 * 60 * 1000,
		keys: [keys.cookieKey]
	})
);

app.use(fileUpload());
app.use(express.static(STATIC_DIR));
app.use(express.static(PUBLIC_DIR));

const Authentication = require('./controllers/authentication');
const passportService = require('./services/passport');

const requireAuth = passport.authenticate('jwt', { session: false });
const requireSignin = passport.authenticate('local', { session: false });

app.use(passport.initialize());
app.use(passport.session());

app.get('/', function(req, res) {
  res.send({ message: 'Super secret code is Leyla' });
});
app.post('/signin', requireSignin, Authentication.signin);
app.post('/signup', Authentication.signup);

require("./models/Site");
require("./models/Theme");
require("./models/Font");
require("./models/Product");
require("./models/Section");
require("./routes/main")(app);
require("./routes/SiteRoutes")(app);
require("./routes/ThemeRoutes")(app);
require("./routes/FontRoutes")(app);
require("./routes/ProductRoutes")(app);
require("./routes/SectionRoutes")(app);

const PORT = process.env.PORT || 5001;
const server = app.listen(PORT);

const io = require('socket.io')(server, {
	cors: {
	  origin: '*',
    },
    pingTimeout: 25000
})

io.on('connection',(socket)=>{
    socket.emit('rejectvideo',(data)=>{     
        return('reject from socket')
    })

})
