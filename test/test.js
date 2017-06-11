const should = require('should')
const rp = require('request-promise')
const nock = require('nock')
// set the environment to 'Test' to silence logs
process.env['NODE_ENV'] = 'Test'

// start app server
const { service, config: {port, root, authEndpoint} } = require('../index')
const base = `http://localhost:${port}${root}`
const mockOptions = { allowUnmocked: true }

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

describe('Authentication', function describeAuth() {
  it('should permit requests with a valid jwt', function validToken () {
    // mock the api of the auth microservice
    nock(authEndpoint, mockOptions)
      .post('/decode')
      .reply(200, {
        username: "AUser"
      })

    console.log(`${base}/temperature`)
    return rp({
      uri: `${base}/temperature`,
      headers: {
        auth: 'Bearer PretendRealToken'
      },
      resolveWithFullResponse: true
    })
    .then(res => res.statusCode)
    .catch(res => res.statusCode)
    .should.eventually.be.below(300)
  })

  it('should reject requests with an invalid jwt', function validToken () {
    // mock the api of the auth microservice
    nock(authEndpoint, mockOptions)
      .post(`/decode`)
      .reply(401, {
        message: 'Invalid credentials'
      })

    return rp({
      uri: `${base}/temperature`,
      headers: {
        auth: 'Bearer PretendBadToken'
      },
      resolveWithFullResponse: true
    })
    .then(res => res.statusCode)
    .catch(res => res.statusCode)
    .should.eventually.equal(401)
  })
})

describe('Server router', function server() {
  it('should respond with 404 errors if authenticated', function notFound() {
    // mock the api of the auth microservice
    nock(authEndpoint, mockOptions)
      .post(`/decode`)
      .reply(200, {
        username: "AUser"
      })

    return rp({
      uri: `${base}/notARealApi`,
      headers: {
        auth: 'Bearer PretendRealToken'
      },
      resolveWithFullResponse: true
    })
    .then(res => res.statusCode)
    .catch(res => res.statusCode)
    .should.eventually.equal(404)
  })
})