
let hbs     = require('hbs');
let config  = require('../../config');

exports.commonFunctions = {
    toJSON : function(obj) {
        return new hbs.SafeString(JSON.stringify(obj));
    },
    __ : function(obj) {
        return config.i18n.__.apply(this, arguments);
    }
};