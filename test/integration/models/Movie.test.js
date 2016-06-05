describe('MovieModel', () => {
  describe('#find()', () => {
    it('should check find function', done => {
      Movie.find()
        .then(results => done())
        .catch(done);
    });
  });
});