/**
 * Movie.js
 *
 * @description :: Movie element composed with title, originalTitle, cover, duration and theaterReleaseDate
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    title: {
      type: 'string',
      required: true
    },
    originalTitle: {
      type: 'string',
      required: true
    },
    cover: {
      type: 'string',
      required: true
    },
    duration: {
      type: 'integer',
      required: true
    },
    theaterReleaseDate: {
      type: 'datetime',
      required: true
    },
    formats: {
      collection: 'format',
      via: 'movies'
    }
  }
};

