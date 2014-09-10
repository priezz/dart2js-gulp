// options 
// check : false,
// minify : false

//require
var _ = require('lodash'),
    through = require('through2'),
    gutil = require('gulp-util'),
    PluginError = gutil.PluginError;
var fs = require('fs'),
    path = require('path'),
    exec = require('child_process').exec; //execFile fork
//path
var HOME_DIR = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
var SDK_DIR = HOME_DIR + "dart/dart-sdk";
var DART2JS = path.normalize(
                SDK_DIR + "/lib/_internal/compiler/implementation/dart2js.dart");
var DART = path.normalize(
                SDK_DIR + "/bin/dart");
var SNAPSHOT = path.normalize(
                SDK_DIR + "/bin/snapshots/dart2js.dart.snapshot");

var DUMP = '.dump';


function loadOpt(arg) {
    var DEFAULT = {
        check: false,
        minify: false
    };
    var OPTIONS = {
        inDir: ' .dump/in.dart',
        outDir: ' --out=.dump/out.js',
        check: ' -c',
        minify: ' -m'
    };
    var opt = _.defaults(arg, DEFAULT);

    if(!opt.check) delete OPTIONS.check;
    if(!opt.minify) delete OPTIONS.minify;

    return _.values(OPTIONS);
}

module.exports = function (opt, config) {
    var vmOpt;
    var exOpt;
    var uOpt = loadOpt(opt);
    
    function transform(file, enc, cb) {
        if (file.isNull()) return cb(null, file); 
        if (file.isStream()) {
            return cb(new PluginError('dart2js-gulp', 'Streaming not supported'));
        }
        
        if(!fs.existsSync(DUMP)) fs.mkdirSync(DUMP);
        fs.writeFileSync(uOpt.inDir, file.contents);
        
        var dest = gutil.replaceExtension(file.path, '.js')

        fs.fstatSync(1, function(err, stats) {
            if(!stats) {
                exec('tput colors', function(err, stdout, stderr) {
                    if(8 > stdout) exOpt += ('--enable-diagnostic-colors');
                });
            }
        });

        vmOpt[vmOpt.length -1] = '--heap_growth_rate=512';

        exec('$DART_VM_OPTIONS', function(err, stdout, stderr) {
            if(stdout) vmOpt += stdout;
        });

        exec(_.flatten(DART, vmOpt, DART2JS, exOpt, uOpt).join(" "),
            function(err, stdout, stderr) {
                if(!err) {
                    fs.exists(args.outDir, function(exists) {
                        if(exists) {
                            fs.readFile(args.outDir, function(err, data) {
                                gutil.log(gutil.colors.green('dart2js compiled.'));
                                stream.resume();
                            });
                        } else {
                            gutil.log(gutil.colors.red('Compiled file not exist.'));
                            stream.resume();
                        }
                    });
                } else {
                    gutil.log('Compile error:', err.toString()));
                    stream.resume();
                }
            }
        );

        file.path = dest;
        return cb(null, file);
    }

    var stream = through.obj(transform);
    stream.pause();
    return stream;
};

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
