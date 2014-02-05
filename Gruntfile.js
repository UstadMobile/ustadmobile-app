/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'), // the package file to use
 
        qunit: {
            all: {
                options: {
                    /*urls: ['path/to/testfile.html'],*/
		    urls: ['ustadmobile_tests.html'],
			
                    timeout: 120000
                }
            }
        }
    });
  
  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-qunit');

  // Default task.
  grunt.registerTask('default', ['qunit']);

};
