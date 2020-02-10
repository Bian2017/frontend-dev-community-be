import Post from '@/model/Post'
import Links from '@/model/Links'
import fs from 'fs' // 操作本地文件
import uuid from 'uuid/v4'
import dayjs from 'dayjs'
import config from '@/config'
// import { dirExists } from '@/common/Utils'
import makedir from 'make-dir'

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
}

export default new ContentController()
