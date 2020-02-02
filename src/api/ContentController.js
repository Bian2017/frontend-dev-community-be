import Post from '@/model/Post'

class ContentController {
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

    if (typeof query.status !== 'undefined') {
      options.status = query.status
    }

    if (typeof query.isEnd !== 'undefined') {
      options.isEnd = query.isEnd
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
}

export default new ContentController()
