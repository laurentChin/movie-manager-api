'use strict';

var should = require('chai').should();

describe('MovieModel', () => {
  describe('#create()', () => {
    it('should check create function', done => {
      Movie.should.have.property('create');
      Movie
        .create({
          title: 'Will Hunting',
          originalTitle: 'Good Will Hunting',
          theaterReleaseDate: new Date('01 January 1997 00:00 UTC'),
          duration: 126
        })
        .then(result => {
          result.should.have.property('id');
          result.should.have.property('createdAt');
          result.should.have.property('updatedAt');
          result.title.should.equal('Will Hunting');
          result.originalTitle.should.equal('Good Will Hunting');
          result.duration.should.equal(126);
          result.theaterReleaseDate.toISOString().should.equal('1997-01-01T00:00:00.000Z');
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
});