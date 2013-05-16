/*jshint node: true */
var express = require('express');
var http = require('http');
var path = require('path');
var routes = require('./routes');
var app = express();

app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.static(path.join(__dirname, 'public')));
});

var server = http.createServer(app).listen(app.get('port'), function () {
    console.log("Serwer nasłuchuje na porcie " + app.get('port'));
});

//moduł przechowujący dane aplikacji
var appData = require('./lib/appData')();
//moduł do obsługi czasu
var appTimer = require('./lib/appTimer')();

var appServer = require('./lib/appServer');
appServer.listen(server, appData, appTimer);

app.get(/^\/AJAX\/getPlayers\/(\w+)\//, function(req,res) { routes.ajaxGetPlayers(req,res,appData); });
app.get(/^\/AJAX\/getTeams\//, function(req,res) { routes.ajaxGetTeams(req,res,appData); });
app.get(/^\/AJAX\/getTime\//, function(req,res) { routes.ajaxGetCurrentTimeAndHalf(req,res,appTimer); });



