import { getValue } from '@/config/RedisConfig'
import config from '@/config/index'
import jwt from 'jsonwebtoken'

// 校验验证码
const checkCode = async (key, value) => {
  const redisData = await getValue(key)

  if (!redisData) return false

  // 传递的验证码可能是大写或小写
  if (redisData.toLowerCase() === value.toLowerCase()) {
    return true
  } else {
    return false
  }
}

const getJWTPayload = token => {
  // 先查看token是否正常
  return jwt.verify(token.split(' ')[1], config.JWT_SECRET)
}

export { checkCode, getJWTPayload }
