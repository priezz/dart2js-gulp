var through = require('through2'),
    gutil = require('gulp-util'),
    PluginError = gutil.PluginError,
    path = require('path'),
    fs = require('fs'),
    _ = require('lodash'),
    applySourceMap = require('vinyl-sourcemaps-apply'),
    exec = require('child_process').exec; //execFile fork

var homeDir = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
var SDK_PATH = path.normalize(
                    homeDir + '/dart/dart-sdk/bin/dart2js');
var DUMP = '.dump';
var INPUT = '.dump/input.dart',
    SOURCE = ' .dump/input.dart';
var OUTPUT = '.dump/out.js';


var DEFAULT_OPT = {
        check : false,
        minify : false,
        categories : 'client'
    };

function makeOpt(arg) {
    var F_OUT = ' --out=.dump/out.js';
        CHECKED = ' -c',
        MINIFY = ' -m';

    var f = F_OUT;
    if(arg.check) f += CHECKED;
    if(arg.minify) f += MINIFY;

    return f;
}

module.exports = function (opt, sdk_path) {
    var dtoj = (sdk_path)? sdk_path : SDK_PATH;
    opt = (opt)? _.defaults(opt, DEFAULT_OPT) : DEFAULT_OPT;
    
    var flag = makeOpt(opt);

    function transform(file, enc, cb) {
        if (file.isNull()) return cb(null, file); 
        if (file.isStream()) return cb(new PluginError('gulp-dart2js', 'Streaming not supported'));

        var cmd = dtoj + SOURCE + flag;
        var dest = gutil.replaceExtension(file.path, '.js')

        if(!fs.existsSync(DUMP)) fs.mkdirSync(DUMP);
        fs.writeFileSync(INPUT, file.contents);

        exec(cmd, function(err, stdout, stderr) {
            if (err) {
                var ms = err.toString() + ' =>' + cmd;
                gutil.log(ms);
                return cb(new PluginError('dart2js-gulp', ms));
            }

            fs.readFile(OUTPUT + '.map', function(err, map) {
                applySourceMap(file, map);
                fs.readFile(OUTPUT, function(err, data) {
                    file.contents = data;
                    fs.rmdir(DUMP, function() {
                        gutil.log(gutil.colors.green('dart2js compiled.'));
                        stream.resume();
                    });                    
                });
            });

        }); 

        file.path = dest;
        return cb(null, file);
    }

    var stream = through.obj(transform);
    stream.pause();
    return stream;
};