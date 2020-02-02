import Router from 'koa-router'
import publicController from '@/api/PublicController'
import contentController from '@/api/ContentController'

const router = new Router()

// 路径前缀
router.prefix('/public')

router.get('/captcha', publicController.getCaptcha)
router.get('/list', contentController.getPostList)

export default router
