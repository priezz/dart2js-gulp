//jasmine-node test.spec.js

var fs = require('fs'),
    path = require('path'),
    gutil = require('gulp-util'),
    _ = require('lodash');

expectData = {
	timestamp : null,
    stamped : null,
    cleanup : function(dirpath) {
        fs.readdir(dirpath, function(err, files) {
            if(err) return gutil.log(err.toString());
            _.forEach(files, function(actual) {
                var fileName = dirpath + actual;
                fs.stat(fileName, function(err, stats) {
                    if(err) return null;                   
                    if(stats.isFile()) {
                        fs.unlink(fileName, function(err) {
                            if(err) return gutil.log(err.toString()); 
                        });
                    }
                });
            });
        });
    },
	make : function(dartpath) {
        this.timestamp = new Date().valueOf();
        var data = fs.readFileSync(dartpath);
        this.stamped = new Buffer(
                            data.toString()
                                .replace(/timestamp = r\'.*?(?=\';)/,
                                         'timestamp = r\'' + this.timestamp)
                            );
        fs.writeFile('dart/exist.dart', this.stamped, function(err) {
            if(err) return gutil.log(err.toString()); 
        });

        var base = path.dirname(dartpath);
        return new gutil.File({
            path: dartpath,
            base: base,
            cwd: path.dirname(base),
            contents: this.stamped
        });
	}
};

describe('dart2js', function() {
    var dart = require('../');
    var act;

    beforeEach(function(done) {
        expectData.cleanup('dart');
		act = null;

        dart()
            .on('error', function() {
                done();
            })
            .on('data', function(f) {
            	act = f._contents;
                done();
            })
            .write(expectData.make('dart/exist.dart'));
    });

    it('should compile dart file.', function() {
        expect(act.toString())
	        	.toMatch(expectData.timestamp);
    });
});

describe('dart2js configured sdk-path', function() {
    var SDK_PATH = '/dart/dart-sdk/';
    var dart = require('../');
    var err;

    beforeEach(function(done) {
        expectData.cleanup('dart');
        err = false;

        dart(null, SDK_PATH)
        	.on('error', function() {
        		err = true;
                done();
            })
            .write(expectData.make('dart/exist.dart'));
    });

    it('should compile dart file.', function() {
        expect(err).toBeTruthy();
    });
});

describe('dart2js', function() {
    var dart = require('../');
    var options = {check: true};
    var act;

    beforeEach(function(done) {
        expectData.cleanup('dart');
		act = null;

        dart(options)
            .on('error', function() {
                done();
            })
            .on('data', function(f) {
            	act = f._contents;
                done();
            })
            .write(expectData.make('dart/exist.dart'));
    });

    it('should compile dart file. (check)', function() {
        expect(act.toString())
	        	.toMatch(expectData.timestamp);
        expect(act.toString())
	        	.toMatch('generateAccessor');
    });
});

describe('dart2js', function() {
    var dart = require('../');
    var options = {minify: true};
    var act;

    beforeEach(function(done) {
        expectData.cleanup('dart');
		act = null;

        dart(options)
            .on('error', function() {
                done();
            })
            .on('data', function(f) {
            	act = f._contents;
                done();
            })
            .write(expectData.make('dart/exist.dart'));
    });

    it('should compile dart file. (minify)', function() {
        expect(act.toString())
	        	.toMatch(expectData.timestamp);
        expect(act.toString())
	        	.not.toMatch('END invoke');
    });
});