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
  isEnd: { type: String, default: '0' }, // 是否结贴
  reads: { type: Number, default: 0 },
  answer: { type: Number, default: 0 },
  status: { type: String, default: '0' }, // 是否打开回复
  isTop: { type: String, default: '0' }, // 是否置顶
  sort: { type: String, default: 100 }, // 随着数值的减小，按照数值的倒序进行排列
  tags: {
    type: Array,
    default: [
    // { name: '', class: '' }
    ]
  }
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
        select: 'name isVip pic'
      })
  },
  /**
   * 获取本周热议
   */
  getTopWeek: function () {
    return this.find({
      // 获取近七天内的数据
      created: {
        $gte: dayjs().subtract(7, 'days')
      }
    }, {
      // 需显示哪些数据，1表示显示
      answer: 1,
      title: 1
    }).sort({
      // 使用answer进行倒序排列
      answer: -1
    }).limit(15) // 一页只需15条
  }
}

// 链接数据库的collection， users表示collection的名称，PostSchema表示collection的数据结构
const PostModel = mongoose.model('post', PostSchema)

export default PostModel
