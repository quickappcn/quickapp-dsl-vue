## 快应用引入 Vue，相关测试用例说明

#### Vue 的测试用例是以 Web 环境为主，快应用的 DOM 实现是浏览器的子集，所以一些跟 Web DOM 相关的测试用例在快应用环境内不能通过，以下为主要表现：

> features/directives/cloak.spec.js 的测试测试用例不支持。这个指令一般跟 CSS 属性选择器一起使用防止页面出现`{{}}`解析之后才隐藏的问题。因为快应用没有 html 片段，所以不会出现这个问题。

> features/directives/html.spec.js、text.spec.js 的测试用例不支持。快应用的 DOM 没有实现 innerHTML 和 contentText，所以这两个指令在快应用平台中毫无意义，相关的测试用例也必须使用其他手段测试，可以通过 DOM 的\_attr 对象获取相应属性。请避免使用这两个指令。

> features/directives/style.spec.js 的测试用例不支持。该测试用例是针对 web 环境的。

> features/directives/model 相关的测试用例暂时不补全。目前快应用推荐使用:/v-bind 等指令进行数据的绑定，稍后将开放 v-model 指令。v-model 是一个语法糖，我们还是建议通过单向的数据流动去操控可控组件。目前快应用支持 radio/checkbox/text 类型的 input 标签的双向绑定、textarea 的双向绑定，select 标签的双向绑定暂不支持。

> features/transition 文件夹内的测试用例不支持。由于快应用目前不暴露 animation 相关的 api。推荐开发者使用 css 操控动画，目前的 transition/transition-group 等标签在当前快应用版本中不支持。

> modules 文件夹内测实测用例暂不支持，快应用会结合平台实现自己的 module 相关的测试用例，并放在 page 测试用例内。

> 部分 v-model 的测试用例和事件的测试用例将移步至 page 测试用例内。
