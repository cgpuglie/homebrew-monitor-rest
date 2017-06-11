const express = require('express')
const morgan = require('morgan')
const chalk = require('chalk')
const yaml = require('js-yaml')
const fs = require('fs')
const path = require('path')
const { json: jsonParser } = require('body-parser-json')

// load service config
const {
	name='service',
	serviceEnv='Production',
	serviceColor=false,
	serviceBindIp='0.0.0.0',
	servicePort=8082,
	serviceRoot=`/${name}`,
	
	authServiceRoot='/auth',
	authServiceHost=serviceBindIp,
	authServicePort=servicePort,
	
	morgan: {
		format
	}
} = yaml.safeLoad(fs.readFileSync(path.join(__dirname, 'config.yml')))

// load ENV
const {
	SERVICE_BIND_IP:ip=serviceBindIp,
	SERVICE_PORT:port=servicePort,
	SERVICE_ROOT:root=serviceRoot,
	SERVICE_COLOR:color=serviceColor,

	AUTH_ROUTE:authRoot=authServiceRoot,
	AUTH_HOST:authHost=authServiceHost,
	AUTH_PORT:authPort=authServicePort,

	NODE_ENV:environment=serviceEnv
} = process.env

// Create endpoint for auth service
const authEndpoint = `http://${authHost}:${authPort}${authRoot}`
// Do we log?
const silent = (environment === 'Test')

const { 
	notFoundHandler,
  errorForwardHandler,
  errorHandler,
  authHandler,
  healthHandler 
} = require('homebrew-monitor-common')({name,color,environment, authEndpoint})
const {
	temperature
} = require('./routes')
const base = express()
const app = express()

// use body parser
app.use(jsonParser())

// use morgan unless testing
silent || app.use(morgan(`${ !color ? name : chalk[color](name)} > ${format}`))

app.use('/health', healthHandler)

// register AUTH middleware
app.use(authHandler)

/* -- Begin Authenticated routes */
// register REST routes
app.use('/temperature', temperature)

// use common middlewares for error handling
app.use(notFoundHandler)
app.use(errorForwardHandler)
app.use(errorHandler)

// set base route
base.use(root, app)

// start microservice
module.exports = {
	// export server for use in tests
	service: new Promise(function startServer(resolve) {
    const server = base.listen(port, ip, () => {
      const {address, port} = server.address()

      silent || console.log(`${!color ? name : chalk[color](name) } > listening at http://${address}:${port}${root}`)
      return resolve(server)
    })
  }),
	// export parsed config for use in tests
	config: { name, format, ip, port, root, color, authEndpoint }
}

