import Post from '@/model/Post'
import Links from '@/model/Links'
import User from '@/model/User'
import UserCollect from '@/model/UserCollect'
import fs from 'fs' // 操作本地文件
import uuid from 'uuid/v4'
import dayjs from 'dayjs'
import config from '@/config'
// import { dirExists } from '@/common/Utils'
import makedir from 'make-dir'
import { checkCode, getJWTPayload, rename } from '@/common/Utils'

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

  // 上传图片
  async uploadImg (ctx) {
    const file = ctx.request.files.file

    // 取得图片格式
    const ext = file.name.split('.').pop()
    /**
     * 通常后台存储图片逻辑：给图片唯一的名称，然后按照日期对这些资源数据进行分文件夹存储。
     * 一是方便去进行查找；二是若资源全放在同一个文件夹下，读取或操作等行为会导致打开异常缓慢
     */
    const dir = `${config.uploadPath}/${dayjs().format('YYYYMMDD')}`

    // 判断路径存不存在，不存在则创建
    await makedir(dir)

    /**
     * 将读取的文件写到我们自己的文件系统上去，然后形成静态资源文件服务
     */
    const picname = uuid() // 给文件唯一的名称
    const destPath = `${dir}/${picname}.${ext}`

    /**
     * readFile与createReadStream的区别：
     * readFile是直接将文件读取到内存中；
     * createReadStream非常节约内存，读取大文件的时候使用该API相对来说会更加节约资源；
     */
    const reader = fs.createReadStream(file.path, {
      // 控制底层读取的速度，举例：每次读取数据的大小限制为1kb
      // highWaterMark: 1 * 1024
    }) // 读取文件流
    const upStream = fs.createWriteStream(destPath) // 保存文件流
    const filePath = `/${dayjs().format('YYYYMMDD')}/${picname}.${ext}` // 文件路径

    // 方法1 --- 比较简单的方法
    // reader.pipe(upStream)

    /**
     * 方法2：可以应对大文件，而且可以监听文件上传的过程、进度
     */
    let totalLength = 0
    // 每次读取highWaterMark个字节，触发一次data
    reader.on('data', (chunk) => { // 可以传递每次发送区块的数据
      totalLength += chunk.length

      console.log('totalLength:', totalLength)

      if (upStream.write(chunk) === false) {
        // 将读取的流停止下
        // reader.pause()
      }
    })

    // 当前写入的内容已经大于等于highWaterMark，会触发drain
    reader.on('drain', () => {
      // 进行继续的读取
      console.log('drain')
      reader.resume()
    })

    // 当读取完成之后触发end事件
    reader.on('end', () => {
      // 关闭文件流
      upStream.end()
    })

    ctx.body = {
      code: 200,
      msg: '图片上传成功',
      data: filePath
    }
  }

  // 添加新帖
  async addPost (ctx) {
    const { body } = ctx.request
    const sid = body.sid
    const code = body.code

    // 验证图片验证码的时效性、正确性
    const result = await checkCode(sid, code)
    if (result) {
      const obj = await getJWTPayload(ctx.header.authorization)

      // 判断用户的积分数是否 > fav，否则，提升用户积分不足发帖
      // 用户积分足够的时候，新建Post，减除用户对应的积分
      const user = await User.findByID({ _id: obj._id })
      if (user.favs < body.fav) {
        ctx.body = {
          code: 501,
          msg: '积分不足'
        }
        return
      } else {
        await User.updateOne({ _id: obj._id }, { $inc: { favs: -body.fav } })
      }

      const newPost = new Post(body)
      newPost.uid = obj._id

      const result = await newPost.save()

      ctx.body = {
        code: 200,
        msg: '文章保存成功',
        data: result
      }
    } else {
      ctx.body = {
        code: 500,
        msg: '图片验证码验证失败'
      }
    }
  }

  // 更新帖子
  async updatePost (ctx) {
    const { body } = ctx.request
    const sid = body.sid
    const code = body.code

    // 验证图片验证码的时效性、正确性
    const result = await checkCode(sid, code)
    if (result) {
      const obj = await getJWTPayload(ctx.header.authorization)
      const post = await Post.findOne({ _id: body.tid })

      // 判断帖子作者是否为本人，并且帖子是否结贴
      if (post.uid === obj._id && post.isEnd === '0') {
        const result = await Post.updateOne({ _id: body.tid }, body)

        if (result.ok === 1) {
          ctx.body = {
            code: 200,
            data: result,
            msg: '更新帖子成功'
          }
        } else {
          ctx.body = {
            code: 500,
            data: result,
            msg: '更新失败'
          }
        }
      } else {
        ctx.body = {
          code: 401,
          msg: '没有操作权限'
        }
      }
    } else {
      ctx.body = {
        code: 500,
        msg: '图片验证码验证失败'
      }
    }
  }

  // 获取文章详情
  async getPostDetail (ctx) {
    const { query } = ctx

    if (!query.tid) {
      ctx.body = {
        code: 500,
        msg: '文章标题为空'
      }
      return
    }

    const post = await Post.findByTid(query.tid)

    let isFav = 0 // 是否收藏
    // 判断用户是否登录
    if (typeof ctx.header.authorization !== 'undefined' && ctx.header.authorization !== '') {
      const obj = await getJWTPayload(ctx.header.authorization)
      // 查看用户的收藏记录
      const userCollect = await UserCollect.findOne({
        uid: obj._id,
        tid: query.tid
      })

      if (userCollect && userCollect.tid) {
        isFav = 1
      }
    }
    const newPost = post.toJSON()
    newPost.isFav = isFav

    // 更新文章阅读计数
    const reads = await Post.updateOne({ _id: query.tid }, { $inc: { reads: 1 } })

    // 更改字段名称
    const result = rename(newPost, 'uid', 'user')

    if (post._id && reads.ok === 1) {
      ctx.body = {
        code: 200,
        data: result,
        msg: '查询文章详情成功'
      }
    } else {
      ctx.body = {
        code: 500,
        msg: '获取文章详情失败'
      }
    }
  }

  // 获取用户发帖记录
  async getPostByUid (ctx) {
    const { query: { limit = 10, page = 0 } } = ctx

    const obj = await getJWTPayload(ctx.header.authorization)
    const result = await Post.getListByUid(obj._id, parseInt(page), parseInt(limit))
    const total = await Post.countByUid(obj._id)

    if (result.length > 0) {
      ctx.body = {
        code: 200,
        data: result,
        total,
        msg: '查询列表成功'
      }
    } else {
      ctx.body = {
        code: 500,
        msg: '查询列表失败'
      }
    }
  }

  // 删除发帖记录
  async deletePostByUid (ctx) {
    const { query } = ctx
    const obj = await getJWTPayload(ctx.header.authorization)
    const post = await Post.findOne({ _id: query.tid })

    // 判断是否是用户本人，且帖子未结贴等才可以删除
    if (post.uid === obj._id && post.isEnd === '0') {
      const result = await Post.deleteOne({ _id: query.tid })

      if (result.ok === 1) {
        ctx.body = {
          code: 200,
          msg: '删除成功'
        }
      } else {
        ctx.body = {
          code: 500,
          msg: '执行删除失败'
        }
      }
    } else {
      ctx.body = {
        code: 500,
        msg: '删除失败，无操作权限'
      }
    }
  }

  // 获取收藏列表
  async getCollectionByUid (ctx) {
    const { query: { page = 0, limit = 10 } } = ctx
    const obj = await getJWTPayload(ctx.header.authorization)
    const result = await UserCollect.getListByUid(obj._id, parseInt(page), parseInt(limit))
    const total = await UserCollect.countByUid(obj._id)

    if (result.length > 0) {
      ctx.body = {
        code: 200,
        data: result,
        total,
        msg: '查询列表成功'
      }
    } else {
      ctx.bodyo = {
        code: 500,
        msg: '查询列表失败'
      }
    }
  }
}

export default new ContentController()
