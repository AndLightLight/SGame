module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
		this.app = app;
};

var handler = Handler.prototype;

handler.upLoadScore = function(msg, session, next) {
	var score = msg.score;
	var uid = session.get("uid");
	next(null, {
		route: "sdfsdfsdf"
	});
	// var player = require("playerManager").GetInstance().getPlayerByUid(uid);
	// player.score = score;
}


handler.getScoreList = function(msg, session, next) {
	var uid = session.get("uid");
	next(null, {
		route: "aaaaaaa"
	});
	// var scorelist = require("playerManager").GetInstance().getPlayerScoreList();
	// next(null,{scorelist:scorelist});
}
