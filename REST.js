// callback is a function
var Director = require('./app/models/director.js');
var Movie = require('./app/models/movie.js');
var Q	= require('q');



function REST_ROUTER(router, connection, md5, http) {
	var self = this;
	self.db_connection = connection;
	self.handleRoutes(router, connection, md5, http);
}

REST_ROUTER.prototype.makeDirector = function(data) {
	data = JSON.parse(data);
	var director = new Director(data);
	console.log(obj);
	data = director;
}

REST_ROUTER.prototype.handleRoutes = function(router, connection, md5, http) {
	var self = this;

	router.get("/directors", function(request, response) {
		var x = new Director(null);
		x.getAllDirectors(connection, response);
	});

	router.post("/directors", function(request, response) {
		var x = new Director(null);
		x.livestream_id = request.body.livestream_id;
		x.getDirector(connection)
		.then(function(data) {
			x = data;
			response.json(x);
		}, function(err) {
			console.log(err);
			x.getLivestreamData(http, response, connection, x.register);
		});
	});

	router.put("/directors", function(request, response) {
		var self = this;
		var x = new Director(null);
		x.livestream_id = request.body.livestream_id;
		x.getDirector(connection)
		.then(function(data) {
			x = data;
			if (x.authorize(md5, request.headers.authorization) == true) {
				// x.handlePut(connection, request, response);
				x.handleUpdate(connection, request, response, 'put');
			} else {
				response.json({ "Error Message" : "Incorrect authorization" });
			}
		}, function(err) {
			console.log(err);
			response.json({ "Error Message" : err });
		});
	});

	router.delete("/directors", function(request, response) {
		var self = this;
		var x = new Director(null);
		x.livestream_id = request.body.livestream_id;
		x.getDirector(connection)
		.then(function(data) {
			console.log(data);
			x = data;
			if (x.authorize(md5, request.headers.authorization) == true) {
				// x.handleDelete(connection, request, response);
				x.handleUpdate(connection, request, response, 'delete');
			} else {
				response.json({ "Error Message" : "Incorrect authorization" });
			}
		}, function(err) {
			console.log(err);
			response.json({ "Error Message" : err });
		});
	});
}


module.exports = REST_ROUTER;