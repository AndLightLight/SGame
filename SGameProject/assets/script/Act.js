cc.Class({

    properties: {

    },
    
    LoadFromeJson: function (filename) {
        var tb = require("../json/" + filename);
        return tb;
    },
    
    GetTableById: function (id) {
        var tb = require("../json/" + filename);
        var re = tb[id.toString()];
        return re;
    },

});
