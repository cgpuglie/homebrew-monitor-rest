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
	serviceEnv='Test',
	serviceColor=false,
	serviceBindIp='0.0.0.0',
	servicePort=8082,
	serviceRoot=`/${name}`,
	serviceSecret='J50NW3bT0k3n',
	tokenLifetimeH=1,
	morgan: {
		format
	}
} = yaml.safeLoad(fs.readFileSync(path.join(__dirname, 'config.yml')))

// load ENV
const {
	SERVICE_ENV:environment=serviceEnv,
	SERVICE_BIND_IP:ip=serviceBindIp,
	SERVICE_PORT:port=servicePort,
	SERVICE_ROOT:root=serviceRoot,
	SERVICE_COLOR:color=serviceColor,
	
	SERVICE_SECRET:secret=serviceSecret,
	TOKEN_LIFETIME_H:lifetime=tokenLifetimeH,
	
	BREW_MASTER:master='admin',
	BREW_MASTER_PASS:pass='password'
} = process.env

// Do we log?
const silent = (environment === 'Test')

// TODO: move this to module
const { middleware, errorHandler } = require('homebrew-monitor-common')({name,color,environment})
const base = express()
const app = express()

// use body parser
app.use(jsonParser())

// use morgan unless testing
silent || app.use(morgan(`${ !color ? name : chalk[color](name)} > ${format}`))

// use common middlewares
app.use(middleware)
// register error handler
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
	config: { name, format, ip, port, root, color, master, pass, secret, lifetime }
}

