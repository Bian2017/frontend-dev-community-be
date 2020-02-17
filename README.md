## 项目后台

### 项目运行

#### 如何运行开发环境？

1. 监测开发环境的文件变化：

> npm run watch

2. 当文件变化后，nodemon 自动重启运行：

> npm run debug



## 更新依赖

查看npm依赖更新。

> npx ncu

更新package.json。

> npx ncu -u

然后更新依赖。

> npm install


### 添加eslint规则

1. 安装eslint。

> npm install -D eslint

2. 初始化eslint配置文件。

> npx eslint --init

3. 检测文件是否符合eslint代码规范

> npx eslint src/**/*.js

### VS Code调试

1. 如何避免VS Code调试的时候，进入node_modules模块中？

删除launch.json的`skipFiles`选项，即可避免调试的时候进入node_modules模块中。

```JSON
// 配置：“通过npm启动”，自动生成如下配置
{
  "type": "node",
  "request": "launch",
  "name": "Launch via NPM",
  "runtimeExecutable": "npm",
  // 添加restart
  "restart": true,
  // 通过内部终端显示console日志
  "console": "integratedTerminal",
  // 指定node版本
  "runtimeVersion": "12.14.0", 
  "runtimeArgs": [
    "run-script",
    // 将debug改成start:dist
    "dev"
  ],
  "port": 9229,
  "skipFiles": [
    "${workspaceFolder}/node_modules/**/*.js"
  ]
},
```



## 注意

### 1. bcrypt依赖包安装失败问题

**bcrypt对版本要求非常严苛**，如下所示(见npm官网)。

Node Version|	Bcrypt Version
---|---
0.4	| <= 0.4
0.6, 0.8, 0.10|	>= 0.5
0.11	|>= 0.8
4	| <= 2.1.0
8	| >= 1.0.3
10, 11 |	>= 3
12 |	>= 3.0.6

bcrypt依赖包版本若大于`3.0.5`，是需要使用node v12版本。如果本地node版本是v10，最好写死bcrypt依赖包版本，即版本为`3.0.5`。

如果还存在bcrypt依赖包安装失败问题，还可以通过如下方式进行解决：

> sudo npm install --unsafe-perm 




npm rebuild 的作用
