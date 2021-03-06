var gulp    = require('gulp'),
	plumber = require('gulp-plumber'),
	stream  = require('event-stream'),
	ts      = require('gulp-typescript'),
	jasmine = require('gulp-jasmine'),
	concat  = require('gulp-concat'),
	cover   = require('gulp-coverage');

var paths = {
	src:  'src',
	spec: 'spec',
	dist: 'dist'
};

var files = {
	src:  paths.src + '/petri.ts',
	spec: paths.spec + '/**/*.ts',

	dist: paths.dist + '/petri.js',
	min:  paths.dist + '/petri.min.js',
	def:  paths.dist + '/petri.d.ts'
};

var tsProject = ts.createProject({
	target: 'es5',
	module: 'commonjs',
	declarationFiles: true,
	sortOutput: true
});

gulp.task('compile', function() {
	var result = gulp.src(files.src)
		.pipe(ts(tsProject));
	
	return stream.merge(
		result.js
			.pipe(concat(files.dist))
			.pipe(gulp.dest('.')),

		result.dts
			.pipe(gulp.dest(paths.dist))
	);
});

gulp.task('test', function() {
	return gulp.src(files.spec)
		.pipe(plumber({
			errorHandler: function() {
				this.emit('end');
			}
		}))
		.pipe(ts())
		.js
		.pipe(gulp.dest(paths.spec))
		.pipe(cover.instrument({
			pattern: [files.dist],
		}))
		.pipe(jasmine())
		.pipe(cover.report({
			outFile: 'coverage.html'
		}));
});

gulp.task('dev', function() {
	gulp.watch(files.src, ['compile']);
	gulp.watch([files.spec, files.dist], ['test']);
});

gulp.task('default', ['compile', 'test']);
