import fs from 'fs';

module.exports = (router) =>
  fs.readdirSync(__dirname)
    .filter(file => file !== 'index.js')
    .map(file => require('./' + file)(router.authCheck))
    .forEach(routes => {
      Object.keys(routes).forEach(path => {
        const route = routes[path];
        Object.keys(route).forEach(method => {
          let handler = route[method];

          if (Array.isArray(handler)) {
            handler.unshift(path);
          } else {
            handler = [path, handler];
          }

          router[method].apply(router, handler);
        });
      });
    });