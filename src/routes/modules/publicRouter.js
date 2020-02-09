import Router from 'koa-router'
import publicController from '@/api/PublicController'
import contentController from '@/api/ContentController'

const router = new Router()

// 路径前缀
router.prefix('/public')

// 获取图片验证码
router.get('/captcha', publicController.getCaptcha)

// 获取文章列表
router.get('/list', contentController.getPostList)

// 获取温馨提醒
router.get('/tips', contentController.getTips)

// 获取友链
router.get('/links', contentController.getLinks)

// 回复周榜
router.get('/topWeek', contentController.getTopWeek)

export default router
