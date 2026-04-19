const outerInnerOptions = [
  { value: '外', label: '外螺纹' },
  { value: '内', label: '内螺纹' },
];

// 公制螺纹输入
const metricInputs = [
  { id: 'D', label: '公称直径', type: 'number', default: 20, placeholder: '如：20' },
  { id: 'P', label: '螺距', type: 'number', default: 2.5, placeholder: '如：2.5' },
  { id: 'type', label: '类型', type: 'select', default: '外', options: outerInnerOptions },
];

// 英制螺纹输入
const inchInputs = [
  { id: 'D', label: '公称直径(英寸)', type: 'number', default: 1, placeholder: '如：1' },
  { id: 'TPI', label: '每英寸牙数', type: 'number', default: 8, placeholder: '如：8' },
  { id: 'type', label: '类型', type: 'select', default: '外', options: outerInnerOptions },
];

// 通用输出
const threadOutputs = [
  { id: 'major', label: '大径' },
  { id: 'pitch_d', label: '中径' },
  { id: 'minor', label: '小径' },
  { id: 'depth', label: '牙深' },
];

export const threadTypes = [
  { id: 'gongzhi', title: '公制螺纹', diagram: 'static/thread/yxlw1.png', inputs: metricInputs, outputs: threadOutputs },
  { id: 'yingzhi', title: '英制螺纹', diagram: 'static/thread/yxlw2.png', inputs: inchInputs, outputs: threadOutputs },
  { id: 'YzhiZ', title: '英制锥螺纹', diagram: 'static/thread/yxlw2.png', inputs: inchInputs, outputs: threadOutputs },
  { id: 'MzhiZ', title: '美制锥螺纹', diagram: 'static/thread/yxlw2.png', inputs: inchInputs, outputs: threadOutputs },
  { id: 'MeiZhiNPTF', title: '美制锥螺纹NPTF', diagram: 'static/thread/yxlw2.png', inputs: inchInputs, outputs: threadOutputs },
  { id: 'meizhi', title: '美制螺纹', diagram: 'static/thread/yxlw1.png', inputs: inchInputs, outputs: threadOutputs },
  { id: 'meizhiun', title: '美制螺纹UN', diagram: 'static/thread/yxlw1.png', inputs: inchInputs, outputs: threadOutputs },
  { id: 'ZuoYouJieDao', title: '左右借刀', diagram: 'static/thread/dl1j.png', inputs: metricInputs, outputs: threadOutputs },
  { id: 'ZuoYouJieDaoJ', title: '左右借刀(旧)', diagram: 'static/thread/dl1j.png', inputs: metricInputs, outputs: threadOutputs },
  { id: 'LuoWenFenCeng', title: '螺纹分层', diagram: 'static/thread/yxlw1.png', inputs: metricInputs, outputs: threadOutputs },
  { id: 'Tluowen', title: '公制T螺纹', diagram: 'static/thread/typtw.png', inputs: metricInputs, outputs: threadOutputs },
  { id: 'TluowenXIN', title: '公制T螺纹(新)', diagram: 'static/thread/typtw.png', inputs: metricInputs, outputs: threadOutputs },
  { id: 'biaozhunaikemu', title: '标准艾克母', diagram: 'static/thread/bzptw.png', inputs: metricInputs, outputs: threadOutputs },
  { id: 'feibiaoaikemu', title: '非标艾克母', diagram: 'static/thread/bzptw.png', inputs: metricInputs, outputs: threadOutputs },
  { id: 'AiYaAiKeMu', title: '矮牙艾克母', diagram: 'static/thread/bzptw.png', inputs: metricInputs, outputs: threadOutputs },
  { id: 'gongzhiwogan', title: '公制蜗杆', diagram: 'static/thread/yglw.png', inputs: metricInputs, outputs: threadOutputs },
  { id: 'GongZhiWoGanXin', title: '公制蜗杆(新)', diagram: 'static/thread/yglw.png', inputs: metricInputs, outputs: threadOutputs },
  { id: 'ShiYouZuanGan', title: '石油钻杆螺纹', diagram: 'static/thread/yxlw2.png', inputs: inchInputs, outputs: threadOutputs },
  { id: 'YHluowen', title: '凹螺纹', diagram: 'static/thread/yhlw.png', inputs: metricInputs, outputs: threadOutputs },
  { id: 'YuanHuLuoWen', title: '凹螺纹(新)', diagram: 'static/thread/yhlw.png', inputs: metricInputs, outputs: threadOutputs },
  { id: 'tuluowen', title: '凸圆弧螺纹', diagram: 'static/thread/atlw.png', inputs: metricInputs, outputs: threadOutputs },
  { id: 'AoTuYuanHu', title: '凹凸圆弧螺纹', diagram: 'static/thread/atlw.png', inputs: metricInputs, outputs: threadOutputs },
  { id: 'Yuanhujuchi', title: '圆弧锯齿螺纹', diagram: 'static/thread/atlw.png', inputs: metricInputs, outputs: threadOutputs },
  { id: 'LuoWenDaoJiao', title: '螺纹倒角', diagram: 'static/thread/lwdj.png', inputs: metricInputs, outputs: threadOutputs },
  { id: 'JuXingLuoWen', title: 'R角矩形螺纹', diagram: 'static/thread/juxing.png', inputs: metricInputs, outputs: threadOutputs },
  { id: 'RenYijiaoDu', title: '任意角度螺纹', diagram: 'static/thread/yxlw1.png', inputs: metricInputs, outputs: threadOutputs },
  { id: 'QiTaXiTong', title: '其他宏车螺纹', diagram: 'static/thread/yxlw1.png', inputs: metricInputs, outputs: threadOutputs },
];
