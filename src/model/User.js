import mongoose from '@/config/DBHelper'
import dayjs from 'dayjs'

/**
 * 在Mongoose中，使用Schema(模板)和Model(模型)来定义MongoDB中的collection(集合)。
 *
 * Model: 创建和链接MongoDB中collection；
 * Schema: 定义collection的数据结构；
 */
const Schema = mongoose.Schema

const UserSchema = new Schema({
  username: {
    type: String,
    index: {
      // 创建唯一的索引。它是唯一的键值，可以区别开来重复类型的数据。
      unique: true
    },
    /**
     * sparse作用
     * 如果没有username属性，检索的时候就不进行检索这条数据。
     * 必须要有username属性的数据才可以被检索
     */
    sparse: true
  },
  password: { type: String },
  name: { type: String },
  created: { type: Date },
  updated: { type: Date },
  favs: { type: Number, default: 100 },
  gender: { type: String, default: '' },
  // roles为数组，因为用户可能既是普通用户，又是管理员
  roles: { type: Array, default: ['user'] },
  pic: { type: String, default: '/img/avatar.jpg' }, // 添加默认头像
  // 针对手机号，添加简单的正则表达式
  mobile: { type: String, match: /^1[3-9](\d{9})$/, default: '' },
  status: { type: String, default: '0' },
  regmark: { type: String, default: '' },
  location: { type: String, default: '' },
  isVip: { type: String, default: '0' },
  count: { type: Number, default: 0 }
})

// Pre中间件：每次保存的时候触发事件
UserSchema.pre('save', function (next) {
  this.created = dayjs().format('YYYY-MM-DD HH:mm:ss')
  next()
})

// Pre中间件：每次更新的时候触发事件
UserSchema.pre('update', function (next) {
  this.updated = dayjs().format('YYYY-MM-DD HH:mm:ss')
  next()
})

// Post中间件执行顺序要滞后于Pre中间件
UserSchema.post('save', function (error, doc, next) { // 参数doc表示文档
  /**
   * 当我们往数据库重复地存储同一个邮箱时，就抛出这样的异常，
   * 否则将error传递下去。从数据库层面，杜绝数据的重复。
   */
  if (error.name === 'MongoError' && error.code === 11000) { // 11000为官方code
    // 创建一个Error
    next(new Error('Error: Mongoose has a duplicate key.'))
  } else {
    next(error)
  }
})

UserSchema.statics = {
  findByID: function (id) {
    return this.findOne({ _id: id }, {
      // 不显示用户的敏感信息(密码、邮箱、手机号)
      password: 0,
      username: 0,
      mobile: 0
    })
  }
}

// 链接数据库的collection， users表示collection的名称，UserSchema表示collection的数据结构
const UserModel = mongoose.model('users', UserSchema)

export default UserModel
