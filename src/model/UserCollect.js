import mongoose from '@/config/DBHelper'
import dayjs from 'dayjs'

const Schema = mongoose.Schema

const UserCollectSchema = new Schema({
  uid: { type: String },
  tid: { type: String },
  title: { type: String }, // 通过冗余title字段设计，避免了当用户查看自己收藏记录时需再去查询帖子标题等情况发生
  created: { type: Date }
})

UserCollectSchema.pre('save', function (next) {
  this.created = dayjs().format('YYYY-MM-DD HH:mm:ss')
  next()
})

UserCollectSchema.post('save', function (err, doc, next) {
  if (err.name === 'MongoError' && err.code === 11000) {
    next(new Error('There was a duplicate key error'))
  } else {
    next(err)
  }
})

// 添加静态方法
UserCollectSchema.statics = {
  // 查询特定用户的收藏数据
  getListByUid: function (id, page, limit) {
    return this.find({ uid: id }).skip(page * limit).limit(limit).sort({ created: -1 }) // 倒序排列
  },
  // 查询总数
  countByUid: function (id) {
    return this.find({ uid: id }).countDocuments()
  }
}

const UserCollectModel = mongoose.model('user_collect', UserCollectSchema)

export default UserCollectModel
