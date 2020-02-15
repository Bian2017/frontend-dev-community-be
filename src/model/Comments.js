import mongoose from '@/config/DBHelper'
import dayjs from 'dayjs'

const Schema = mongoose.Schema

const CommentsSchema = new Schema({
  tid: { type: String, ref: 'post' },
  cuid: { type: String, ref: 'users' },
  content: { type: String },
  created: { type: Date },
  hands: { type: Number, default: 0 }, // 除了递增的需要使用Number类型，其他状态量都使用String类型
  status: { type: String, default: '1' },
  isRead: { type: String, default: '0' },
  isBest: { type: String, default: '0' }
})

CommentsSchema.pre('save', function (next) {
  this.created = dayjs().format('YYYY-MM-DD HH:mm:ss')
  next()
})

CommentsSchema.post('save', function (error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('There was a duplicate key error'))
  } else {
    next(error)
  }
})

CommentsSchema.statics = {
  findByTid: function (id) { // 通过帖子去查评论，此时会有多条评论
    return this.find({ tid: id })
  },
  findByCid: function (id) { // 根据评论ID查证评论，只会有一条数据
    return this.findOne({ _id: id })
  },
  getCommentsList: function (id, page, limit) {
    // 一条帖子下有多条评论，故使用find，不使用findOne
    return this.find({ tid: id }).populate({
      path: 'cuid', // 用户的ID
      select: '_id name pic isVip status',
      match: { status: { $eq: '0' } } // 将未被禁用的用户返回回来
    }).populate({
      path: 'tid', // 文章的id
      select: '_id title status' // status表示打开或者关闭回复
    }).skip(page * limit).limit(limit)
  },
  queryCount: function (id) {
    return this.find({ tid: id }).countDocuments() // 获取total值
  }
}

const Comments = mongoose.model('comments', CommentsSchema)

export default Comments
