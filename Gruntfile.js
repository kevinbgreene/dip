/* global module:false */
module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({

        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        datetime: Date.now(),

        uglify: {

            options: {
                mangle: true,
                beautify: false
            },

            build: {

                files: {

                    'css-loader.min.js': [

                        'css-loader.js'
                    ]
                }
            }
        },

        watch: {

            main: {
                files: ['*.js'],
                tasks: ['build'],
                options: {
                    nospawn: true,
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Default task.
    grunt.registerTask('build', ['uglify:build']);
};