(function () {
    'use strict';
    module.exports = function (grunt) {
        require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
        grunt.initConfig({
            mochaTest: {
                test: {
                    options: {
                        reporter: 'spec'
                    },
                    src: [
                        'tests/**/*.js'
                    ]
                }
            }
        });
        grunt.registerTask('test', ['mochaTest:test']);
    };
}());
