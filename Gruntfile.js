'use strict';

module.exports = function(grunt) {
    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Define the configuration for all the tasks
    grunt.initConfig({
        paths: {
            app: {
                base: 'app',
                resources: 'app/resources',
                src: 'app/src'
            },
            dist: {
                base: 'dist',
                css: 'dist/resources/css',
                js: 'dist/resources/js'
            }
        },

        pkg: grunt.file.readJSON('package.json'),

        availabletasks: {
            tasks: {
                options: {
                    filter: 'exclude',
                    tasks: ['availabletasks']
                }
            }
        },

        clean: {
            dev: ['<%= paths.app.resources %>/css/main.css', '<%= paths.app.resources %>/css/main.css.map'],
            dist: ['<%= paths.dist.base %>/*', '!<%= paths.dist.base %>/.git']

        },

        copy: {
            dist: {
                files: [
                    {expand: true, dest: '<%= paths.dist.base %>/', src: ['<%= paths.app.src %>/**']},
                    {expand: true, flatten: true, dest: '<%= paths.dist.base %>/resources/images/', src: ['<%= paths.app.resources %>/images/*']}
                ]
            }
        },

        jshint: {
            files: ['<%= paths.app.resources %>/js/**/*.js'],
            options: {
                globals: {
                    jQuery: true
                }
            }
        },

        sass: {
            dist: {
                options: {
                    style: 'expanded',
                    compass: false,
                    loadPath: '<%= paths.app.base %>'
                },
                files: {
                    '<%= paths.dist.css %>/<%= pkg.name %>.css': ['<%= paths.app.resources %>/css/main.scss']
                }
            },
            dev: {
                options: {
                    style: 'expanded',
                    compass: false,
                    loadPath: '<%= paths.app.base %>'
                },
                files: {
                    '<%= paths.app.resources %>/css/main.css': ['<%= paths.app.resources %>/css/main.scss']
                }
            }
        },

        watch: {
            sass: {
                files: ['<%= paths.app.resources %>/css/**/*.scss'],
                tasks: ['clean:dev', 'sass:dev']
            }
        }
    });

    grunt.registerTask('build-dev', [
        'clean',
        'sass:dev',
        'watch:sass'
    ]);

    grunt.registerTask('build', [
        'clean',
        'copy',
        'jshint',
        'sass:dist'
    ]);
};