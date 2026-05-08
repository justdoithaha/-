import { annotationTypes, filterOptions, iconText, roles } from "./data.js";
import { state } from "./store.js";

export function appView() {
  return state.user ? layout() : loginView();
}

function loginView() {
  return `
    <main class="login-page">
      <section class="login-brand">
        <h1>数据标注实训平台</h1>
        <p>校企合作 · 多模态标注 · 教学实训一体化</p>
      </section>
      <section class="login-panel">
        <form class="login-card" id="loginForm">
          <h2>用户登录</h2>
          <label class="field">
            身份选择
            <select id="role">
              <option value="student">学生</option>
              <option value="assistant">助教</option>
              <option value="teacher">教师</option>
            </select>
          </label>
          <label class="field">
            学号/工号
            <input id="account" value="20230101001" placeholder="请输入学号/工号" />
          </label>
          <label class="field">
            密码
            <input id="password" type="password" value="123456" placeholder="请输入密码" />
          </label>
          <button class="btn" type="submit" style="width:100%">登录</button>
        </form>
      </section>
    </main>
  `;
}

function layout() {
  if (state.page === "annotation") return annotationPage();

  const pages = pageConfig();
  return `
    <div class="app-shell">
      ${topbar(pages)}
      <div class="main">
        <aside class="sidebar">${pages.map(sideLink).join("")}</aside>
        <main class="content">${pageBody()}</main>
      </div>
    </div>
  `;
}

function pageConfig() {
  if (state.user.role === "teacher") {
    return [
      ["home", "首页概览"],
      ["projects", "项目列表"],
      ["tasks", "任务列表"],
      ["review", "审核反馈"],
      ["stats", "后台统计"]
    ];
  }

  if (state.user.role === "assistant") {
    return [
      ["home", "首页概览"],
      ["projects", "项目列表"],
      ["tasks", "任务列表"],
      ["instructions", "标注说明"],
      ["review", "审核反馈"],
      ["stats", "后台统计"]
    ];
  }

  return [
    ["home", "首页概览"],
    ["projects", "项目列表"],
    ["tasks", "实训任务"],
    ["history", "标注历史"],
    ["progress", "成绩查询"],
    ["instructions", "教程文档"]
  ];
}

function topbar(pages) {
  return `
    <header class="topbar">
      <div class="brand">数据标注实训平台</div>
      <nav class="topnav">
        ${pages.slice(0, 4).map(([id, label]) => `<button data-page="${id}" class="${state.page === id ? "active" : ""}">${label}</button>`).join("")}
      </nav>
      <div class="user-area">
        <span>${state.user.name} · ${roles[state.user.role]}</span>
        <button id="logoutBtn">退出</button>
      </div>
    </header>
  `;
}

function sideLink([id, label]) {
  return `<button class="side-link ${state.page === id ? "active" : ""}" data-page="${id}">${label}</button>`;
}

function pageBody() {
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

  return views[state.page]();
}

function homePage() {
  const pendingTasks = state.data.tasks.filter((task) => task.status !== "已完成").length;
  const doneAmount = state.data.tasks.reduce((sum, task) => sum + task.done, 0);
  const reviewed = reviewedSubmissions();
  const average = reviewed.length ? Math.round(reviewed.reduce((sum, item) => sum + item.score, 0) / reviewed.length) : 0;

  return `
    <div class="page-title">
      <div>
        <h2>欢迎回来，${state.user.name}同学！</h2>
        <div class="hint">今日有 ${pendingTasks} 个待完成实训任务</div>
      </div>
      <button class="btn ghost" data-page="tasks">进入任务中心</button>
    </div>
    <section class="grid stats-grid">
      ${statCard(pendingTasks, "待完成任务")}
      ${statCard(doneAmount, "已完成标注量")}
      ${statCard(average || 92, "综合得分")}
      ${statCard(state.data.projects.length, "已开设实训")}
    </section>
    <h3 class="section-title">快捷标注入口</h3>
    <section class="grid stats-grid">
      ${annotationTypes.map((type) => `
        <button class="card quick-card" data-start-type="${type}">
          <span class="quick-icon">${iconText[type]}</span>
          <span>${type}标注</span>
        </button>
      `).join("")}
    </section>
    <h3 class="section-title">最新公告</h3>
    <section class="card">
      <ul class="hint">
        <li>《图像目标检测实训》截止时间延长至 4 月 5 日。</li>
        <li>新增《大模型指令微调标注》高阶实训课程。</li>
        <li>助教每周五集中审核本周提交结果。</li>
      </ul>
    </section>
  `;
}

