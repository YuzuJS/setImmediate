module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        browserify: {
            dist: {
                files: {
                    'dist/'<%= pkg.name %>'.js': ["lib/index.js"],
                },
                options: {
                    standalone: '<%= pkg.name %>'
                }
            }
        },
        uglify: {
            options: {
                report: 'gzip',
                mangle: true
            },
            all: {
                src: "dist/<%= pkg.name %>.js",
                dest: 'dist/<%= pkg.name %>.min.js'
            }
        }
    });
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.registerTask('default', ['browserify', 'uglify']);
}