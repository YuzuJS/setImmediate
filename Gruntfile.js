module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        component: {
            build: {
                options: {
                    args: {
                        out: 'dist',
                        name: '<%= pkg.name %>',
                        standalone: '<%= pkg.name %>'
                    }
                }
            }
        },
        uglify: {
            options: {
                report: 'gzip',
                mangle: true
            },
            all: {
                src: "dist/immediate.js",
                dest: 'dist/min.js'
            }
        }
    });
    grunt.loadNpmTasks('grunt-component');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.registerTask('default', ['component', 'uglify']);
}