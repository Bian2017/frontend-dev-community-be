import moment from 'moment';
import jsonwebtoken from 'jsonwebtoken';
import User from '@/model/User';
import send from '@/config/MailConfig';
import config from '@/config/index';
import { checkCode } from '@/common/Utils';

class LoginController {
  constructor() {}

  async forget(ctx) {
    const { body } = ctx.request;

    try {
      const result = await send({
        code: '1234', // 验证码
        // 30分钟过期
        expire: moment()
          .add(30, 'm')
          .format('YYYY-MM-DD HH:mm:ss'),
        email: body.username, // 用户邮箱
        user: 'shimu' // 用户昵称
      });

      ctx.body = {
        code: 200,
        data: result,
        msg: '邮件发送成功'
      };
    } catch (e) {
      console.log('e:', e);
    }
  }

  /**
   * 登录：
   * + 接收用户数据；
   * +
   * +
   * + 返回token
   *
   * @param {*} ctx
   */
  async login(ctx) {
    const { body } = ctx.request;
    const { sid, code, username } = body;

    const result = await checkCode(sid, code);

    // 验证图片验证码的时效性、正确性
    if (result) {
      // 验证用户账号、密码是否正确
      let user = await User.findOne({ username });

      let checkUserPassword = '';
      if (user.password === body.password) {
        checkUserPassword = true;
      }

      if (checkUserPassword) {
        // 验证通过，返回Token数据
        const token = jsonwebtoken.sign({ _id: 'LI' }, config.JWT_SECRET, {
          expiresIn: '1d'
        });

        ctx.body = {
          code: 200,
          token: token
        };
      } else {
        // 用户名/密码验证失败，返回提示
        ctx.body = {
          code: 404,
          msg: '用户名或密码错误'
        };
      }
    } else {
      // 图片验证码失败
      ctx.body = {
        code: 401,
        msg: '图片验证码不正确，请检查'
      };
    }
  }
}

export default new LoginController();
