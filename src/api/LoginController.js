import moment from 'moment';
import jsonwebtoken from 'jsonwebtoken';
import bcrypt from 'bcrypt';
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
    const { sid, code, username, password } = body;

    const result = await checkCode(sid, code);

    // 验证图片验证码的时效性、正确性
    if (result) {
      // 验证用户账号、密码是否正确
      let user = await User.findOne({ username });

      let checkUserPassword = '';
      // 解密密码: 前面是明文密码，后面是哈希密码
      if (await bcrypt.compare(password, user.password)) {
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
        code: 500,
        msg: '图片验证码不正确，请检查'
      };
    }
  }

  async reg(ctx) {
    const { body } = ctx.request;
    const { sid, code, username, name, password } = body;
    let msg = {};
    let check = true;

    const result = await checkCode(sid, code);

    // 服务端校验
    if (result) {
      // 邮箱
      let user1 = await User.findOne({ username });
      if (user1 !== null && typeof user1.username !== 'undefined') {
        msg.username = ['此邮箱已经注册，可以通过邮箱找回密码'];
        check = false;
      }

      // 昵称
      let user2 = await User.findOne({ name });
      if (user2 !== null && typeof user2.name !== 'undefined') {
        msg.name = ['此昵称已经被注册，请修改'];
        check = false;
      }

      if (check) {
        // 随机产生一个盐
        const cryptPassword = await bcrypt.hash(password, 5);

        let user = new User({
          username,
          name,
          password: cryptPassword,
          created: moment().format('YYYY-MM-DD HH:mm:ss')
        });

        const res = await user.save();

        ctx.body = {
          code: 200,
          data: res,
          msg: '注册成功'
        };
        return;
      }
    } else {
      // code表示验证码
      msg.code = ['验证码已经失效，请重新获取'];
    }

    ctx.body = {
      code: 500,
      msg
    };
  }
}

export default new LoginController();
