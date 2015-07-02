<snippet>
  <content>
# 1:API Challenge

TODO: Write a project description

## Installation

Assuming you have NPM and MYSQL installed.

1. Create Database with snippits (see DB create statements)

2. Install packages: `npm install`
3. To start the server:
	* For Development: `nodemon server.js`
	* For Production: `npm start`


## Usage



### Registration

To register an account POST: 

```
{ url 	:	localhost:3000/api/directors }
{ data	:	
	{ livestream_id : <some_id_value>
 }
```

If the account does not exist with livestream, or has insufficient data. The response will explain the error. Otherwise it will create a new profile on this system with the data from livestream.

### List Directors

To list all of the directors and their data, GET:

```
{ url		: 	"localhost:3000/api/directors" }
```

All of the accounts stored in the DB will be sent back along with their favorite_movies and favorite_camera.

### Update
Must have the correct authorzation hash stored in the header or the request will have no effect.

##### Adding to an Account

To add information to a director profile PUT:

```
{ url 	:	"localhost:3000/api/directors" }

{ header	:	{ authorization 	: 	"Bearer md5(full_name_of_account)" } }
{ data	:	
	{ livestream_id		: 	<id number> },
	{ favorite_camera 	: 	"some sort of camera" },
	{ favorite_movies[] :	"name of a movie"},
	{ favorite_movies[] :	"another movie"}
}
```

When completed, if correct authorized, each of the movies in the 'favorite_movies' array will be added to the directors profile. In addition if 'favorite_camera' is presented it will be changed to that value on the account.


##### Deleting from an Account
	
To add information to a director profile DELETE:
	
```
{ url 	:	"localhost:3000/api/directors" }
{ header	:	{ authorization 	: 	"Bearer md5(full_name_of_account)" } }
{ data	:	
	{ livestream_id		: 	<id number> },
	{ favorite_camera 	: 	"anything" },
	{ favorite_movies[] :	"name of a movie"},
	{ favorite_movies[] :	"another movie"}
}
```
When completed, if correct authorized, each of the movies in the 'favorite_movies' array will be deleted from the directors profile. In addition if 'favorite_camera' is presented it will be changed to a blank value regardless of what is in the request.





----------------------------------------------------------------------------------------------------
DB SQL Statements

```
CREATE TABLE `director` (
  `id` int(11) NOT NULL,
  `full_name` varchar(45) NOT NULL,
  `dob` varchar(25) NOT NULL,
  `favorite_camera` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `movie` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=84 DEFAULT CHARSET=latin1;


CREATE TABLE `fave_movies` (
  `director_id` int(11) NOT NULL,
  `movie_id` int(11) NOT NULL,
  KEY `director_id` (`director_id`),
  KEY `movie_id` (`movie_id`),
  CONSTRAINT `fave_movies_ibfk_1` FOREIGN KEY (`director_id`) REFERENCES `director` (`id`),
  CONSTRAINT `fave_movies_ibfk_2` FOREIGN KEY (`movie_id`) REFERENCES `movie` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

```

]]></content>
  <tabTrigger>readme</tabTrigger>
</snippet>