function statCard(value, label) {
  return `<article class="card stat"><div class="value">${value}</div><div class="label">${label}</div></article>`;
}

function projectsPage() {
  return `
    <div class="page-title">
      <h2>项目列表</h2>
      ${state.user.role === "teacher" ? `<button class="btn">新建项目</button>` : ""}
    </div>
    <section class="grid project-grid">
      ${state.data.projects.map((project) => `
        <article class="card project-card">
          <div class="meta-row">
            <span class="badge blue">${project.type}</span>
            <span class="badge ${project.status === "已完成" ? "green" : "amber"}">${project.status}</span>
          </div>
          <h3>${project.name}</h3>
          <p class="hint">${project.description}</p>
          <div class="hint">负责人：${project.owner} · 截止：${project.deadline}</div>
          <div class="progress"><span class="${project.progress === 100 ? "green" : ""}" style="width:${project.progress}%"></span></div>
          <div class="button-row">
            <button class="btn ghost" data-page="tasks">查看任务</button>
            <button class="btn secondary" data-page="instructions">标注说明</button>
          </div>
        </article>
      `).join("")}
    </section>
  `;
}

function tasksPage() {
  const tasks = state.data.tasks.filter((task) => {
    const typeOk = state.filterType === "全部模态" || task.type === state.filterType;
    const statusOk = state.filterStatus === "全部状态" || task.status === state.filterStatus;
    const diffOk = state.filterDifficulty === "全部难度" || task.difficulty === state.filterDifficulty;
    return typeOk && statusOk && diffOk;
  });

  return `
    <div class="page-title">
      <h2>${state.user.role === "student" ? "实训任务中心" : "任务列表"}</h2>
    </div>
    <div class="filters">
      ${select("filterType", filterOptions.type, state.filterType)}
      ${select("filterStatus", filterOptions.status, state.filterStatus)}
      ${select("filterDifficulty", filterOptions.difficulty, state.filterDifficulty)}
    </div>
    <section class="grid task-grid">
      ${tasks.map(taskCard).join("") || `<div class="card hint">暂无符合筛选条件的任务。</div>`}
    </section>
  `;
}

function select(id, values, selected) {
  return `<select id="${id}">${values.map((value) => `<option ${value === selected ? "selected" : ""}>${value}</option>`).join("")}</select>`;
}

function taskCard(task) {
  const progress = Math.round((task.done / task.total) * 100);
  const disabled = task.status === "已完成" && state.user.role === "student" ? "disabled" : "";

  return `
    <article class="card task-card">
      <h3>${task.name}</h3>
      <div class="meta-row">
        <span class="badge blue">${task.type}</span>
        <span class="badge">${task.total} 条</span>
        <span class="badge ${task.status === "已完成" ? "green" : "amber"}">${task.status}</span>
        <span class="badge">截止 ${task.deadline}</span>
      </div>
      <div class="progress"><span class="${progress === 100 ? "green" : ""}" style="width:${progress}%"></span></div>
      <div class="hint">已完成 ${task.done}/${task.total}，难度：${task.difficulty}</div>
      <div class="button-row" style="margin-top:14px">
        <button class="btn" data-start-task="${task.id}" ${disabled}>${task.status === "已完成" ? "查看结果" : "开始标注"}</button>
        <button class="btn secondary" data-page="instructions">说明</button>
      </div>
    </article>
  `;
}

function instructionsPage() {
  return `
    <div class="page-title">
      <h2>标注说明页</h2>
      <button class="btn" data-start-task="${state.workTaskId}">进入标注</button>
    </div>
    <section class="grid" style="grid-template-columns:1fr 1fr">
      <article class="card">
        <h3>文本实体标注规范</h3>
        <p class="hint">选中文本片段后，为人名、地名、机构名选择对应标签。标签边界应完整覆盖实体，不包含多余标点。</p>
        <table class="table">
          <tr><th>标签</th><th>含义</th><th>示例</th></tr>
          <tr><td>PER</td><td>人名</td><td>张三、李四</td></tr>
          <tr><td>LOC</td><td>地名</td><td>北京、上海</td></tr>
          <tr><td>ORG</td><td>机构名</td><td>清华大学、XX 公司</td></tr>
        </table>
      </article>
      <article class="card">
        <h3>多模态标注规则</h3>
        <p class="hint">图像任务使用矩形框圈选目标；音频任务播放后录入转写内容；视频任务记录关键帧与目标描述。</p>
        <p class="hint">保存表示暂存草稿，提交当前表示进入待审核，全部提交会自动更新个人进度并生成审核队列。</p>
      </article>
    </section>
  `;
}

