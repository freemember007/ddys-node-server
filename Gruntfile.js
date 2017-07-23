module.exports = function (grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    sass: {
      build: {
        options: {
          noCache: true,
          quiet: true
        },
        files: {
          'public/css/style.css': 'public/scss/style.scss'
        }
      }
    },

    watch: {
      sass: {
        files: ['public/scss/*.scss'],
        tasks: ['sass']
      }
    },

    cssmin: {
      release: {
        files: [
          {expand: true, cwd: 'public/css', src: ['*.css'], dest: 'public/css', ext: '.css'}
        ]
      }
    },

    cacheBust: {
      options: {
        baseDir: 'public/',
        assets: ['*/*.{js,css,png,jpg,gif,ico,eot,svg,ttf,woff}'],
        queryString: true,
        length: 8
      },
      release: {
        files: [{
          src: ['views/*.*', 'public/css/*.*']
        }]
      }
    },
    

    clean: {
      options: {
        'no-write': false
      },
      release: ['public/css']
    }


  });


  grunt.loadNpmTasks('grunt-contrib-sass'); // todo:执行速度貌似比grunt-sass慢
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-cache-bust');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('build', ['sass','watch']);
  grunt.registerTask('release', ['cssmin', 'cacheBust']);

};