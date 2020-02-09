import combineRoutes from 'koa-combine-routers' // 拼接路由

// import publicRouter from './publicRouter'
// import loginRouter from './loginRouter'
// import userRouter from './userRouter'

// export default combineRoutes(publicRouter, loginRouter, userRouter)

/**
 * 加载目录中的Router中间件(支持子目录)
 * 注：借助于webpack的require.context函数。
 */
const moduleFiles = require.context('./modules', true, /\.js$/)

// reduce方法去拼接 koa-combine-router所需的数据结构 Object[]
const modules = moduleFiles.keys().reduce((items, path) => {
  const value = moduleFiles(path)
  items.push(value.default)
  return items
}, []) // []表示初始值

export default combineRoutes(modules)