function annotationPage() {
  const task = state.data.tasks.find((item) => item.id === state.workTaskId) || state.data.tasks[0];
  state.annotationType = state.annotationType || task.type;

  return `
    <div class="app-shell">
      <header class="topbar">
        <div class="brand">数据标注实训平台</div>
        <div class="hint" style="color:#dce9f5">正在进行：${task.name}</div>
        <div class="user-area">
          <button data-page="tasks">返回任务列表</button>
        </div>
      </header>
      <main class="annotation-shell">
        <aside class="annotation-panel">
          <h3>任务说明</h3>
          <p class="hint">标注文本中的人名、地名、机构名，其他模态请按目标区域或转写内容提交。</p>
          <h3>标注规范</h3>
          <ul>
            <li>人名：PER</li>
            <li>地名：LOC</li>
            <li>机构名：ORG</li>
          </ul>
          <h3>数据列表</h3>
          <div class="sample-list">
            ${[1, 2, 3].map((index) => `<button class="sample-item ${state.activeSample === index - 1 ? "active" : ""}" data-sample="${index - 1}">${index}. ${task.type}数据示例...</button>`).join("")}
          </div>
        </aside>
        <section class="workbench">
          <div class="tabs">
            ${annotationTypes.map((type) => `<button class="${state.annotationType === type ? "active" : ""}" data-annotation-type="${type}">${type}标注</button>`).join("")}
          </div>
          <div class="canvas-area">${annotationCanvas()}</div>
          <div class="footer-actions">
            <button class="btn secondary">上一条</button>
            <button class="btn secondary">下一条</button>
            <button class="btn warning" id="saveDraft">暂存</button>
            <button class="btn" id="submitCurrent">提交当前</button>
            <button class="btn" id="submitAll">全部提交</button>
          </div>
        </section>
        <aside class="toolbox">
          <h3>标注工具</h3>
          <div class="hint" style="font-weight:800;margin-bottom:10px">实体标签</div>
          <button class="tag-button per" data-tag="PER">PER（人名）</button>
          <button class="tag-button loc" data-tag="LOC">LOC（地名）</button>
          <button class="tag-button org" data-tag="ORG">ORG（机构）</button>
          <h3 style="margin-top:28px">当前结果</h3>
          <div class="shortcut" id="annotationResult">
            ${state.annotations.length ? state.annotations.map((item) => `${item.label}：${item.text}`).join("<br />") : "暂无新增标注"}
          </div>
          <h3 style="margin-top:28px">快捷键</h3>
          <div class="shortcut">
            Ctrl+1：PER<br />
            Ctrl+2：LOC<br />
            Ctrl+3：ORG<br />
            Ctrl+S：保存
          </div>
        </aside>
      </main>
    </div>
  `;
}

function annotationCanvas() {
  if (state.annotationType === "图像") {
    return `<div class="image-stage"><div class="box"></div><strong>图像标注区域（拖拽框选目标并选择标签）</strong></div>`;
  }

  if (state.annotationType === "音频") {
    return `<div class="media-stage"><strong>音频波形播放器</strong><input class="media-input" placeholder="在此输入转写文本..." /></div>`;
  }

  if (state.annotationType === "视频") {
    return `<div class="media-stage"><strong>视频播放器（带帧进度条）</strong><input class="media-input" placeholder="记录关键帧和目标描述..." /></div>`;
  }

  return `
    <div class="text-sample" id="textSample">
      这是一段标注示例文本，
      <span class="entity per">张三 <small>PER</small></span>
      在
      <span class="entity loc">北京 <small>LOC</small></span>
      的
      <span class="entity org">清华大学 <small>ORG</small></span>
      上学。<br />
      <span class="hint">选中文字后点击右侧标签即可完成标注。</span>
    </div>
  `;
}

function historyPage() {
  return `
    <div class="page-title"><h2>标注历史</h2></div>
    <section class="card">
      <table class="table">
        <tr><th>任务名称</th><th>模态</th><th>标注量</th><th>状态</th><th>反馈</th></tr>
        ${state.data.submissions.filter((item) => item.student === state.user.name).map((item) => `
          <tr><td>${item.task}</td><td>${item.type}</td><td>${item.amount} 条</td><td>${item.status}</td><td>${item.feedback || "等待审核"}</td></tr>
        `).join("")}
      </table>
    </section>
  `;
}

