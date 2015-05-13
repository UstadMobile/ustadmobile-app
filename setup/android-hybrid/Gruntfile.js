/*

UstadMobile grunt file for Android-Hybrid build.  Concatenates files required
for this platform into one.


Ustad Mobile is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version with the following additional terms:
 
All names, links, and logos of Ustad Mobile and Toughra Technologies FZ
LLC must be kept as they are in the original distribution.  If any new
screens are added you must include the Ustad Mobile logo as it has been
used in the original distribution.  You may not create any new
functionality whose purpose is to diminish or remove the Ustad Mobile
Logo.  You must leave the Ustad Mobile logo as the logo for the
application to be used with any launcher (e.g. the mobile app launcher).
 
If you want a commercial license to remove the above restriction you must
contact us and purchase a license without these restrictions.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
 
Ustad Mobile is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

 */
module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                seperator : ";",
                sourceMap: true
            },
            dist_android : {
                src: [
                    'js/ustadmobile.js',
                    'js/ustadmobile-controllers.js',
                    'js/ustadmobile-views.js',
                    'js/ustadmobile-models.js',
                    'js/ustadmobile-appzone.js',
                    'lib/ustadjs/ustadjs.js',
                    'lib/tincan.js',
                    'lib/tincan_queue.js',
                    'js/ustadmobile-getpackages.js',
                    'js/ustadmobile-localization.js',
                    'js/ustadmobile-appimpl-cordova.js',
                    'js/ustadmobile-views-cordova.js'
                ],
                dest: 'setup/android-hybrid/ustadmobileandroid/assets/www/ustadmobile-platform.js'
            }
        }
    });
    
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    
    grunt.registerTask("default", ["concat"]);
};
