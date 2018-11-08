const path = require('path')
const fs   = require('fs')

const config = {
  mysql: {
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS
  },
  telegram: {
    username: process.env.BOT_NAME,
    token: process.env.BOT_TOKEN
  }
}

const envConfFile = path.resolve(__dirname, `config.${process.env.NODE_ENV}.js`)

if (process.env.NODE_ENV && fs.existsSync(envConfFile)) {
  Object.assign(config, require(envConfFile))
}

module.exports = config
