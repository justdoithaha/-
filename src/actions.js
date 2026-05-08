import { roles } from "./data.js";
import { saveData, state } from "./store.js";
import { $, toast } from "./utils.js";

export function bindEvents(render) {
  const loginForm = $("#loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (event) => login(event, render));
    return;
  }

  bindPageLinks(render);
  bindFilters(render);
  bindAnnotationControls(render);
  bindReviewControls(render);

  $("#logoutBtn")?.addEventListener("click", () => {
    state.user = null;
    state.page = "home";
    render();
  });
}

export function bindKeyboard(render) {
  document.addEventListener("keydown", (event) => {
    if (!state.user || state.page !== "annotation") return;

    if (event.ctrlKey && event.key.toLowerCase() === "s") {
      event.preventDefault();
      toast("草稿已暂存");
    }

    if (event.ctrlKey && ["1", "2", "3"].includes(event.key)) {
      event.preventDefault();
      addAnnotation(["PER", "LOC", "ORG"][Number(event.key) - 1], render);
    }
  });
}

function login(event, render) {
  event.preventDefault();

  const role = $("#role").value;
  const account = $("#account").value.trim() || "20230101001";
  const roleName = role === "teacher" ? "教师" : role === "assistant" ? "助教" : "学生";

  state.user = {
    role,
    account,
    name: role === "student" ? "张三" : roleName
  };
  state.page = role === "teacher" ? "stats" : "home";

  render();
  toast(`已以${roles[role]}身份登录`);
}

function bindPageLinks(render) {
  document.querySelectorAll("[data-page]").forEach((button) => {
    button.addEventListener("click", () => {
      state.page = button.dataset.page;
      render();
    });
  });
}

function bindFilters(render) {
  ["filterType", "filterStatus", "filterDifficulty"].forEach((id) => {
    const el = $("#" + id);
    if (!el) return;

    el.addEventListener("change", () => {
      state[id] = el.value;
      render();
    });
  });
}

function bindAnnotationControls(render) {
  document.querySelectorAll("[data-start-type]").forEach((button) => {
    button.addEventListener("click", () => {
      state.annotationType = button.dataset.startType;
      const task = state.data.tasks.find((item) => item.type === state.annotationType);
      state.workTaskId = task?.id || "t1";
      state.page = "annotation";
      render();
    });
  });

  document.querySelectorAll("[data-start-task]").forEach((button) => {
    button.addEventListener("click", () => {
      const task = state.data.tasks.find((item) => item.id === button.dataset.startTask);
      state.workTaskId = task.id;
      state.annotationType = task.type;
      state.page = "annotation";
      render();
    });
  });

  document.querySelectorAll("[data-annotation-type]").forEach((button) => {
    button.addEventListener("click", () => {
      state.annotationType = button.dataset.annotationType;
      render();
    });
  });

  document.querySelectorAll("[data-sample]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeSample = Number(button.dataset.sample);
      render();
    });
  });

  document.querySelectorAll("[data-tag]").forEach((button) => {
    button.addEventListener("click", () => addAnnotation(button.dataset.tag, render));
  });

  $("#textSample")?.addEventListener("mouseup", () => {
    const text = window.getSelection().toString().trim();
    if (text) state.selectedText = text;
  });

  $("#saveDraft")?.addEventListener("click", () => toast("草稿已暂存"));
  $("#submitCurrent")?.addEventListener("click", () => submitTask(false, render));
  $("#submitAll")?.addEventListener("click", () => submitTask(true, render));
}

function bindReviewControls(render) {
  document.querySelectorAll("[data-pass]").forEach((button) => {
    button.addEventListener("click", () => audit(button.dataset.pass, "通过", render));
  });

  document.querySelectorAll("[data-reject]").forEach((button) => {
    button.addEventListener("click", () => audit(button.dataset.reject, "退回", render));
  });
}

function submitTask(all, render) {
  const task = state.data.tasks.find((item) => item.id === state.workTaskId);
  if (!task) return;

  const amount = all ? Math.max(task.total - task.done, 1) : 1;
  task.done = Math.min(task.total, task.done + amount);
  task.status = task.done >= task.total ? "已完成" : "进行中";

  state.data.submissions.push({
    id: "s" + Date.now(),
    student: state.user.name,
    task: task.name,
    type: task.type,
    amount,
    accuracy: 0,
    score: 0,
    status: "待审核",
    feedback: ""
  });

  state.annotations = [];
  saveData();
  toast(all ? "已全部提交，等待审核反馈" : "已提交当前样本");

  state.page = all ? "history" : "annotation";
  render();
}

function addAnnotation(label, render) {
  const selected = window.getSelection().toString().trim() || state.selectedText;
  const text = selected || (state.annotationType === "文本" ? "未选中文本" : `${state.annotationType}目标`);

  state.annotations.push({ label, text });
  state.selectedText = "";

  render();
  toast(`已添加标签 ${label}`);
}

function audit(id, result, render) {
  const item = state.data.submissions.find((submission) => submission.id === id);
  if (!item) return;

  const feedback = $(`#feedback-${id}`)?.value.trim();
  item.feedback = feedback || (result === "通过" ? "标注质量达标。" : "请按标注说明修正边界后重新提交。");
  item.status = result === "通过" ? "已审核" : "需修改";
  item.accuracy = result === "通过" ? 92 : 70;
  item.score = result === "通过" ? 92 : 70;

  saveData();
  render();
  toast(result === "通过" ? "审核已通过" : "已退回修改");
}
