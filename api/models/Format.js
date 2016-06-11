/**
 * Format.js
 *
 * @description :: Format element composed with title and icon
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    title: {
      type: 'string',
      required: true
    },
    icon: {
      type: 'string',
      required: true
    },
    movies: {
      collection: 'movie',
      via: 'formats'
    }
  }
};

