const MONGODB_USER = process.env.MONGODB_USER || "root"
const MONGODB_PASS = process.env.MONGODB_PASS || "h4DiTX9b3"
const MONGODB_SERVER = process.env.MONGODB_SERVER || "mongodb.andre-amorim.com:27017/admin"

module.exports = {
  'secret': 'hex',
  'database': `mongodb://${MONGODB_USER}:${MONGODB_PASS}@${MONGODB_SERVER}`
}