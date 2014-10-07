module.exports = function (grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Configurable paths for the application
    var appConfig = {
        dist: './dist',
        banner: '/*!\n<%= pkg.name %> - <%= pkg.version %>\n' +
                '<%= pkg.description %>\n' +
                'Build date: <%= grunt.template.today("yyyy-mm-dd") %> \n*/\n'
    };

    grunt.util.linefeed = '\n';

    grunt.initConfig({
        yeoman: appConfig,
        jshint: {
            options: {},
            all: [
                'Gruntfile.js',
                'angular-sortable.js'
            ]
        },
        protractor: {
            e2e: {
                options: {
                    configFile: 'test/e2e/protractor.conf.js',
                    keepAlive: true
                }
            },
            debug: {
                options: {
                    configFile: 'test/e2e/protractor.conf.js',
                    keepAlive: true,
                    debug: true
                }
            }
        },
        clean: {
            dist: 'dist'
        },
        copy: {
            build: {
                src: ['angular-sortable.js'],
                dest: 'dist/js/'
            },
            example: {
                src: [
                    'angular-sortable.js',
                    'angular-sortable.css'
                ],
                dest: 'example/'
            }
        },
        cssmin: {
            dist: {
//                options: {
//                    banner: '<%= yeoman.banner %>'
//                },
                files: [{
                        src: ['angular-sortable.css'],
                        dest: 'dist/css/angular-sortable.css'
                    }]
            }
        },
        uglify: {
//            options: {
//                banner: '<%= yeoman.banner %>'
//            },
            dist: {
                src: ['dist/js/angular-sortable.js'],
                dest: 'dist/js/angular-sortable.min.js'
            }
        },
        connect: {
            options: {
                port: 8000,
                base: './example'
            },
            server: {},
            build: {}
        }
    });

    grunt.registerTask('tests', [
        'copy:example',
        'connect:server',
        'protractor:e2e'
    ]);

    grunt.registerTask('build', [
        'jshint',
        'clean',
        'copy',
        'cssmin',
        'uglify'
    ]);

    grunt.registerTask('server', [
        'copy:example',
        'connect:server:keepalive'
    ]);
};
