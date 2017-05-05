const should = require('should')
const rp = require('request-promise')
// set the environment to 'Test' to silence logs
process.env['NODE_ENV'] = 'Test'

// start app server
const { service, config: {port, root, secret, master: username, pass: password} } = require('../index')
const base = `http://localhost:${port}${root}`

// state object enclosing properties to override test closures
let state = {}
// set property, can be passed to promise.then
const setProp = (name) =>
  (input) => {
    state[name] = input
    return input
  }
// function wrapper to delay evaluation
const getProp = (name) => state[name]

describe('Server', function server() {
  it('should start', function startServer() {    
    service
    .should.eventually.not.equal(undefined)
  })

  it('should respond with 404 errors', function notFound() {
    return rp({
      uri: `${base}/notARealApi`,
      resolveWithFullResponse: true
    })
    .then(res => res.statusCode)
    .catch(res => res.statusCode)
    .should.eventually.equal(404)
  })
})

describe('Health', function describeHealth() {
  // test status code
  it('should return a 200 status code', function healthStatusCode () {
    return rp({
      uri: `${base}/health`,
      resolveWithFullResponse: true
    })
    .then(res => res.statusCode)
    .catch(res => res.statusCode)
    .should.eventually.equal(200)
    
  })
})