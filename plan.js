'use strict';

const js = {
  'test.js': 'test.js'
};

module.exports = {
  options: {
    src: './',
    dst: './test'
  },

  'default': {
    js: js
  },

  'belt:js': {
    tools: [ 'src-rollup', 'dst-file' ]
  }
};
