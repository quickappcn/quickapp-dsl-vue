/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

/**
 * 定义dock与dsl通讯时的事件接口
 */
const APP_KEYS = {
  // APP加载
  initApp: 'quickapp.app.initApp',
  // 页面加载
  initPage: 'quickapp.page.initPage',
  // 页面销毁
  destroyPage: 'quickapp.page.destroyPage',
  // 页面中的组件事件
  fireEvent: 'quickapp.page.fireEvent',
  // 页面onShow
  onShow: 'quickapp.page.onShow',
  // 页面onHide
  onHide: 'quickapp.page.onHide',
  // 页面返回响应
  onBackPress: 'quickapp.page.onBackPress',
  // 页面菜单响应
  onMenuPress: 'quickapp.page.onMenuPress',
  // 页面朝向响应
  onOrientationChange: 'quickapp.page.onOrientationChange',
  // 页面：组件方法的callback()执行完毕，Native接口的回调完毕，定时器完毕
  callbackDone: 'quickapp.page.callbackDone'
}

export { APP_KEYS }
