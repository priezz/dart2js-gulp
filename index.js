// options 
// output : '.dump/out.js'
// check : false,
// minify : false

//require
var _ = require('lodash');
var through = require('through2');
var gutil = require('gulp-util');
var mkdirp = require('mkdirp');
var PluginError = gutil.PluginError;
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec; //execFile fork
//path
var HOME_DIR = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
var SDK_DIR = HOME_DIR + "/dart/dart-sdk";
var DART2JS = path.normalize(
                SDK_DIR + "/bin/dart2js");

/*
var SNAPSHOT = path.normalize(
                SDK_DIR + "/bin/snapshots/dart2js.dart.snapshot");
*/

var TEMP = '.dump';
// var OUTPUT_FREFIX = '--out=';
var OPTIONS = {
    output: '',
    check: '-c',
    minify: '-m'
};

function getConfig(args) {
    var DEFAULT = {
        tempDir: TEMP,
        check: false,
        minify: false
    };
    var defOpt = _.cloneDeep(OPTIONS);
    var opt = _.defaults(args || DEFAULT, DEFAULT);

    var ext = '';
//     if(path.extname(opt.output) == '') ext = '.js';
//     defOpt.output = path.normalize(opt.output + ext);
    if(!opt.check) delete defOpt.check;
    if(!opt.minify) delete defOpt.minify;

    return defOpt;
}

module.exports = function (opt, sdk) {
    var config = getConfig(opt);
    var t = _.cloneDeep(config);
//     t.output = OUTPUT_FREFIX.concat(t.output);
    var uOpt = _.values(t);
    var cmd = sdk || DART2JS;

    function transform(file, enc, cb) {
        if (file.isNull()) return cb(null, file); 
        if (file.isStream()) {
            return cb(new PluginError('dart2js-gulp', 'Streaming not supported'));
        }

        var dest = gutil.replaceExtension(file.path, '.js');
        var input = config.tempDir + '/in.dart';
        var output = config.tempDir + '/out.js';

        fs.exists(config.tempDir, function(exists) {
            if(!exists){ 
                mkdirp(config.tempDir, function(err) {
                    if(err) {
                        stream.resume();
                        cb(new PluginError('dart2js-gulp', err));
                    }
                });
            }
        });

        var baseCmd = new Array(cmd, input);
        var execCmd = baseCmd.concat(uOpt).join(' ');

        fs.writeFile(input, file.contents, function() {
            exec(execCmd,
                function(err, stdout, stderr) {
                    if(!err) {
                        fs.exists(output, function(exists) {
                            if(exists) {
                                fs.readFile(output, function(err, data) {
                                    if(err) cb(new PluginError('dart2js-gulp', err));
                                    file.contents = data;
                                    stream.resume();
                                });
                            } else {
                                stream.resume();
                                cb(new PluginError('dart2js-gulp', 'dart2js export file not exsists.'));
                            }
                        });
                    } else {
                        stream.resume();
                        cb(new PluginError('dart2js-gulp', err));
                    }
                }
            );

        });

        file.path = dest;
        return cb(null, file);
    }

    var stream = through.obj(transform);
    stream.pause();
    return stream;
};

// vmOpt[vmOpt.length -1] = '--heap_growth_rate=512';

/*
exec('$DART_VM_OPTIONS', function(err, stdout, stderr) {
    if(stdout) vmOpt += stdout;
});

*/

/*
fs.fstatSync(1, function(err, stats) {
    if(!stats) {
        exec('tput colors', function(err, stdout, stderr) {
            if(8 > stdout) exOpt += ('--enable-diagnostic-colors');
        });
    }
});
*/

/*
command_self.conatain('/*_developer/') {
    vmOpt += ('--checked');
}
*/

/*
fs.stat(SNAPSHOT, function(err, stats) {
    if(stats) {
        exOpt += ("--library-root=" + SDK_DIR);
        exec(DART vmOpt "$SNAPSHOT" exOpt "$@", function(err, stdout, stderr) {
        });
    }
});
*/
