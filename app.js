var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');

var user = require('./routes/user');
var team = require('./routes/team');
var model = require('./routes/model');
var question = require('./routes/question');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret : '12345678',
  cookie : {
    maxage : 60000000000000
  }
}));
app.use(express.static(path.join(__dirname, 'public')));




app.use('/login/authenticate', user.login);
app.use('/login',user.renderpage);
// app.use('/login',user.renderLoginPage);

app.use('/userdetails',user.getdetails);

app.use('/register/team',team.register);
app.use('/teamregister/',team.render);

app.use('/notifications',user.sendNotifications);


app.use('/getquestions',question.fetch);
app.use('/submitcode',user.submitcode);
app.use('/uploadcode',user.uploadcode);
app.use('/getmodel',model.fetch);
app.use('/getmodels',model.fetchAll);

app.use('/main',routes.test);

app.use('/', routes.perform);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
