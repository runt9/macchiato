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
            dev: ['<%= paths.app.resources %>/<%= pkg.name %>.css', '<%= paths.app.resources %>/<%= pkg.name %>.js'],
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
            dev: ['<%= paths.app.src %>/**/*.js', '<%= paths.app.resources %>/<%= pkg.name %>.js'],
            dist: ['<%= paths.dist.base %>/**/*.js'],
            options: {
                jshintrc: '.jshintrc',
                globals: {
                    jQuery: true,
                    node: true
                }
            }
        },

        concat: {
            dev: {
                files: {
                    '<%= paths.app.resources %>/<%= pkg.name %>.css': ['<%= paths.app.resources %>/css/**/*.css'],
                    '<%= paths.app.resources %>/<%= pkg.name %>.js': ['<%= paths.app.resources %>/js/**/*.js']
                }
            },

            dist: {
                files: {
                    '<%= paths.dist.css %>/<%= pkg.name %>.css': ['<%= paths.app.resources %>/css/**/*.css'],
                    '<%= paths.dist.js %>/<%= pkg.name %>.js': ['<%= paths.app.resources %>/js/**/*.js']
                }
            }
        },

        watch: {
            files: ['<%= paths.app.resources %>/css/**/*.css', '<%= paths.app.resources %>/js/**/*.js'],
            tasks: ['clean:dev', 'concat:dev']
        }
    });

    grunt.registerTask('build-dev', [
        'clean:dev',
        'concat:dev',
        'jshint:dev',
        'watch'
    ]);

    grunt.registerTask('build', [
        'clean',
        'concat:dist',
        'jshint:dist',
        'copy'
    ]);
};