// movie.js

var mysql = require('mysql');
var Q	= require('q');


function Movie(data) {
	var self = this;
	if (data) {
		self.id = data.id;
		self.title = data.title;
	} else {
		self.id = null;
		self.title = null;
	}
}

// saves the current movie obj to db (must have title set)
// returns a promise with obj and its proper id
Movie.prototype.handleSave = function(connection) {
	var self = this;
	return Q.promise(function(resolve, reject, notify) {
		var query = "INSERT INTO ??(??) VALUES (?)";
		var table = ['movie', 'title', self.title];
		query = mysql.format(query, table);
		connection.query(query, function(err) {
			if (err) {
				console.log("Handle save error: \n" + err);
				reject(err);
			} else {
				self.getId(connection)
				.then(function(data) {
					self = new Movie(data);
					resolve(self);

				}, function(err) {
					console.log(err);
					reject(err);
				});
			}
			
		});
	});
	
}


// get the title of the current movie (must have id set)
// return promise with movie obj(title & id) / or error 
Movie.prototype.getTitle = function(connection) {
	var self = this;
	return Q.promise(function(resolve, reject, notify) {
		var query = "SELECT * FROM movie WHERE id = ?";
		var table = [self.id];
		query = mysql.format(query, table);
		connection.query(query, function(err, row) {
			if (err) {
				console.log("Get movie title error: \n" + err);
				reject(err);
			}
			else {
				self = new Movie(row[0]);
				resolve(self);
			}
				
		});
	});
}

// get the id of the obj with the saved title (must have title set)
// return promise with movie obj(title & id) / or error 
Movie.prototype.getId = function(connection) {
	var self = this;
	return Q.promise(function(resolve, reject, notify) {
		var query = "SELECT * FROM movie WHERE title = ?";
		var table = [self.title];
		query = mysql.format(query, table);
		connection.query(query, function(err, row) {
			// console.log(row);
			if (err) {
				console.log("Get movie id error: \n" + err);
				reject(err);
			}
			else {
				self = new Movie(row[0]);
				// console.log(self);
				resolve(self);
			}
				
		});
	});
}

// if the movie exists update the current object and return current obj
// if not return null
Movie.prototype.isExists = function(connection, title) {
	var self = this;
	return Q.promise(function(resolve, reject, notify) {
		var query = "SELECT * FROM movie WHERE title = ?";
		var table = [title];
		query = mysql.format(query, table);
		connection.query(query, function(err, row){
			if (err) {
				reject(err);
			} else {
				if (row.length > 0) {
					// console.log('movie exists');
					self = new Movie(row[0]);
					// console.log(self);
					resolve(self);

				} else {
					console.log('movie does not exist');
					self.title = title;
					resolve(null);
				}
			}
		});
	});
}

module.exports = Movie;