import mongoose from '@/config/DBHelper'
import dayjs from 'dayjs'

const Schema = mongoose.Schema

const PostSchema = new Schema({
  // 多表联合查询：通过ref属性，接上collections的名称users，即可取出users里的数据
  uid: { type: String, ref: 'users' },
  title: { type: String },
  content: { type: String },
  created: { type: Date },
  catalog: { type: String },
  fav: { type: String },
  isEnd: { type: String },
  reads: { type: Number },
  answer: { type: Number },
  status: { type: String },
  isTop: { type: String },
  sort: { type: String },
  tags: { type: Array }
})

// Pre中间件：每次save触发事件
PostSchema.pre('save', function (next) {
  // 每次保存一条数据的时候，取当前的时间
  this.created = dayjs().format('YYYY-MM-DD HH:mm:ss')
  next()
})

// 添加静态方法
PostSchema.statics = {
  /**
   * 获取发帖列表数据
   * @param {Object} options  筛选条件
   * @param {String} sort 排序方式
   * @param {Number} page 分页页数
   * @param {Number} limit 分页条数
   */
  getList: function (options, sort, page, limit) {
    return this.find(options)
      .sort({ [sort]: -1 }) // -1：代表倒序排列
      .skip(page * limit) // 跳过多少页
      .limit(limit) // 取多少条数据
      // populate方法: 1)与要查询的reference表做个对应; 2) 排除敏感类型的数据
      .populate({
        path: 'uid', // 要替换的字段是uid
        /**
         * 联合查询的时候，有些字段是需要的，有些字段是不需要的。
         * 可以通过select筛选出我们需要的字段，去隐藏敏感字段。
         */
        select: 'name'
      })
  }
}

// 链接数据库的collection， users表示collection的名称，PostSchema表示collection的数据结构
const PostModel = mongoose.model('post', PostSchema)

export default PostModel
