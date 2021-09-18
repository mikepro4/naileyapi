const passport = require('passport');
const keys = require("../config/keys");
const requireAuth = passport.authenticate('jwt', { session: false });
const cloudinary = require('cloudinary').v2;

const _ = require("lodash");

cloudinary.config({ 
	cloud_name: keys.cloudName, 
	api_key: keys.apiKey, 
	api_secret: keys.apiSecret
});

module.exports = app => {
	app.get(
        "/user_details",
        requireAuth,
		(req, res) => {
            res.send(req.user)
		}
	);
};

const buildQuery = criteria => {
    const query = {};
    
	return query
};


