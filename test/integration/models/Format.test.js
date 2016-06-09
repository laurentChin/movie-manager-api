'use strict';

let should = require('chai').should();

let format = {
  title: 'Blu-ray',
  icon: 'http://placehold.it/25x25'
};

describe('FormatModel', () => {
  describe('#create()', () => {
    it('should check create function', done => {
      Format.should.have.property('create');
      Format.create(format)
        .then(result => {
          result.title.should.equal(format.title);
          result.icon.should.equal(format.icon);
          done();
        })
        .catch(done);
    });
  });

  describe('#update()', () => {
    it('should check update function', done => {
      Format.should.have.property('create');
      Format.create(format)
        .then(result => {
          Format.update(
            result.id,
            {
              title: 'HD-DVD'
            }
          ).then(updatedResult => {
            updatedResult[0].title.should.equal('HD-DVD');
            updatedResult[0].icon.should.equal(format.icon);
            done();
          });
        })
        .catch(done);
    });
  });

  describe('#destroy()', () => {
    it('should check destroy function', done => {
      Format.create(format)
        .then(result => {
          Format
            .destroy(result.id)
            .then(destroyResult => {
              destroyResult[0].title.should.equal(format.title);
              done();
            });
        })
        .catch(done);
    });
  });
});