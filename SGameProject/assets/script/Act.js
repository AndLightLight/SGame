var Act = cc.Class({

    properties: {

    },
    
});

Act.LoadFromeJson = function (filename) {
    var tb = require("../json/" + filename);
    return tb;
};

Act.GetTableById = function (id) {
    var tb = require("../json/" + filename);
    var re = tb[id.toString()];
    return re;
};


module.exports = Act;
