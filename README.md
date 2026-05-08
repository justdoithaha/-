# 数据标注实训系统 MVP 项目说明

这是一套纯前端的数据标注实训系统原型，目标是先把“完整项目”的页面、角色、流程和交互跑通。它适合课程设计、毕业设计早期原型、需求演示，也适合作为后续接入后端和数据库的基础。

当前版本不依赖 npm、Vue、React 或后端服务，直接用 `HTML + CSS + JavaScript` 实现。数据暂存在浏览器 `localStorage` 中，所以刷新页面不会立刻丢失提交和审核结果。

## 1. 项目怎么运行

项目目录：

```text
C:\Users\86193\Documents\New project
```

已启动的访问地址：

```text
http://127.0.0.1:5173
```

如果以后服务关闭了，可以在 PowerShell 中进入项目目录后重新启动：

```powershell
cd "C:\Users\86193\Documents\New project"
py -3 -m http.server 5173
```

然后在浏览器打开：

```text
http://127.0.0.1:5173
```

## 2. 项目文件结构

```text
New project
├─ index.html    页面入口，只负责挂载 CSS 和 JS
├─ styles.css    页面样式，控制登录页、后台布局、卡片、表格、标注工作台
├─ src
│  ├─ main.js     项目入口，负责首次渲染和启动全局快捷键
│  ├─ data.js     示例数据和固定选项
│  ├─ store.js    页面状态和 localStorage 存取
│  ├─ views.js    所有页面 HTML 模板
│  ├─ actions.js  登录、切页、提交、审核等交互逻辑
│  └─ utils.js    通用小工具，例如选择元素和提示消息
└─ README.md     当前说明文档
```

你可以这样理解：

`index.html` 是房子的门。

`styles.css` 是房子的装修。

`src` 目录是房子的电路、水路和按钮逻辑，只是现在拆成了几个更容易理解的小文件。

## 3. 这个 MVP 已经包含哪些功能

当前功能覆盖了你最开始提出的 MVP 清单：

| 功能 | 是否实现 | 说明 |
|---|---:|---|
| 用户登录 | 已实现 | 登录页可选择学生、助教、教师 |
| 角色区分 | 已实现 | 不同角色进入不同页面菜单 |
| 项目列表 | 已实现 | 展示文本、图像、音频项目 |
| 任务列表 | 已实现 | 支持按模态、状态、难度筛选 |
| 标注说明页 | 已实现 | 展示文本实体、多模态标注规范 |
| 简单标注页面 | 已实现 | 支持文本、图像、音频、视频四类界面 |
| 提交与保存 | 已实现 | 暂存、提交当前、全部提交 |
| 审核反馈 | 已实现 | 助教/教师可通过或退回 |
| 个人进度与成绩看板 | 已实现 | 学生可看标注量、平均成绩、成绩表 |
| 后台统计页 | 已实现 | 教师/助教可看项目、任务、提交、审核统计 |

## 4. 角色和页面流程

系统目前有三种角色：

| 角色 | 入口页面 | 主要能做什么 |
|---|---|---|
| 学生 | 首页概览 | 看项目、看任务、进入标注、提交结果、查看成绩 |
| 助教 | 首页概览 | 看任务、查看提交、审核反馈、查看统计 |
| 教师 | 后台统计 | 查看项目、任务、审核队列、整体统计 |

学生的典型流程：

```text
登录
→ 首页概览
→ 实训任务
→ 开始标注
→ 暂存 / 提交当前 / 全部提交
→ 标注历史
→ 成绩查询
```

助教 / 教师的典型流程：

```text
登录
→ 审核反馈
→ 查看学生提交
→ 填写反馈
→ 通过 / 退回
→ 后台统计
```

## 5. 核心代码怎么读

第一次看项目，建议从 `src` 目录按下面顺序读。

### 5.1 示例数据：`seed`

位置：

```js
src/data.js
const seed = { ... }
```

它是系统的“假数据库”，包含三类核心数据：

```text
projects      项目列表
tasks         任务列表
submissions   学生提交与审核记录
```

例如一个任务数据大概长这样：

```js
{
  id: "t1",
  projectId: "p1",
  name: "文本实体标注实训（入门）",
  type: "文本",
  total: 50,
  done: 22,
  deadline: "03-30",
  difficulty: "入门",
  status: "进行中"
}
```

后续如果接后端数据库，这一块就会从“写死的数组”变成“接口请求返回的数据”。

### 5.2 页面状态：`state`

位置：

```js
src/store.js
const state = { ... }
```

它记录当前系统正在发生什么，例如：

