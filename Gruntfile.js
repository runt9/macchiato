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
            files: ['<%= paths.app.src %>/**/*.js', '<%= paths.app.resources %>/js/**/*.js'],
            options: {
                globals: {
                    jQuery: true,
                    node: true
                }
            }
        },

        concat: {
            dist: {
                src: ['<%= paths.app.resources %>/css/**/*.css'],
                dest: '<%= paths.dist.css %>/<%= pkg.name %>.css'
            },
            dev: {
                src: ['<%= paths.app.resources %>/css/**/*.css'],
                dest: '<%= paths.app.resources %>/css/<%= pkg.name %>.css'
            }
        },

        watch: {
            css: {
                files: ['<%= paths.app.resources %>/css/**/*.css'],
                tasks: ['clean:dev', 'concat:dev']
            }
        }
    });

    grunt.registerTask('build-dev', [
        'clean',
        'concat:dev',
        'watch:css'
    ]);

    grunt.registerTask('build', [
        'clean',
        'jshint',
        'concat:dist',
        'copy'
    ]);
};