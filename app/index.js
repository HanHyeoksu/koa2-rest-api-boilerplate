const koaRest = require('koa2-rest-api');
const RedisStore = require('koa-session-redis-store');
const config = require('inheritable-config');
const {sessions, mongo} = config;
const {mongoose} = require('./db');

mongoose.connect(mongo); // async call

const app = koaRest.createApp({
  jwtsecret: config.jwt.secret,
  prefix: '/api',
  cookieSignKeys: ['secret', 'keys'],
  sessions: {
    store: new RedisStore({
      host: sessions.redishost
    }),
    rolling: sessions.resave,
    maxAge: sessions.maxage,
  },
  log4js: config.log4js,
  routes: require('./routes')
});

const server = app.listen(process.env.PORT || 3000);

let shuttingdown = false;
function gracefulShutdown() {
  if (shuttingdown) {
    return;
  }

  shuttingdown = true;

  setTimeout(() => {
    process.exit(1);
  }, 5000);

  mongoose.connection.close()
  .then(() => {
    console.log(`[${Date.now()}] DB closed`);

    server.close(() => {
      console.log(`[${Date.now()}] Server closed`);
      // close others

      process.exit();
    });
  });
}

process.on('SIGTERM',gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

exports = module.exports = server;
exports.shutdownServer = gracefulShutdown;
exports.mongo = mongoose;