import Comments from '@/model/Comments'
// import Post from '@/model/Post'
// import User from '@/model/User'
import { checkCode, getJWTPayload } from '@/common/Utils'

class CommentsController {
  async getComments (ctx) {
    const { tid, page = 0, limit = 10 } = ctx.query

    const result = await Comments.getCommentsList(tid, page, limit)
    const total = await Comments.queryCount(tid)

    ctx.body = {
      code: 200,
      data: result,
      total,
      msg: '查询成功'
    }
  }

  async addComment (ctx) {
    const { body } = ctx.request

    const { sid, code } = body

    // 验证图片验证码的时效性、正确性
    const result = await checkCode(sid, code)

    if (!result) {
      ctx.body = {
        code: 500,
        msg: '图片验证码不正确，请检查'
      }
      return
    }

    const newComment = new Comments(body)
    const obj = await getJWTPayload(ctx.header.authorization)

    newComment.cuid = obj._id
    const comment = await newComment.save()

    ctx.body = {
      code: 200,
      data: comment,
      msg: '评论成功'
    }
  }
}

export default new CommentsController()
