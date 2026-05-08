import { seed } from "./data.js";

const storageKey = "annotationTrainingData";

export const state = {
  user: null,
  page: "home",
  workTaskId: "t1",
  annotationType: "文本",
  activeSample: 0,
  selectedText: "",
  filterType: "全部模态",
  filterStatus: "全部状态",
  filterDifficulty: "全部难度",
  annotations: [],
  data: loadData()
};

export function loadData() {
  const saved = localStorage.getItem(storageKey);
  if (!saved) return clone(seed);

  try {
    return JSON.parse(saved);
  } catch {
    return clone(seed);
  }
}

export function saveData() {
  localStorage.setItem(storageKey, JSON.stringify(state.data));
}

export function resetData() {
  localStorage.removeItem(storageKey);
  state.data = clone(seed);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}
