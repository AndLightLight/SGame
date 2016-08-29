var playerManger = function () {
    this.palyerlist = {}

    this.createPlayer = function (uid,password) {
        if (this.playerlist[uid]) {
            return false;
        }
        else {
            var newplayer = new require("player")(uid,password);
            this.playerlist[uid] = newplayer;
        }

        return true;
    }

    this.getPlayerByUid = function (uid) {
        return this.playerlist[uid];
    }

    this.getPlayerScoreList = function () {
        var scoreList = {};
        for (var key in this.playerlist) {
            if (this.playerlist.hasOwnProperty(key)) {
                var element = this.playerlist[key];
                scoreList[element.uid] = element.score;
            }
        }
        return scoreList;
    }
}



playerManger.g_Instance
playerManger.GetInstance = function () {
    if (!playerManger.g_Instance) {
        playerManger.g_Instance = new playerManger();
    }

    return playerManger.g_Instance;
}

module.exports = playerManger;