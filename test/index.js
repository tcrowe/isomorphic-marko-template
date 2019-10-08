const http = require("http");
const { PORT = 7162, HOST = "127.0.0.1" } = process.env;

const testRequests = [
  { method: "GET", path: "/" },
  { method: "GET", path: "/resources" },
  { method: "GET", path: "/about" }
];

describe("isomorphic-marko-template", function() {
  testRequests
    .map(function(testRequest) {
      testRequest.port = PORT;
      testRequest.host = HOST;
      return testRequest;
    })
    .forEach(function(testRequest) {
      const { method, path } = testRequest;
      it(`${method} ${path}`, function(done) {
        const req = http.request(testRequest, function(res) {
          res.statusCode.should.be.eql(200);
          done();
        });
        req.on("error", done);
        req.on("end", done);
        req.end();
      });
    });
});
