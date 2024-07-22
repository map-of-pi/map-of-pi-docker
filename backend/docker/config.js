// PM2 config file to run the app in production mode.
module.exports = {
  apps: [{
    name: "map-of-pi-backend",
    script: "/usr/src/app/build/index.js",
    exec_mode: "cluster",
    instances: 4,
  }]
}
