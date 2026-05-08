export const seed = {
  projects: [
    {
      id: "p1",
      name: "文本实体标注实训",
      type: "文本",
      owner: "李老师",
      deadline: "03-30",
      progress: 64,
      status: "进行中",
      description: "围绕人名、地名、机构名开展实体边界与类型识别训练。"
    },
    {
      id: "p2",
      name: "图像目标检测实训",
      type: "图像",
      owner: "王老师",
      deadline: "04-05",
      progress: 35,
      status: "进行中",
      description: "使用矩形框标出目标区域，并为每个目标选择标签。"
    },
    {
      id: "p3",
      name: "语音转写标注实训",
      type: "音频",
      owner: "赵老师",
      deadline: "03-28",
      progress: 100,
      status: "已完成",
      description: "播放音频后录入转写文本，检查语义完整性和标点。"
    }
  ],
  tasks: [
    { id: "t1", projectId: "p1", name: "文本实体标注实训（入门）", type: "文本", total: 50, done: 22, deadline: "03-30", difficulty: "入门", status: "进行中" },
    { id: "t2", projectId: "p2", name: "图像目标检测实训（进阶）", type: "图像", total: 100, done: 35, deadline: "04-05", difficulty: "进阶", status: "进行中" },
    { id: "t3", projectId: "p3", name: "语音转写标注实训（入门）", type: "音频", total: 30, done: 30, deadline: "03-28", difficulty: "入门", status: "已完成" },
    { id: "t4", projectId: "p1", name: "视频关键帧标注实训", type: "视频", total: 40, done: 12, deadline: "04-12", difficulty: "综合", status: "进行中" }
  ],
  submissions: [
    { id: "s1", student: "张三", task: "语音转写标注实训（入门）", type: "音频", amount: 30, accuracy: 95, score: 95, status: "已审核", feedback: "转写完整，少量标点可再统一。" },
    { id: "s2", student: "张三", task: "文本分类标注实训", type: "文本", amount: 100, accuracy: 89, score: 89, status: "已审核", feedback: "类别判断稳定，长文本边界需复核。" },
    { id: "s3", student: "李四", task: "文本实体标注实训（入门）", type: "文本", amount: 18, accuracy: 0, score: 0, status: "待审核", feedback: "" },
    { id: "s4", student: "王五", task: "图像目标检测实训（进阶）", type: "图像", amount: 28, accuracy: 0, score: 0, status: "待审核", feedback: "" }
  ]
};

export const roles = {
  student: "学生",
  assistant: "助教",
  teacher: "教师"
};

export const iconText = {
  文本: "文",
  图像: "图",
  音频: "音",
  视频: "视"
};

export const annotationTypes = ["文本", "图像", "音频", "视频"];

export const filterOptions = {
  type: ["全部模态", "文本", "图像", "音频", "视频"],
  status: ["全部状态", "进行中", "已完成"],
  difficulty: ["全部难度", "入门", "进阶", "综合"]
};
