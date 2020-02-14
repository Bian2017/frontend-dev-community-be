import { getValue } from '@/config/RedisConfig'
import config from '@/config/index'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'

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

// fs.stat方法用于查询文件信息。stats是一个fs.Stats对象，如果这个对象是个文件系统目录，则isDirectory()返回true
const getStats = path => new Promise(resolve => fs.stat(path, (err, stats) => err ? resolve(false) : resolve(stats))
)

const mkdirDir = dir => new Promise((resolve) => fs.mkdir(dir, err => err ? resolve(false) : resolve(true)))

const dirExists = async dir => {
  const isExists = await getStats(dir)

  // 如果该路径存在且不是文件，则返回true
  if (isExists && isExists.isDirectory()) {
    return true
  } else if (isExists) {
    // 路径存在，但是是文件，返回false
    return false
  }

  // 如果路径不存在，则去创建该路径
  const tempDir = path.parse(dir).dir
  // 循环遍历，递归判断如果上级目录不存在，则产生上级目录
  const status = await dirExists(tempDir)
  if (status) {
    const result = await mkdirDir(dir)
    return result
  } else {
    return false
  }
}

const rename = (obj, key, newKey) => {
  if (Object.keys(obj).indexOf(key) !== -1) {
    obj[newKey] = obj[key]
    delete obj[key]
  }

  return obj
}

export { checkCode, getJWTPayload, dirExists, rename }
