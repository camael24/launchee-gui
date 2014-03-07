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

    _root: null,
    _server: null,

    init: function() {

        var process = Cc['@mozilla.org/process/util;1'];
        var server = process.createInstance(Ci.nsIProcess);
        var file = Cc['@mozilla.org/file/local;1'];
        var handler = file.createInstance(Ci.nsILocalFile);
        var exe = this._root + '\\start.vbs';

        handler.initWithPath(exe);
        server.init(handler);

        return server;
    },


    launch: function(bin) {
        var args = [
            this._root + '\\' + bin,
            this._root
        ];

        this.init().runAsync(args, args.length);
    },
    launch: function(bin, pid) {
        var args = [
            this._root + '\\' + bin,
            this._root,
            pid
        ];

        this.init().runAsync(args, args.length);
    },
    cmd: function(bin) {

        var args = [
            'C:\\Windows\\System32\\cmd.exe /C ' + bin,
            this._root
        ];

        this.init().runAsync(args, args.length);

    },

    kill: function(pidFile) {

        var filePath = this._root + "\\" + pidFile;

        var file = Components.classes["@mozilla.org/file/local;1"]
            .createInstance(Components.interfaces.nsILocalFile);

        var fstream = Components.classes["@mozilla.org/network/file-input-stream;1"]
            .createInstance(Components.interfaces.nsIFileInputStream);
        var sstream = Components.classes["@mozilla.org/scriptableinputstream;1"]
            .createInstance(Components.interfaces.nsIScriptableInputStream);

        file.initWithPath(filePath);
        if (file.exists() == false) {
            log("File does not exist");
        }

        fstream.init(file, 0x01, 00004, null);
        sstream.init(fstream);

        var pid = sstream.read(sstream.available());

        sstream.close();
        fstream.close();

        this.cmd('taskkill /pid ' + pid);

    },



    setup: function() {
        log('************* SETUP');

        this._root = Cc['@mozilla.org/file/directory_service;1']
            .getService(Ci.nsIProperties)
            .get('CurProcD', Ci.nsILocalFile)
            .path;



        this.launch('php\\php-cgi.exe -b 127.0.0.1:9000', 'pid\\php.pid');
        this.launch('nginx\\nginx.exe -p nginx')

        Services.obs.addObserver(this, 'quit-application-granted', false);

        log('************* STARTED');
        return;
    },

    quit: function() {

        this.launch('nginx\\nginx.exe -p nginx -s quit')
        this.kill('pid\\php.pid');


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