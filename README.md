# Homebrew Monitor - Rest

Rest API microservice for Homebrew Monitor

### Development

This service is developed primarily with TDD, using Mocha tests and Nock to simulate interactions with other services. This can be done using Docker or by running locally with node.

Build and run the docker test image
```bash
$ npm run docker-build-test;
$ npm run docker-run-test;
```

The service runs alongside various other services. The deployment information and interaction between services is a part of [the parent repo](https://github.com/cgpuglie/homebrew-monitor).

For development of dependencies like homebrew-monitor-common, you can mount dependencies into volumes as follows:

```bash
docker run \
  -it --rm \
  -v /home/cpuglies/projects/homebrew-monitor-common/:/usr/src/homebrew-monitor-rest/node_modules/homebrew-monitor-common/ \
  homebrew-monitor-rest-test
```

### Routes

Currently implements a stubbed 'temperature' api. Interacts properly with Auth microservice. There is much more to come here!
- This interaction is simulated in tests with the library *Nock*

### Config

This service can be configured fully through the *config.yml* file in the project root, or through environment variables.  
*Environment variables take precedence over values set in config*

Below is a list of configuration options.

| config.yml    | env variable      | default     |
|---            |---                |---          |
|name           |                   |'service'    |
|serviceEnv     |NODE_ENV           |'Production' |
|serviceColor   |SERVICE_COLOR      |false        |
|serviceBindIp  |SERVICE_BIND_IP    |'0.0.0.0'    |
|servicePort    |SERVICE_PORT       |8082         |
|serviceRoot    |SERVICE_ROOT       |`/${name}`   |
|authServiceRoot|AUTH_SERVICE_ROOT  |'/auth'      |
|authServiceHost|AUTH_SERVICE_HOST  |`${serviceBindIp}`|
|authServicePort|AUTH_SERVICE_PORT  |`${servicePort}`|