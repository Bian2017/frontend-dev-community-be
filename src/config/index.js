import path from 'path'

/**
 * Li: testdb数据库的账号
 * 123456: testdb数据库的密码
 */
const DB_URL = 'mongodb://Li:123456@dev.toimc.com:42017/testdb'

const REDIS = {
  host: 'dev.toimc.com',
  port: '42039',
  password: '123456'
}

const JWT_SECRET = 'ylhsbygeyldbjavfeaeoi93ilw3n21245h56'

const baseUrl = process.env.NODE_ENV === 'production' ? 'http://www.shimu.xyz' : 'http://localhost:8080'

const uploadPath = process.env.NODE_ENV === 'production' ? '/app/public'
  : path.join(path.resolve(__dirname) /* 绝对路径 */, '../../public')

export default {
  DB_URL,
  REDIS,
  JWT_SECRET,
  baseUrl,
  uploadPath
}
