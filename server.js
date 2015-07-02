// Setup / Config

// PACKAGES
var express     = require('express');
var mysql       = require('mysql');
var bodyParser	= require('body-parser');
var http		= require('http');
var md5			= require('MD5');
var Q			= require('q');
var rest 		= require('./REST.js');
var director	= require('./app/models/director.js');
var app         = express();

function REST() {
	var self = this;
	self.connectMysql();
};

REST.prototype.connectMysql = function() {
	var self = this;
	var pool = mysql.createPool({
		connectionLimit : 100,
		host			: 'localhost',
		user			: 'root',
		password		: '',
		database		: 'livestream_db',
		debug			: false
	});
	pool.getConnection(function(err, connection) {
		if (err) {
			self.stop(err);
		} else {
			self.configureExpress(connection);
		}
	});
}

REST.prototype.configureExpress = function(connection) {
	var self = this;
	app.use(bodyParser.urlencoded({ exended : true }));
	app.use(bodyParser.json());
	var router = express.Router();
	app.use('/api', router);
	var rest_router = new rest(router, connection, md5, http, director);
	self.startServer();
}

REST.prototype.startServer = function() {
	app.listen(3000, function() {
		console.log("Running on port 3000");
	});
}

REST.prototype.stop = function(err) {
	console.log("Issue with MYSQL \n" + err);
	process.exit(1);
}

new REST;