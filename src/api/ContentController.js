import Post from '@/model/Post'
import Links from '@/model/Links'

class ContentController {
  // 查询发帖列表
  async getPostList (ctx) {
    const { query } = ctx

    const sort = query.sort ? query.sort : 'created'
    const page = query.page ? parseInt(query.page) : 0
    const limit = query.limit ? parseInt(query.limit) : 20

    const options = {}

    if (typeof query.catalog !== 'undefined' && query.catalog !== '') {
      options.catalog = query.catalog
    }

    if (typeof query.isTop !== 'undefined') {
      options.isTop = query.isTop
    }

    if (typeof query.status !== 'undefined' && query.status !== '') {
      options.status = query.status
    }

    if (typeof query.tag !== 'undefined' && query.tag !== '') {
      // 如果需要进行嵌套查询某个对象数组中这个对象的属性，可以使用$elemMatch
      options.tags = { $elemMatch: { name: query.tag } }
    }

    const result = await Post.getList(options, sort, page, limit)

    ctx.body = {
      code: 200,
      data: result,
      msg: '成功获取帖子列表'
    }
  }

  // 查询友链
  async getLinks (ctx) {
    const result = await Links.find({ type: 'links' })

    ctx.body = {
      code: 200,
      data: result
    }
  }

  // 查询温馨提醒
  async getTips (ctx) {
    const result = await Links.find({ type: 'tips' })

    ctx.body = {
      code: 200,
      data: result
    }
  }

  // 本周热议
  async getTopWeek (ctx) {
    const result = await Post.getTopWeek()

    ctx.body = {
      code: 200,
      data: result
    }
  }
}

export default new ContentController()
