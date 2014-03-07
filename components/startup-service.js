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

log('startup-services.js');

function StartupService() {}

StartupService.prototype = {

    launch: function(bin) {
        var process = Cc['@mozilla.org/process/util;1'];
        this._server = process.createInstance(Ci.nsIProcess);
        var root = Cc['@mozilla.org/file/directory_service;1']
            .getService(Ci.nsIProperties)
            .get('CurProcD', Ci.nsILocalFile)
            .path;
        var file = Cc['@mozilla.org/file/local;1'];
        var handler = file.createInstance(Ci.nsILocalFile);
        var exe = root + '\\wnmp\\' + bin;
        var args = [];

        handler.initWithPath(exe);
        this._server.init(handler);
        this._server.runAsync(args, args.length);
    },
    setup: function() {
        log('************* SETUP');


        this.launch('serve.vbs')

        Services.obs.addObserver(this, 'quit-application-granted', false);

        log('************* STARTED');
        return;
    },

    quit: function() {

        this.launch('stop.vbs')

        Services.obs.addObserver(this, 'quit-application-granted', false);
        log('************* QUIT');
        return;
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