function progressPage() {
  const mine = state.data.submissions.filter((item) => item.student === state.user.name);
  const reviewed = reviewedSubmissions();

  return `
    <div class="page-title"><h2>个人进度与成绩看板</h2></div>
    <section class="card" style="margin-bottom:18px">
      <h3>个人信息</h3>
      <p class="hint">
        姓名：${state.user.name}<br />
        学号：${state.user.account}<br />
        院校：XX职业技术学院<br />
        班级：人工智能2301班
      </p>
    </section>
    <section class="grid stats-grid" style="margin-bottom:18px">
      ${statCard(mine.reduce((sum, item) => sum + item.amount, 0), "累计标注量")}
      ${statCard(reviewed.length, "已审核任务")}
      ${statCard(Math.round(reviewed.reduce((sum, item) => sum + item.score, 0) / Math.max(reviewed.length, 1)), "平均成绩")}
      ${statCard(state.data.tasks.filter((task) => task.status === "已完成").length, "完成实训")}
    </section>
    <section class="card">
      <h3>实训成绩</h3>
      <table class="table">
        <tr><th>实训名称</th><th>模态</th><th>标注量</th><th>准确率</th><th>得分</th><th>状态</th></tr>
        ${mine.map((item) => `<tr><td>${item.task}</td><td>${item.type}</td><td>${item.amount}条</td><td>${item.accuracy || "-"}${item.accuracy ? "%" : ""}</td><td>${item.score || "-"}</td><td>${item.status}</td></tr>`).join("")}
      </table>
    </section>
  `;
}

function reviewPage() {
  const queue = state.data.submissions.filter((item) => state.user.role === "student" ? item.student === state.user.name : true);

  return `
    <div class="page-title">
      <h2>审核反馈</h2>
      <span class="badge amber">${queue.filter((item) => item.status === "待审核").length} 条待审核</span>
    </div>
    <section class="review-list">
      ${queue.map((item) => `
        <article class="card review-card">
          <div>
            <div class="meta-row">
              <span class="badge blue">${item.type}</span>
              <span class="badge ${item.status === "已审核" ? "green" : "amber"}">${item.status}</span>
              <span class="badge">${item.student}</span>
            </div>
            <h3>${item.task}</h3>
            <p class="hint">提交量：${item.amount} 条；得分：${item.score || "待评分"}；反馈：${item.feedback || "暂无反馈"}</p>
            ${state.user.role !== "student" ? `
              <div class="feedback-box">
                <input id="feedback-${item.id}" value="${item.feedback}" placeholder="输入审核意见" />
                <button class="btn success" data-pass="${item.id}">通过</button>
                <button class="btn danger" data-reject="${item.id}">退回</button>
              </div>
            ` : ""}
          </div>
        </article>
      `).join("")}
    </section>
  `;
}

function statsPage() {
  const totalAmount = state.data.submissions.reduce((sum, item) => sum + item.amount, 0);
  const reviewed = state.data.submissions.filter((item) => item.status === "已审核").length;

  return `
    <div class="page-title">
      <h2>后台统计页</h2>
      <button class="btn secondary">导出报表</button>
    </div>
    <section class="grid stats-grid" style="margin-bottom:18px">
      ${statCard(state.data.projects.length, "项目总数")}
      ${statCard(state.data.tasks.length, "任务总数")}
      ${statCard(totalAmount, "提交标注量")}
      ${statCard(reviewed, "已审核提交")}
    </section>
    <section class="grid" style="grid-template-columns:1.1fr .9fr">
      <article class="card">
        <h3>各模态提交量</h3>
        <div class="chart">
          ${annotationTypes.map((type) => {
            const amount = state.data.submissions.filter((item) => item.type === type).reduce((sum, item) => sum + item.amount, 0);
            return `<div class="bar"><span style="height:${Math.max(amount, 12)}px"></span><b>${amount}</b><small>${type}</small></div>`;
          }).join("")}
        </div>
      </article>
      <article class="card">
        <h3>班级任务进展</h3>
        <table class="table">
          <tr><th>任务</th><th>完成率</th><th>状态</th></tr>
          ${state.data.tasks.map((task) => `<tr><td>${task.name}</td><td>${Math.round(task.done / task.total * 100)}%</td><td>${task.status}</td></tr>`).join("")}
        </table>
      </article>
    </section>
  `;
}

function reviewedSubmissions() {
  return state.data.submissions.filter((item) => item.student === state.user?.name && item.status === "已审核");
}
