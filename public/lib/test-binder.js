describe("dumb test", function() {
  it("true is true", function(done) {
    Telemetry.init(function() {
      expect(true).to.equal(true);
      done();
    });
  });
});