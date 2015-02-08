const WEB_URI = 'www';
const WEB_ROUTER = '';
const WEB_IP = '127.0.0.1:8080'
const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import('resource://gre/modules/XPCOMUtils.jsm');
Cu.import('resource://gre/modules/Services.jsm');

var log = (function() {

    var i = 0;

    return function(msg) {

        dump('#' + i+++' ' + msg + '\n');
    };
})();

function StartupService() {}

StartupService.prototype = {

    _cmd: function (process, args){
        
    },

    fpm: function () {

    },
    http: function() {

    },
    setup: function() {
        log('setup');
    },

    quit: function() {
        log('quit');
    },

    observe: function(subject, topic, data) {
        switch (topic) {

            case 'profile-after-change':
                this.setup();
                break;

            case 'quit-application-granted':
                this.quit();
                break;
        }
    },

    classID: Components.ID('{71a88d9e-db4b-43ee-8a8a-50c1f3fe164e}'),
    QueryInterface: XPCOMUtils.generateQI([Ci.nsIObserver]),
    _xpcom_categories: [{
        category: 'profile-after-change',
        service: true
    }]
};

const NSGetFactory = XPCOMUtils.generateNSGetFactory([StartupService]);