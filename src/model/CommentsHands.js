import mongoose from '@/config/DBHelper'
import dayjs from 'dayjs'

const Schema = mongoose.Schema

const CommentsHandsSchema = new Schema({
  cid: { type: String },
  uid: { type: String },
  created: { type: Date }
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
  findByCid: function (id) {
    return this.find({ cid: id })
  }
}

const CommentsHands = mongoose.model('comments_hands', CommentsHandsSchema)

export default CommentsHands
