'use strict';

var gulp 					= require('gulp'),
		livereload 		= require('gulp-livereload'),
		http 					= require('http'),
		st 						= require('st');

gulp.task('css', function(){
	return gulp.src(['static/style/*.css'])
		.pipe(livereload());
});
gulp.task('html', function(){
	return gulp.src(['*.html'])
		.pipe(livereload());
});

gulp.task('watch', function(){
	livereload.listen({ basePath: 'static' });
	gulp.watch('static/styles/*.css', ['css']);
	gulp.watch('*.html', ['html']);
})

gulp.task('server', function(done){
	http.createServer(
		st({ path:__dirname , index:'index.html', cache: false })
	).listen(3000, done);
});


gulp.task('default', ['server', 'watch'])