```text
user               当前登录用户
page               当前页面
workTaskId         当前正在标注的任务
annotationType     当前标注类型：文本 / 图像 / 音频 / 视频
filters            任务筛选条件
data               当前项目数据
```

简单理解：

`seed` 是原始数据。

`state` 是当前运行状态。

页面之所以能切换，就是因为修改了 `state.page`，然后重新调用 `render()`。

### 5.3 页面渲染入口：`render()`

位置：

```js
src/main.js
function render() {
  $("#app").innerHTML = appView();
  bindEvents(render);
}
```

这是整个项目最重要的函数之一。模块化后，实际代码写法略有变化，但含义不变：

```js
function render() {
  $("#app").innerHTML = appView();
  bindEvents(render);
}
```

它做两件事：

1. 判断有没有登录，如果没登录就显示登录页。
2. 如果已登录，就显示系统主布局，并重新绑定按钮事件。

你可以把它理解成“刷新当前界面”的总开关。

### 5.4 登录页：`loginView()`

位置：

```js
src/views.js
function loginView() { ... }
```

它返回登录页 HTML 字符串，包括：

```text
身份选择
学号 / 工号
密码
登录按钮
```

这里没有真正校验账号密码，因为 MVP 阶段重点是演示角色和业务流程。后续真实项目可以把登录按钮改成请求后端登录接口。

### 5.5 主布局：`layout()`

位置：

```js
src/views.js
function layout() { ... }
```

它负责生成登录后的整体框架：

```text
顶部导航栏
左侧菜单
中间内容区域
```

如果当前页面是标注页，则会进入专门的三栏标注工作台。

### 5.6 页面分发：`pageBody()`

位置：

```js
src/views.js
function pageBody() { ... }
```

它根据 `state.page` 决定显示哪个页面：

```js
const views = {
  home: homePage,
  projects: projectsPage,
  tasks: tasksPage,
  instructions: instructionsPage,
  history: historyPage,
  progress: progressPage,
  review: reviewPage,
  stats: statsPage
};
```

例如：

```text
state.page = "tasks"
```

页面就会显示任务列表。

### 5.7 标注页面：`annotationPage()`

位置：

```js
src/views.js
function annotationPage() { ... }
```

这是最接近 PDF 里标注工作台的页面。

它分三栏：

```text
左侧：任务说明、规范、数据列表
中间：标注区域
右侧：标注工具、标签按钮、快捷键、当前结果
```

中间标注区域由 `annotationCanvas()` 控制，会根据当前模态显示不同内容：

```text
文本：实体示例和标签
图像：模拟目标框
音频：模拟播放器和转写输入框
视频：模拟播放器和关键帧描述输入框
```

### 5.8 提交逻辑：`submitTask(all)`

位置：

```js
src/actions.js
function submitTask(all) { ... }
```

它负责处理：

```text
提交当前
全部提交
更新任务完成量
新增一条待审核提交
保存到 localStorage
跳转到标注历史
```

其中 `all` 表示是不是“全部提交”：

```js
submitTask(false)  // 提交当前
submitTask(true)   // 全部提交
```

### 5.9 审核逻辑：`audit(id, result)`

位置：

```js
src/actions.js
function audit(id, result) { ... }
```

助教或教师点击“通过 / 退回”时，会修改对应提交记录：

```text
通过：状态变成已审核，生成分数和反馈
退回：状态变成需修改，生成退回意见
```

### 5.10 事件绑定：`bindEvents(render)`

位置：

```js
src/actions.js
function bindEvents(render) { ... }
```

这个函数负责给页面上的按钮绑定交互，例如：

```text
登录按钮
退出按钮
菜单切换
任务筛选
开始标注
切换标注模态
暂存
提交
审核通过
审核退回
```

因为页面是通过 `innerHTML` 重新生成的，所以每次 `render()` 后都要重新执行 `bindEvents(render)`。

## 6. 数据是怎么流动的

这个项目的数据流很简单：

```text
用户点击按钮
→ 事件函数触发
→ 修改 state
→ 保存到 localStorage
→ render() 重新渲染页面
```

例如学生点击“全部提交”：

```text
点击全部提交
→ submitTask(true)
→ 修改 task.done
→ 新增 submission
→ saveData()
→ render()
→ 页面显示最新历史记录
```

例如教师点击“通过”：

```text
点击通过
→ audit(id, "通过")
→ 修改 submission.status
→ 填入 feedback / score / accuracy
→ saveData()
→ render()
→ 审核列表刷新
```

## 7. 样式怎么读

样式集中在 `styles.css`。

建议先看这些区域：

