module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
		this.app = app;
};

var handler = Handler.prototype;

/**
 * New client entry chat server.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next stemp callback
 * @return {Void}
 */
handler.enter = function(msg, session, next) {
	var self = this;
	var uid = msg.username
	var sessionService = self.app.get('sessionService');

	//duplicate log in
	if( !! sessionService.getByUid(uid)) {
		next(null, {
			code: 500,
			error: true
		});
		return;
	}
	// self.app.rpc.player.playerRemote.add(session, 1, 1, 1, true, function(users){
	// 	next(null, {
	// 		users:users
	// 	});
	// });
	// if (!require("playerManager").createPlayer(uid,"1")) {
	// 	next(null, {
	// 		code: 500,
	// 		error: true
	// 	});
	// 	return;
	// }



	

	session.bind(uid);

	session.on('closed', onUserLeave.bind(null, self.app));

	next(null, {
		users:"users"
	});

};


/**
 * User log out handler
 *
 * @param {Object} app current application
 * @param {Object} session current session object
 *
 */
var onUserLeave = function(app, session) {
	if(!session || !session.uid) {
		return;
	}
};