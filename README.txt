README

--------- Registration ------------

To register an account POST: 
	url 	:	"localhost:3000/api/directors"
	data	:	{ livestream_id : <some_id_value> }

If the account does not exist with livestream, or has insufficient data. The response will explain the error. Otherwise it will create a new profile on this system with the data from livestream.

-------- List Directors ----------

To list all of the directors and their data, GET:
	url		: 	"localhost:3000/api/directors"

All of the accounts stored in this system will be sent back along with their favorite_movies and favorite_camera.


--------- Update -----------------
Must have the correct authorzation hash.


1. Adding to an Account

	To add information to a director profile PUT:
		url 	:	"localhost:3000/api/directors"

		header	:	{ authorization 	: 	"Bearer md5(full_name_of_account)" }

		data	:	{ livestream_id		: 	<id number> },
				:	{ favorite_camera 	: 	"some sort of camera" },
				:	{ favorite_movies[] :	"name of a movie"},
				:	{ favorite_movies[] :	"another movie"}

	When completed, if correct authorized, each of the movies in the 'favorite_movies' array will be added to the directors profile.
	In addition if 'favorite_camera' is presented it will be changed to that value on the account.


2. Deleting from an Account
	
	To add information to a director profile DELETE:
		url 	:	"localhost:3000/api/directors"

		header	:	{ authorization 	: 	"Bearer md5(full_name_of_account)" }

		data	:	{ livestream_id		: 	<id number> },
				:	{ favorite_camera 	: 	"anything" },
				:	{ favorite_movies[] :	"name of a movie"},
				:	{ favorite_movies[] :	"another movie"}

	When completed, if correct authorized, each of the movies in the 'favorite_movies' array will be deleted from the directors profile.
	In addition if 'favorite_camera' is presented it will be changed to a blank value regardless of what is in the request.