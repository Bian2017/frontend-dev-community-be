import mongoose from '@/config/DBHelper'
import dayjs from 'dayjs'

const Schema = mongoose.Schema

const LinksSchema = new Schema({
  title: { type: String, default: '' },
  link: { type: String, default: '' },
  // 通过type字段，将温馨通道和友情提醒用一张表进行存储
  type: { type: String, default: 'links' },
  created: { type: Date },
  isTop: { type: String, default: '' },
  sort: { type: String, default: '' }
})

LinksSchema.pre('save', function (next) {
  this.created = dayjs().format('YYYY-MM-DD HH:mm:ss')
  next()
})

const Links = mongoose.model('links', LinksSchema)

export default Links
