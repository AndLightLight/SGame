var Act = cc.Class({

    properties: {

    },
    
});

Act.LoadFromeJson = function (filename) {
    var file = new ActiveXObject("Scripting.FileSystemObject");
    var ts = file.OpenTextFile("../json/" + filename, 1); 
    var vl = ts.ReadAll();
    var tb = require("../json/" + filename);
    return tb;
};

Act.GetTableById = function (id) {
    var tb = require("../json/" + filename);
    var re = tb[id.toString()];
    return re;
};


module.exports = Act;