| 样式类 | 作用 |
|---|---|
| `.login-page` | 登录页左右分栏 |
| `.app-shell` | 登录后的整体系统外壳 |
| `.topbar` | 顶部深色导航栏 |
| `.main` | 左侧菜单 + 内容区布局 |
| `.sidebar` | 左侧菜单 |
| `.content` | 普通页面内容区域 |
| `.card` | 卡片组件 |
| `.table` | 表格样式 |
| `.annotation-shell` | 标注页三栏布局 |
| `.toast` | 右下角提示消息 |

当前 UI 参考了 PDF 中的后台系统风格：

```text
深色顶部导航
浅色页面背景
白色卡片
蓝色主按钮
三栏标注工作台
```

## 8. localStorage 是什么

当前没有后端数据库，所以用浏览器本地存储保存数据。

保存位置的 key 是：

```js
annotationTrainingData
```

如果你想恢复初始数据，可以在浏览器控制台执行：

```js
localStorage.removeItem("annotationTrainingData")
location.reload()
```

这会清空提交和审核记录，回到默认示例数据。

## 9. 如果要改功能，该从哪里下手

### 9.1 增加一个新项目

修改 `src/data.js` 里的 `seed.projects`。

### 9.2 增加一个新任务

修改 `src/data.js` 里的 `seed.tasks`。

注意任务的 `projectId` 要对应某个项目的 `id`。

### 9.3 增加一个新页面

需要改三处：

1. 在 `src/views.js` 里写一个新的页面函数，例如：

```js
function usersPage() { ... }
```

2. 仍然在 `src/views.js` 的 `pageBody()` 里注册：

```js
users: usersPage
```

3. 仍然在 `src/views.js` 的 `pageConfig()` 中把页面加入对应角色的菜单：

```js
["users", "用户管理"]
```

### 9.4 修改登录后的默认页面

看 `src/actions.js` 中 `login()` 的登录表单提交逻辑：

```js
state.page = role === "teacher" ? "stats" : "home";
```

这表示教师登录后默认进入后台统计，学生和助教默认进入首页。

### 9.5 修改标注类型

看 `src/views.js`：

```js
function annotationCanvas() { ... }
```

这里控制文本、图像、音频、视频不同工作区的展示。

## 10. 当前版本的局限

这是 MVP 原型，所以有意把复杂度压低了。

当前还没有：

```text
真实账号系统
真实后端接口
真实数据库
文件上传
真实图片框选坐标保存
真实音视频播放器
教师新建项目表单
复杂权限校验
自动评分算法
多人协作冲突处理
```

这些不是缺陷，而是 MVP 阶段合理保留的扩展点。先跑通业务闭环，再逐步工程化，是做完整项目更稳的路线。

## 11. 后续升级路线

建议按这个顺序升级：

### 第一阶段：把前端原型完善

```text
增加项目新建表单
增加任务新建表单
增加学生列表
增加更真实的标注历史
让图像框选真的能拖拽
```

### 第二阶段：接入后端

可以选择：

```text
Node.js + Express
Python Flask / FastAPI
Java Spring Boot
```

后端主要提供：

```text
登录接口
项目接口
任务接口
提交接口
审核接口
统计接口
```

### 第三阶段：接入数据库

可以选择：

```text
MySQL
PostgreSQL
SQLite
```

建议最开始用 SQLite 或 MySQL，表结构可以从当前 `seed` 数据推出来。

### 第四阶段：工程化前端

后续可以迁移到：

```text
Vue 3 + Vite
React + Vite
```

到那时可以把页面拆成组件：

```text
LoginPage
Layout
Sidebar
TaskCard
ProjectCard
AnnotationWorkbench
ReviewPanel
StatsDashboard
```

## 12. 推荐学习顺序

如果你是第一次做完整项目，建议这样吃透：

1. 先运行项目，点一遍学生流程。
2. 再用助教或教师身份登录，点一遍审核流程。
3. 打开 `src/data.js`，先理解 `seed` 示例数据。
4. 打开 `src/store.js`，理解 `state` 当前状态。
5. 打开 `src/main.js`，找到 `render()`，理解页面如何刷新。
6. 打开 `src/actions.js`，理解按钮如何工作。
7. 找到 `submitTask()` 和 `audit()`，理解核心业务闭环。
8. 最后看 `styles.css`，理解页面布局和视觉样式。

吃透之后，你就能回答一个完整项目最关键的几个问题：

```text
用户是谁？
用户能做什么？
页面怎么切换？
数据从哪里来？
点击按钮后数据怎么变？
数据怎么保存？
后续怎么接后端？
```

只要这几个问题能讲清楚，这个项目你就已经真正理解了。
