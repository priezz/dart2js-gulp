Dart2js Command Line Tool Wrapper for gulp. 
If you want to use source-map when use output option.

###Usage

```
var dart = require('dart2js-gulp');

gulp.task('dart', function() {
  gulp.src('./src/*.dart')
    .pipe(dart())
    .pipe(gulp.dest('./public'))
});
```

####options
```
//check === checked dart2js compiler option.

//default
dart({
  check: false,
  minify: false
})
```
###chnage log
######(future) transfom other dependency .
######0.0.5: fix error handring.
######0.0.5: Insert output option.
			 => Changed source file output approach. 
			(I tried to faster. but I don't understand. What exactly dart2js doing.)
######0.0.4: This is first usable commit.
			(sorry.)

###The MIT License (MIT)

Copyright (c) 2014 TsutomuNakazima(tsutomunakazima@live.jp)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
