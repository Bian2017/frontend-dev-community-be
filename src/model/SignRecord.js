/**
 * 签到记录
 */
import mongoose from '../config/DBHelper'
import dayjs from 'dayjs'

const Schema = mongoose.Schema

const SignRecordSchema = new Schema({
  // 通过ref方法，让uid与uses表做一个对应，相当于是一个子引用
  uid: { type: String, ref: 'users' },
  created: { type: Date },
  favs: { type: Number }
})

SignRecordSchema.pre('save', function (next) {
  this.created = dayjs().format('YYYY-MM-DD HH:mm:ss')
  next()
})

SignRecordSchema.statics = {
  findByUid: function (uid) {
    // 进行倒序排列：created最新的在前面
    return this.findOne({ uid: uid }).sort({ created: -1 })
  }
}

const SignRecord = mongoose.model('sign_record', SignRecordSchema)

export default SignRecord
