import Router from 'koa-router'
import publicController from '@/api/PublicController'
import contentController from '@/api/ContentController'
import userController from '@/api/UserController'
import commentsController from '@/api/CommentsController'

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

// 确认修改邮件
router.get('/reset-email', userController.updateUsername)

// 获取文章详情
router.get('/content/detail', contentController.getPostDetail)

// 获取评论列表
router.get('/comments', commentsController.getComments)

// 获取用户基本信息
router.get('/info', userController.getBasicInfo)

// 获取用户最近的发帖纪录
router.get('/latest-post', contentController.getPostPublic)

// 获取用户最近的评论纪录
router.get('/latest-comment', commentsController.getCommentPublic)

export default router
