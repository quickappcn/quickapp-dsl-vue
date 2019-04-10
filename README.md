# quickapp-dsl-vue

<br/>

该项目为快应用平台中，Vue框架的适配代码；

运行其中的`npm run build`会在`dist`目录下生成对应的DSL文件，而这个文件会被内置在快应用的平台APK中；

<br/>

## 相关项目简介

### [quickappcn/hap-toolkit](https://github.com/quickappcn/hap-toolkit)

快应用项目的编译工具；包括：项目初始化、编译、校验、打包等；

### [quickappcn/vue](https://github.com/quickappcn/vue)

快应用平台Fork的官方vue源码；补充围绕基于DOM API的适配操作；

### [quickappcn/quickapp-dsl-vue](https://github.com/quickappcn/quickapp-dsl-vue)

快应用官方的Vue DSL项目；补充其中的APP/Page的生命周期、系统能力的获取调用；

### [quickappcn/todomvc-vue](https://github.com/quickappcn/todomvc-vue)

快应用平台中运行，使用Vue DSL开发的TodoMVC项目；

<br/>

## 如何使用Vue开发快应用

开发者在快应用中使用Vue来开发，需要完成：`编译时`、`运行时`两方面的操作；

### 编译时

编译时主要包括：新建快应用项目、编译打包项目的能力；

开发者需要的步骤如下：

```bash

# 全局安装hap-toolkit
npm install hap-toolkit -g

# 确认版本大于0.3.0
hap -v

# 初始化项目
hap init vue-demo101 --vue      # 如果toolkit版本为0.3
hap init vue-demo101 --dsl=vue  # 如果toolkit版本为0.4及其以后

# 进入项目并安装依赖
cd vue-demo
npm install

# 开发项目：增加页面，开发组件等
# ...

# 构建项目，得到rpk文件
npm run build           # 代码非压缩，用于开发
npm run release         # 代码压缩，用于上线
```

### 运行时

快应用运行时，手机设备需要运行1050版本及其以上的APK；

目前从1050版本的APK开始，会内置：标准DSL框架JS(ux后缀)、Vue的DSL框架JS；

当平台运行RPK时，会自动根据RPK构建时所用的语法来选择DSL框架，并加载执行；

开发者需要的操作步骤如下：

#### 1. 下载运行平台

开发者可以从[这里](https://statres.quickapp.cn/quickapp/quickapp/201806/file/quickapp_debugger.apk)下载运行快应用平台APK；

#### 2. 安装调试器

开发者可以从[这里](./resource/platform)下载运行快应用调试器APK；

### 3. 加载编译构建的RPK文件

开发者可以在调试器中选择`本地安装`或者`在线更新`的方式，来加载RPK文件；

使用方式与标准的DSL开发一样；具体请参考[快应用官方文档教程](https://doc.quickapp.cn/tutorial/overview/use-command.html)

<br/>

## 如何Vue DSL中的代码

当您发现当前内测版本中的Vue框架代码有`功能缺失`或者`BUG`时，您可以向我们提出ISSUE；

当然如何是高级开发者，也可以提交Merge Request进来；


