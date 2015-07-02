// director.js

var mysql = require('mysql');
var Q	= require('q');
var Movie = require('./movie.js');



function Director(data) {
	var self = this;
	if (data == null) {
		self.livestream_id = null;
		self.full_name = null;
		self.dob = null;
	} else {
		self.livestream_id = data.id;
		self.full_name = data.full_name;
		self.dob = data.dob;
	}
	self.favorite_camera = 'None';
	self.favorite_movies = new Array();	
}

// gets all of the directors and then loads their favorite movies
// after fills response with the apropriate data
Director.prototype.getAllDirectors = function(connection, response) {
	var self = this;
	console.log("Get all directors");
	self.getAllDirectorProfiles(connection)
	.then(function(data) {
		console.log(data);
		var promises = data.map(function(elem) {
			self.livestream_id = elem.id;
			return self.loadFavoriteMovies(connection);
		});
		Q.all(promises).then(function(results) { 
			for (var i = results.length - 1; i >= 0; i--) {
				data[i].favorite_movies = results[i];
			};
			response.json(data);
		});

	}, function(err) {
		response.json(err);
	});
}

// get all of the profiles of the directors stored on this system
// does not include all of their favorite movies
Director.prototype.getAllDirectorProfiles = function(connection) {
	console.log("Get all directors ids");
	return Q.Promise(function(resolve, reject, notify) {
		var query = "SELECT * FROM director";
		var table = [];
		query = mysql.format(query, table);
		console.log(query);
		connection.query(query, function(err, rows) {
			if (err) {
				console.log(err);
				reject(err);
			} else {
				resolve(rows);
			}
		});
	});
}

// check if the authorization code provided is correct for this director (must have full_name set)
// return true if it passes / false if it fails
Director.prototype.authorize = function(md5, key) { 
	var self = this;
	if (md5(self.full_name) == key) {
		return true;
	}	else {
		return false;
	}
}

// get all of the favorite movies assigned to this director (must have livestream_id set)
// must search fave_movies table then link with movie table
// return promise containing all of the movies with their titles
Director.prototype.loadFavoriteMovies = function(connection) {
	var self = this;
	return Q.Promise(function(resolve, reject, notify) {
		var query = "SELECT fave_movies.movie_id as 'id', movie.title FROM fave_movies INNER JOIN movie ON fave_movies.movie_id=movie.id WHERE fave_movies.director_id=?";
		var table = [self.livestream_id];
		query = mysql.format(query, table);
		connection.query(query, function(err, rows) {
			if (err) {
				console.log(err);
				reject(err);
			} else {
				resolve(rows);
			}
		});
	});
	
}

// get the profile of this director (must have livestream_id set)
// will return promise containing the entire profile including their favorite movies
Director.prototype.getDirector = function(connection) {
	var self = this;
	return Q.Promise(function(resolve, reject, notify) {
		var query = "SELECT * FROM director WHERE id=?";
		var table = [self.livestream_id];
		query = mysql.format(query, table);
		connection.query(query, function(err, rows) {
			if (err) {
				console.log(err);
				reject(err);
			} else {
				if (rows.length > 0) {
					self = new Director(rows[0]);
					self.favorite_camera = rows[0].favorite_camera;
					self.loadFavoriteMovies(connection)
					.then(function(data) {
						self.favorite_movies = data;
						resolve(self);
					}, function(err) {
						reject(err);
					});
				} else {
					reject("Sorry the account does not exist");
				}
				
			}
		});
	});
}

// get the data that livestream has stored on their server then execute the callback (must have livestream_id set)
// will fill the response object with the correct info
Director.prototype.getLivestreamData = function(http, response, connection, callback) {
	var self = this;
	var options = {
		host : 'api.new.livestream.com',
		path : "/accounts/" + self.livestream_id
	};
	var request = http.request(options, function(res) {
		var data = '';
		res.on('data', function (chunk) {
		  	data += chunk;
		});
		res.on('end', function () {
			self = new Director(JSON.parse(data));
			callback(connection, response, self);
		});
	});
	request.end();
}

// register the director saved in obj to the DB
// return the director obj if successful / if failed return the error message
Director.prototype.register = function(connection, response, obj) {
	var self = this;
	var query = "INSERT INTO ??(??, ??, ??, ??) VALUES (?, ?, ?, ?)";
	var table = ['director', 'id', 'full_name', 'dob', 'favorite_camera', obj.livestream_id, obj.full_name, obj.dob, obj.favorite_camera];
	query = mysql.format(query, table);
	console.log(query);
	connection.query(query, function(err) {
		if (err) {
			console.log(err);
			response.json(err);
		} else {
			response.json(obj);
		}
	});
}

// handle the update of the director obj
// the orig_request holds the data that must be changed and the method decides what to do with it
// it does not return anything but will wait till completion to fill the request object
// if there are errors they will be logged and stored in the response obj
// after DB update is complete it will query for the latest data stored in DB
Director.prototype.handleUpdate = function(connection, orig_request, response, method) {
	var self = this;
	var promises = new Array();
	if (orig_request.body.favorite_movies) {
		// promises.push(self.addMovies(connection, orig_request.body.favorite_movies));
		if (method == 'put')
			promises.push(self.editMovies(connection, orig_request.body.favorite_movies, 'addMovie'));
		else if (method == 'delete')
			promises.push(self.editMovies(connection, orig_request.body.favorite_movies, 'unlinkMovie'));
	}
	if (orig_request.body.favorite_camera) {
		if (method == 'put')
			promises.push(self.setFaveCamera(connection, orig_request.body.favorite_camera));
		else if (method == 'delete')
			promises.push(self.setFaveCamera(connection, ''));
		
	}
	Q.all(promises).then(function(results) {
		self.getDirector(connection)
		.then(function(data) {
			response.json(data);
		}, function(err) {
			console.log(err);
			response.json(err);
		});
	});
}

