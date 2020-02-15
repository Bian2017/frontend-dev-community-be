import Comments from '@/model/Comments'
import Post from '@/model/Post'
import User from '@/model/User'
import { checkCode, getJWTPayload } from '@/common/Utils'

// 是否禁言
const canReply = async ctx => {
  let result = false
  const obj = await getJWTPayload(ctx.header.authorization)
  if (typeof obj._id === 'undefined') {
    return result
  } else {
    const user = await User.findById(obj._id)
    if (user.status === '0') {
      result = true
    }
    return result
  }
}

class CommentsController {
  // 获取评论列表
  async getComments (ctx) {
    const { tid, page = 0, limit = 10 } = ctx.query

    const result = await Comments.getCommentsList(tid, parseInt(page), parseInt(limit))
    const total = await Comments.queryCount(tid)

    ctx.body = {
      code: 200,
      data: result,
      total,
      msg: '查询成功'
    }
  }

  // 添加评论
  async addComment (ctx) {
    const check = await canReply(ctx)
    if (!check) {
      ctx.body = {
        code: 500,
        msg: '用户已被禁言'
      }
      return
    }

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

  // 更新评论
  async updateComment (ctx) {
    const check = await canReply(ctx)
    if (!check) {
      ctx.body = {
        code: 500,
        msg: '用户已被禁言'
      }
      return
    }

    const { body } = ctx.request

    const result = await Comments.updateOne({ _id: body.cid }, {
      $set: body
    })

    ctx.body = {
      code: 200,
      msg: '修改成功',
      data: result
    }
  }

  async setBest (ctx) {
    // 对用户权限的判断，即用户ID是否是帖子的作者
    const obj = await getJWTPayload(ctx.header.authorization)
    if (typeof obj === 'undefined' && obj._id !== '') {
      ctx.body = {
        code: '401',
        msg: '用户未登录，或者用户未授权'
      }
      return
    }

    const { query } = ctx
    const post = await Post.findOne({ _id: query.tid })
    if (post.uid === obj._id && post.isEnd === '0') {
      // 说明是作者本人，且未结贴状态
      const result = await Post.updateOne({ _id: query.tid }, { $set: { isEnd: '1' } })
      const result1 = await Comments.updateOne({ _id: query.cid }, { $set: { isBest: '1' } })

      if (result.ok === 1 && result1.ok === 1) {
        // 将积分值给采纳的用户
        const comment = await Comments.findByCid(query.cid) // 找到评论
        const result2 = await User.updateOne({ _id: comment.cuid }, { $inc: { favs: parseInt(post.fav) } }) // 根据评论找到用户ID

        if (result2.ok === 1) {
          ctx.body = {
            code: 200,
            msg: '设置成功',
            data: result2
          }
        } else {
          ctx.body = {
            code: 500,
            msg: '设置最佳答案-更新用户失败'
          }
        }
      } else {
        ctx.body = {
          code: 500,
          msg: '设置失败',
          data: { ...result, ...result1 }
        }
      }
    } else {
      ctx.body = {
        code: 500,
        msg: '帖子已结贴，无法重复设置'
      }
    }
  }
}

export default new CommentsController()
