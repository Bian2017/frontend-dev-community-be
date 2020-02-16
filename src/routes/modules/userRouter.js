
import Router from 'koa-router'
import userController from '@/api/UserController'

const router = new Router()

// 这个路由下面所有用户发过来的请求都需要进行鉴权
router.prefix('/user')

// 用户签到
router.get('/fav', userController.userSign)

// 更新用户的基本信息
router.post('/basic', userController.updateUserInfo)

// 取消/设置收藏
router.get('/set-collect', userController.setCollect)

export default router
