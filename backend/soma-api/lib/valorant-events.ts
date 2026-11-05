// 无畏契约轮盘事件池 —— 编辑这个文件即可增删改效果。
//
// 每行一个效果：
//   id     稳定编号，已有效果不要改 id（历史记录靠它统计）；新增效果用新 id。
//   name   轮盘上显示的文字。
//   tier   难度：white 白（简单） / purple 紫（中等） / gold 金（最难）。
//   pistol 手枪局能否抽到；写 false 表示手枪局不会抽到（例如需要买枪的效果）。
//          不写默认为 true。
//
// 改完后把 EVENT_POOL_VERSION 加 1 并部署。新开的对局使用新事件池；
// 进行中的对局和已保存的历史不受影响。前端无需重新部署。

export type Tier = "white" | "purple" | "gold";
export type WheelEvent = {
  id: string;
  name: string;
  tier: Tier;
  pistol?: boolean;
};

export const EVENT_POOL_VERSION = 3;

export const EVENTS: WheelEvent[] = [
  { id: "v2-01", name: "全程下蹲", tier: "purple" },
  { id: "v2-02", name: "全程跳跃", tier: "gold" },
  { id: "v2-03", name: "不能松开W", tier: "purple" },
  { id: "v2-04", name: "不能按W", tier: "purple" },
  { id: "v2-05", name: "全程静步", tier: "white" },
  { id: "v2-06", name: "不能静步", tier: "white" },
  { id: "v2-07", name: "只能唱歌", tier: "white" },
  { id: "v2-08", name: "只能说英文", tier: "white" },
  { id: "v2-09", name: "只能说“好”", tier: "white" },
  { id: "v2-10", name: "只能说“我不”", tier: "white" },
  { id: "v2-11", name: "只能发出“嗯”音", tier: "white" },
  { id: "v2-12", name: "不能使用技能", tier: "purple" },
  { id: "v2-13", name: "鼠标左右键互换", tier: "gold" },
  { id: "v2-14", name: "移动左右键互换", tier: "gold" },
  { id: "v2-15", name: "移动前后键互换", tier: "purple" },
  { id: "v2-16", name: "只能用手枪", tier: "purple", pistol: false },
  { id: "v2-17", name: "只能用喷子", tier: "purple", pistol: false },
  { id: "v2-18", name: "只能用机枪", tier: "white", pistol: false },
  { id: "v2-19", name: "只能用狙", tier: "purple", pistol: false },
  { id: "v2-20", name: "只能用刀", tier: "gold" },
  { id: "v2-21", name: "灵敏度/2", tier: "purple" },
  { id: "v2-22", name: "灵敏度*2", tier: "purple" },
  { id: "v2-23", name: "不能买枪（队友可发）", tier: "white", pistol: false },
  { id: "v2-24", name: "必须由你下/拆包", tier: "white" },
  { id: "v2-25", name: "你不能下/拆包", tier: "white" },
  { id: "v2-26", name: "开火键绑丢枪", tier: "gold" },
  { id: "v2-27", name: "开火键绑跳跃", tier: "gold" },
];
