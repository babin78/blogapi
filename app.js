var fs = require('fs'),
    http = require('http'),
    path = require('path'),
    methods = require('methods'),
    express = require('express'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    cors = require('cors'),
    passport = require('passport'),
    errorhandler = require('errorhandler'),
    mongoose = require('mongoose');
process.env.NODE_ENV=process.env.NODE_ENV || 'development';
var isProduction = process.env.NODE_ENV === 'production';
console.log('production mode :'+isProduction);
var isTest = process.env.NODE_ENV === 'test';
// Create global app object
var app = express();

app.use(cors());

// Normal express config defaults
/*if(!isProduction)
{
  app.use(require('morgan')('dev'));
}
*/

console.log(process.env.MONGODB_URI);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(require('method-override')());
app.use(express.static(__dirname + '/public'));

app.use(session({ secret: 'conduit', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false  }));

if (!isProduction) {
  app.use(errorhandler());
}
var conn;
if(isProduction){
  
/* 
 * Mongoose by default sets the auto_reconnect option to true.
 * We recommend setting socket options at both the server and replica set level.
 * We recommend a 30 second connection timeout because it allows for 
 * plenty of time in most operating environments.
 */
var options = { server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } }, 
                replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } } };       
 var connectionstr=process.env.MONGODB_URI || "mongodb://sa:system123#@ds161304.mlab.com:61304/conduitapp" 
  conn=mongoose.connect(connectionstr,options).then(function(){
                    console.log('connected to batabase');
                  }).catch(function(error) {
                console.log('error connecting to db: ' + error);
                });;

}
else if(isTest) {
 conn=mongoose.connect('mongodb://localhost/conduit-test');
 mongoose.set('debug', true);
}
 else {
  conn=mongoose.connect('mongodb://localhost/conduit');
  mongoose.set('debug', true);
}

conn.on('error', console.error.bind(console, 'connection error:'));  
require('./models/User');
require('./models/Article');
require('./models/Comment');
app.use(require('./routes'));

require('./config/passport');
/// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (!isProduction) {
  app.use(function(err, req, res, next) {
    console.log(err.stack);

    res.status(err.status || 500);

    res.json({'errors': {
      message: err.message,
      error: err
    }});
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({'errors': {
    message: err.message,
    error: {}
  }});
});

// finally, let's start our server...
var server = app.listen( process.env.PORT || 3000, function(){
  console.log('Listening on port ' + server.address().port);
});
