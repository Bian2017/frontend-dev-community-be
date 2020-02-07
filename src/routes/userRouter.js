
import Router from 'koa-router'
import userController from '../api/UserController'

const router = new Router()

// 这个路由下面所有用户发过来的请求都需要进行鉴权
router.prefix('/user')

// 用户签到
router.get('/fav', userController.userSign)

export default router
