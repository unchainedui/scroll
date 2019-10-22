'use strict';

module.exports = {
  options: {
    src: './',
    dst: './test'
  },

  'task:default': {
    js: {
      'test.js': 'test.js'
    }
  },

  'belt:js': {
    tools: [ 'src-rollup', 'dst-file' ]
  }
};
