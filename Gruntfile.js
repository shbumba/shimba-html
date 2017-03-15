/*!
 * Gruntfile
 */

module.exports = function (grunt) {
    'use strict';

    // Force use of Unix newlines
    grunt.util.linefeed = '\n';

    RegExp.quote = function (string) {
        return string.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
    };

    var fs = require('fs');
    var path = require('path');
    var generateCommonJSModule = require('./src/grunt/bs-commonjs-generator.js');
    var configBridge = grunt.file.readJSON('./src/grunt/configBridge.json', {encoding: 'utf8'});

    // Project configuration.
    grunt.initConfig({

        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        npmInclude: {
            js: grunt.file.readJSON('src/npm/npm-js.json'),
            css: grunt.file.readJSON('src/npm/npm-css.json'),
            less: grunt.file.readJSON('src/npm/npm-less.json')
        },
        that: {
            name: 'bundle', //pkg.name
            version: '1.0' //pkg.version
        },
        banner: '/*!\n' +
        ' * Skeleton v<%= that.version %> (<%= pkg.homepage %>)\n' +
        ' * Copyright 2014-<%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
        ' * Licensed under the <%= pkg.license %> license\n' +
        ' */\n',
        jqueryCheck: configBridge.config.jqueryCheck.join('\n'),
        jqueryVersionCheck: configBridge.config.jqueryVersionCheck.join('\n'),

        // Task configuration.
        clean: {
            dist: 'dist'
        },

        jshint: {
            options: {
                jshintrc: 'src/js/.jshintrc'
            },
            grunt: {
                options: {
                    jshintrc: 'src/grunt/.jshintrc'
                },
                src: [
                    'Gruntfile.js',
                    'src/grunt/*.js'
                ]
            },
            core: {
                src: 'src/js/*.js'
            },
            assets: {
                src: ['']
            }
        },

        jscs: {
            options: {
                config: 'src/js/.jscsrc'
            },
            grunt: {
                src: '<%= jshint.grunt.src %>'
            },
            core: {
                src: '<%= jshint.core.src %>'
            },
            assets: {
                options: {
                    requireCamelCaseOrUpperCaseIdentifiers: null
                },
                src: '<%= jshint.assets.src %>'
            }
        },

        concat: {
            bundle: {
                options: {
                    banner: '<%= banner %>\n<%= jqueryCheck %>\n<%= jqueryVersionCheck %>',
                    stripBanners: false
                },
                src: '<%= npmInclude.js %>',
                dest: 'dist/js/<%= that.name %>.js'
            },
            npmCss: {
                src: '<%= npmInclude.css %>',
                dest: 'dist/css/<%= that.name %>-vendor-css.css'
            },
            vendor: {
                src: [
                    'dist/css/<%= that.name %>-vendor-css.css',
                    'dist/css/<%= that.name %>-vendor-less.css'
                ],
                dest: 'dist/css/<%= that.name %>-vendor.css'
            }
        },

        uglify: {
            options: {
                compress: {
                    warnings: false
                },
                mangle: true,
                preserveComments: 'some'
            },
            core: {
                src: '<%= concat.bundle.dest %>',
                dest: 'dist/js/<%= that.name %>.min.js'
            }
        },

        less: {
            compileCore: {
                options: {
                    strictMath: true,
                    sourceMap: true,
                    outputSourceFiles: true,
                    sourceMapURL: '<%= that.name %>.css.map',
                    sourceMapFilename: 'dist/css/<%= that.name %>.css.map'
                },
                src: 'src/less/bundle.less',
                dest: 'dist/css/<%= that.name %>.css'
            },
            compileIE: {
                options: {
                    strictMath: true,
                    sourceMap: true,
                    outputSourceFiles: true,
                    sourceMapURL: 'ie_<%= that.name %>.css.map',
                    sourceMapFilename: 'dist/css/ie_<%= that.name %>.css.map'
                },
                src: 'src/less/ie_bundle.less',
                dest: 'dist/css/ie_<%= that.name %>.css'
            },
            compileVendor: {
                options: {
                    strictMath: true,
                    sourceMap: true,
                    outputSourceFiles: true,
                    sourceMapURL: '<%= that.name %>-vendor-less.css.map',
                    sourceMapFilename: 'dist/css/<%= that.name %>-vendor-less.css.map'
                },
                src: '<%= npmInclude.less %>',
                dest: 'dist/css/<%= that.name %>-vendor-less.css'
            }
        },

        autoprefixer: {
            options: {
                browsers: configBridge.config.autoprefixerBrowsers
            },
            core: {
                options: {
                    map: true
                },
                src: 'dist/css/<%= that.name %>.css'
            },
            ie: {
                options: {
                    map: true
                },
                src: 'dist/css/ie_<%= that.name %>.css'
            }
        },

        csslint: {
            options: {
                csslintrc: 'src/less/.csslintrc'
            },
            dist: [
                'dist/css/bundle.css',
                'dist/css/ie_bundle.css',
                'dist/css/bundle-vendor.css'
            ]
        },

        cssmin: {
            options: {
                // TODO: disable `zeroUnits` optimization once clean-css 3.2 is released
                compatibility: 'ie8',
                keepSpecialComments: '*',
                sourceMap: true,
                advanced: false
            },
            minifyCore: {
                src: 'dist/css/<%= that.name %>.css',
                dest: 'dist/css/<%= that.name %>.min.css'
            },
            minifyIE: {
                src: 'dist/css/ie_<%= that.name %>.css',
                dest: 'dist/css/ie_<%= that.name %>.min.css'
            },
            vendorCss: {
                src: [
                    'dist/css/<%= that.name %>-vendor.css'
                ],
                dest: 'dist/css/<%= that.name %>-vendor.min.css'
            }
        },

        csscomb: {
            options: {
                config: 'src/less/.csscomb.json'
            },
            dist: {
                expand: true,
                cwd: 'dist/css/',
                src: [
                    '*.css',
                    '!*.min.css'
                ],
                dest: 'dist/css/'
            }
        },

        copy: {
            fonts: {
                expand: true,
                cwd: 'src/',
                src: 'fonts/**/*',
                dest: 'dist/'
            },
            npm: {
                expand: true,
                cwd: 'src/',
                src: 'npm/**/*',
                dest: 'dist/'
            },
            images: {
                expand: true,
                cwd: 'src/',
                src: 'images/**/*',
                dest: 'dist/'
            },
            vendor: {
                expand: true,
                cwd: 'src/',
                src: 'vendor/**/*',
                dest: 'dist/'
            },
            vendorImages: {
                expand: true,
                flatten: true,
                cwd: 'src/',
                src: [
                    'vendor/{,**/*}*.{jpg,jpeg,png,gif}',
                    'js/shimba/{,**/*}*.{jpg,jpeg,png,gif}',
                    '!**/demo/**',
                    '!**/test/**'
                ],
                dest: 'dist/images/vendor/'
            }
        },

        connect: {
            server: {
                options: {
                    port: 3000,
                    base: '.'
                }
            }
        },

        watch: {
            options: {
                livereload: true
            },
            less: {
                files: [
                    'src/npm/npm-css.json',
                    'src/npm/npm-less.json',
                    'src/less/**/*.less'
                ],
                tasks: 'dist-css'
            },
            js: {
                files: [
                    'src/js/**/*.js',
                    'src/vendor/**/*.js',
                    'src/npm/npm-js.json',
                    '!src/js/develop.js'
                ],
                tasks: 'dist-js'
            },
            html: {
                files: '*.html'
            }
        },

        sed: {
            versionNumber: {
                pattern: (function () {
                    var old = grunt.option('oldver');
                    return old ? RegExp.quote(old) : old;
                })(),
                replacement: grunt.option('newver'),
                exclude: [
                    'dist/fonts',
                    'src/fonts',
                    'dist/vendor',
                    'src/vendor',
                    'dist/images',
                    'src/images',
                    'node_modules'
                ],
                recursive: true
            }
        },

        exec: {
            npmUpdate: {
                command: 'npm update'
            }
        },

        compress: {
            main: {
                options: {
                    archive: 'bundle-<%= that.version %>-dist.zip',
                    mode: 'zip',
                    level: 9,
                    pretty: true
                },
                files: [
                    {
                        expand: true,
                        cwd: 'dist/',
                        src: ['**'],
                        dest: 'bundle-<%= that.version %>-dist'
                    }
                ]
            }
        },

        'string-replace': {
            options: {
                replacements: [{
                    pattern:  /:(\s*)(url\(\s*[\"\']*)(?:[^\"\']+\/)?([^\/\"\'\)]+[\"\']*\s*\))/ig,
                    replacement: ': $2../images/vendor/$3'
                }]
            },
            vendor: {
                src: [
                    'dist/css/<%= that.name %>-vendor.css'
                ],
                dest: 'dist/css/<%= that.name %>-vendor.css'
            },
            vendorMin: {
                src: [
                    'dist/css/<%= that.name %>-vendor.min.css'
                ],
                dest: 'dist/css/<%= that.name %>-vendor.min.css'
            }
        }
    });

    // These plugins provide necessary tasks.
    require('load-grunt-tasks')(grunt, {scope: 'devDependencies'});
    require('time-grunt')(grunt);

    grunt.loadNpmTasks('grunt-string-replace');

    // JS distribution task.
    grunt.registerTask('dist-js', [
        'concat:bundle',
        'uglify:core',
        'commonjs'
    ]);

    // CSS distribution task.
    grunt.registerTask('less-compile', [
        'less:compileCore',
        'less:compileIE',
        'less:compileVendor'
    ]);
    grunt.registerTask('dist-css', [
        'less-compile',
        'autoprefixer:core',
        'autoprefixer:ie',
        'csscomb:dist',
        'concat:npmCss',
        'concat:vendor',
        'string-replace:vendor',
        'cssmin:minifyCore',
        'cssmin:minifyIE',
        'cssmin:vendorCss'
    ]);

    // Full distribution task.
    grunt.registerTask('dist', [
        'clean:dist',
        'dist-css',
        'copy:fonts',
        'copy:npm',
        'copy:images',
        'copy:vendor',
        'copy:vendorImages',
        'dist-js'
    ]);

    // Clear task.
    grunt.registerTask('clear', [
        'clean:dist',
        'copy:fonts',
        'copy:npm',
        'copy:images',
        'copy:vendor'
    ]);

    // Default task.
    grunt.registerTask('default', ['dist']);

    // Version numbering task.
    // grunt change-version-number --oldver=A.B.C --newver=X.Y.Z
    // This can be overzealous, so its changes should always be manually reviewed!
    grunt.registerTask('change-version-number', 'sed');

    grunt.registerTask('commonjs', 'Generate CommonJS entrypoint module in dist dir.', function () {
        var srcFiles = grunt.config.get('concat.bundle.src');
        var destFilepath = 'dist/npm/npm-js.json';
        generateCommonJSModule(grunt, srcFiles, destFilepath);
    });

    grunt.registerTask('prep-release', ['dist', 'compress']);
};
