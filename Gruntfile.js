module.exports = function(grunt) {
    grunt.util.linefeed = '\n';

    var banner = '/*!\n<%= pkg.name %> - <%= pkg.version %>\n' +
                '<%= pkg.description %>\n'+
                'Build date: <%= grunt.template.today("yyyy-mm-dd") %> \n*/\n';
        
    //init configuration
    grunt.config.init({
        pkg: grunt.file.readJSON('package.json')
    });

    //clean
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.config('clean', {
        dist: 'dist'
    });

    //js hint
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.config('jshint', {
        options: { },
        all: [
            'Gruntfile.js',
            'angular-sortable.js'
        ]
    });
    
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.config('copy', {
        starter:  {
            src: ['angular-sortable.js'],
            dest: 'dist/js/'
        }
    });

    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.config('cssmin', {
        css: {
            options: {
                banner: banner
            },
            files: [{
                src: ['angular-sortable.css'],
                dest: 'dist/css/angular-sortable.css'
            }]
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.config('uglify', {
        options: {
            banner: banner
        },
        dist: {
            src: ['dist/js/angular-sortable.js'],
            dest: 'dist/js/angular-sortable.min.js'
        }
    });

    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.config('connect', {
        server: {
            options: {
                port: 8000,
                base: '.'
            }
        }
    });

    grunt.registerTask('build', [
        'jshint',
        'clean',
        'copy',
        'cssmin',
        'uglify'
    ]);

    grunt.registerTask('server', [
        'connect:server:keepalive'
    ]);
};