// operates with a collection of movies stored in 'titles'
// dependent on the 'type' it will either add them or unlink them
// returns a promise containing the movies with ids
Director.prototype.editMovies = function(connection, titles, type) {
	var result;
	var self = this;
	return Q.promise(function(resolve, reject, notify) {
		var promises = new Array(titles.length);
		for (var i = titles.length - 1; i >= 0; i--) {
			// [type acts like variable, if string can also be function name]
			promises[i] = self[type](connection, titles[i]);
		}
		Q.all(promises).then(function(results) {
			if (type == 'addMovie'){
				for (var i = results.length - 1; i >= 0; i--) {
					self.linkMovie(connection, results[i]);
				}
			}
		    resolve(results);
		});
	});
}

// takes the 'title' argument, matches the id to it
// then checks if the movie is linked to this director
// if it is it will delete the link and leave the movie alone
// it will fail silently if the id or link is not found (doesnt need to alert cause the deed is done)
Director.prototype.unlinkMovie = function(connection, title) {
	var self = this;
	var tmp_movie = new Movie();
	tmp_movie.title = title;
	return Q.promise(function(resolve, reject, notify) {
		tmp_movie.getId(connection)
		.then(function(movie) {
			tmp_movie = movie;
			self.isLinked(connection, tmp_movie)
			.then(function(linked) {
				if (linked == true) {
					self.deleteLink(connection, movie)
					.then(function(data) {
						resolve(data);
					}, function(err) {
						reject(err);
					});
				} else if (linked == false) {
					resolve(self);
				}
			}, function(err) {
				console.log(err);
				reject(err);
			});
		}, function(err) {
			console.log(err);
			reject(err);
		});
	});
}

// take a 'movie' argument that is an object (must have movie.id)
// if it is linked to this director return true / false if not linked
Director.prototype.isLinked = function(connection, movie) {
	var self = this;
	return Q.Promise(function(resolve, reject, notify) {
		var query = "SELECT * FROM fave_movies WHERE director_id=? AND movie_id=?";
		var table = [self.livestream_id, movie.id];
		query = mysql.format(query, table);
		connection.query(query, function(err, row) {
			if (err)
				reject(err);
			if (row.length > 0) {
				console.log("movie is linked ==> " + movie.title);
				resolve(true);
			} else {
				console.log("movie is not linked ==> " + movie.title);
				resolve(false)
			}
			
		});
	});
}

// use the 'movie' argument and the current director
// remove the link in the 'fave_movies' table
Director.prototype.deleteLink = function(connection, movie) {
	var self = this;
	return Q.promise(function(resolve, reject, notify) {
		var query = "DELETE FROM ?? WHERE ??=? AND ??=?";
		var table = ['fave_movies', 'movie_id', movie.id, 'director_id', self.livestream_id];
		query = mysql.format(query, table);
		connection.query(query, function(err) {
			if (err) {
				console.log(err);
				reject(err);
			} else {
				resolve(movie);
			}
		});
	});
}

// use the 'title' args to create a movie obj in the movie table
// first check if it exists, if it doesnt save it to the db
// if it already exists it will return the movie obj with id
Director.prototype.addMovie = function(connection, title) {
	var self = this;
	var movie = new Movie();
	return Q.promise(function(resolve, reject, notify) {
		movie.isExists(connection, title)
		.then(function(test) {
			if (test == null) {
				movie.title = title;
				movie.handleSave(connection)
				.then(function(data) {
					console.log(data);
					resolve(data);
				}, function(err) {
					reject(err);
				});
			} else if (test) {
				resolve(test);
			}
		}, function(err) {
			console.log(err);
			reject(err);
		});
	});
}


// use the movie obj and save a link between this director and that movie to the DB
// returns nothing, but will log errors to the console
Director.prototype.addMovieLink = function(connection, movie) {
	var self = this;
	var query = "INSERT INTO ??(??, ??) VALUES (?, ?)";
	var table = ['fave_movies', 'movie_id', 'director_id', movie.id, self.livestream_id];
	query = mysql.format(query, table);
	connection.query(query, function(err) {
		if (err)
			console.log(err);
		else {
			console.log("Successfully added link: " + movie);
		}
			
	});
}

// first checks if the movie is already linked
// if it is not then it will add the link
// returns nothing, but will log errors to the console
Director.prototype.linkMovie = function(connection, movie) {
	var self = this;
	self.isLinked(connection, movie, self.addMovieLink)
	.then(function(islinked) {
		if (islinked == false) {
			self.addMovieLink(connection, movie);
		}
	}, function(err) {
		console.log(err);
	});
}

// uses the 'value' arg to update the favorite_camera of this director
// return a promise containg this director if successful // return error if something goes wrong
Director.prototype.setFaveCamera = function(connection, value) {
	var self = this;
	self.favorite_camera = value;
	return Q.Promise(function(resolve, reject, notify) {
		var query = "UPDATE director SET favorite_camera=? WHERE full_name=?";
		var table = [self.favorite_camera, self.full_name];
		query = mysql.format(query, table);
		connection.query(query, function(err) {
			if (err) {
				console.log(err);
				reject(err);
			} else {
				resolve(self);
			}
		});
	});	
}

module.exports = Director;

