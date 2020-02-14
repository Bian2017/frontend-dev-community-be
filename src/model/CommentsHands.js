import mongoose from '@/config/DBHelper'
import dayjs from 'dayjs'

const Schema = mongoose.Schema

const CommentsHandsSchema = new Schema({
  tid: { type: String, ref: 'post' },
  cuid: { type: String, ref: 'user' },
  content: { type: String },
  created: { type: Date },
  hands: { type: Number, default: 0 },
  status: { type: String, default: '1' },
  isRead: { type: String, default: '0' },
  isBest: { type: String, default: '0' }
})

CommentsHandsSchema.pre('save', function (next) {
  this.created = dayjs().format('YYYY-MM-DD HH:mm:ss')
  next()
})

CommentsHandsSchema.post('save', function (error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('There was a duplicate key error'))
  } else {
    next(error)
  }
})

CommentsHandsSchema.statics = {
  findByTid: function (id) {
    return this.find({ tid: id })
  }
}

const CommentsHands = mongoose.model('comments_hands', CommentsHandsSchema)

export default CommentsHands
