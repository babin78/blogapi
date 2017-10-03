'user strict';

import gulp from 'gulp';
import nodemon from 'gulp-nodemon';


gulp.task('default',()=>{
  console.log('hallo world')

});

gulp.task('default',['start'],()=>{
  console.log('hallo world')

});

gulp.task('start',  ()=> {
  nodemon({
    script: 'app.js'
   //ext: 'js html'
  , env: { 'NODE_ENV': 'test' }
  })
})
