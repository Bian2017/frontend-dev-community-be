import combineRoutes from 'koa-combine-routers' // 拼接路由

import publicRouter from './publicRouter'
import loginRouter from './loginRouter'
import userRouter from './userRouter'

export default combineRoutes(publicRouter, loginRouter, userRouter)
