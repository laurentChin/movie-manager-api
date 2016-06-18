'use strict';

var should = require('chai').should();
let movie = {
  title: 'Will Hunting',
  originalTitle: 'Good Will Hunting',
  theaterReleaseDate: new Date('01 January 1997 00:00 UTC'),
  duration: 126,
  cover: 'http://placehold.it/25x25'
};

describe('MovieModel', () => {
  describe('#create()', () => {
    it('should check create function', done => {
      Movie.should.have.property('create');
      Movie
        .create(movie)
        .then(result => {
          result.should.have.property('id');
          result.should.have.property('createdAt');
          result.should.have.property('updatedAt');
          result.title.should.equal('Will Hunting');
          result.slug.should.equal('will-hunting');
          result.originalTitle.should.equal('Good Will Hunting');
          result.duration.should.equal(126);
          result.theaterReleaseDate.toISOString().should.equal('1997-01-01T00:00:00.000Z');
          result.cover.should.equal('http://placehold.it/25x25');
          done();
        })
        .catch(done);
    });
  });

  describe('#find()', () => {
    it('should check find function', done => {
      Movie.find()
        .then(results => done())
        .catch(done);
    });
  });

  describe('#update()', () => {
    it('should check update function', done => {
      Movie.create(movie)
        .then(result => {
          Movie.update(
            result.id,
            {
              originalTitle: 'Not so good Will Hunting'
            }
          ).then(updateResult => {
            updateResult[0].originalTitle.should.equal('Not so good Will Hunting');
            done();
          });
        })
        .catch(done);
    });
  });

  describe('#destroy()', () => {
    it('should check destroy function', done => {
      Movie.create(movie)
        .then(result => {
          Movie
            .destroy(result.id)
            .then(destroyResult => {
              destroyResult[0].title.should.equal(movie.title);
              done();
            });
        })
        .catch(done);
    });
  });
});