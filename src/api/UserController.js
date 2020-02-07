import { getJWTPayload } from '@/common/Utils'
import SignRecord from '@/model/SignRecord'
import User from '@/model/User'
import dayjs from 'dayjs'

class UserController {
  // 用户签到接口
  async userSign (ctx) {
    // 先取用户的ID
    const obj = await getJWTPayload(ctx.header.authorization)
    // 再去查询用户上一次签到记录
    const record = await SignRecord.findByUid(obj._id)
    const user = await User.findByID(obj._id)
    let newRecord = {}
    let result = ''

    if (record !== null) {
      // 有历史的签到数据
      if (dayjs(record.created).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')) {
        // 如果当前时间的日期与用户上一次签到日期相同，说明用户已经签到
        ctx.body = {
          code: 500,
          favs: user.favs,
          count: user.count,
          msg: '用户已经签到'
        }
        return
      } else {
        // 有上一次的签到记录，并且不与今天相同，进行连续签到的判断
        let count = user.count
        let fav = 0
        if (dayjs(record.lastSign).format('YYYY-MM-DD') === dayjs().subtract(1, 'days').format('YYYY-MM-DD')) {
          // 用户上一次签到的时间等于当前时间的前一天，说明用户在连续签到
          count += 1 // 此时客户已签到，需自加一
          if (count < 5) {
            fav = 5
          } else if (count >= 5 && count < 15) {
            fav = 10
          } else if (count >= 15 && count < 30) {
            fav = 15
          } else if (count >= 30 && count < 100) {
            fav = 20
          } else if (count >= 100 && count < 365) {
            fav = 30
          } else if (count >= 365) {
            fav = 50
          }

          await User.updateOne(
            { _id: obj._id },
            {
              // 在原先的数据之上，新增数据:
              // user.favs += fav
              // user.count += 1
              $inc: { favs: fav, count: 1 }
            })

          result = {
            favs: user.favs + fav, // 用户的总签到积分
            count: user.count + 1
          }
        } else {
          // 用户中断了一次签到
          fav = 5
          await User.updateOne(
            { _id: obj._id },
            {
              $set: { count: 1 }, // 将用户连续签到天数置为1
              $inc: { favs: fav }
            })

          result = {
            favs: user.favs + fav,
            count: 1
          }
        }

        // 更新签到记录
        newRecord = new SignRecord({
          uid: obj._id,
          favs: fav,
          lastSign: record.created // 上次记录的创建时间是本次记录的lastSign
        })

        await newRecord.save()
      }
    } else {
      // 若无签到数据(等价于第一次签到)，则保存用户的签到数据(签到记数 + 积分数据)
      await User.updateOne({
        _id: obj._id
      }, {
        $set: { count: 1 }, // 当前第一次签到设置为1
        $inc: { favs: 5 } // 将签到积分增加5
      })

      // 保存用户的签到记录
      newRecord = new SignRecord({
        uid: obj._id,
        favs: 5,
        lastSign: dayjs().format('YYYY-MM-DD HH:mm:ss')
      })

      await newRecord.save()

      result = {
        favs: user.favs + 5, // 返回用户的总积分数
        count: 1
      }
    }

    // 最后判断签到逻辑
    ctx.body = {
      code: 200,
      msg: '请求成功',
      ...result
    }
  }
}

export default new UserController()
