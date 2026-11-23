// One transmit slot per call. At 01:40 the operator must leave the radio.
export const windowMinutes = 4;
export const callMinutes = 2;

export const contacts = [
  {
    name: '学校',
    savedMinutes: 3,
    early: '小禾还在电台旁。她说临水的西门已经堵死。你让她把校旗交给老师，挂到高处的东梯口，给下一艘艇指路。',
    earlyAfter: '校旗标出了东梯口。第二艘艇少绕了三分钟，先接上了负责断后的老师。',
    late: '小禾刚把对讲机交给老师。老师说西门早已堵死，校旗还在自己手里。他来不及换位置，只能让下一艘艇沿外墙找东梯。',
  },
  {
    name: '水厂',
    savedMinutes: 2,
    early: '老周接到水厂的手摇闸图纸。值班员指出上层还有一组锚环，安排两名工人带工具去接应。你听见他在对讲机那头把门踢开。',
    earlyAfter: '水厂的人提前清开了闸旁的检修梯，闸边撤离少花了两分钟。许遥事后才发现，老周把她的名字写在了这支小队最上面。',
    late: '厂里的图纸送到了。上层有锚环，但带工具的人已经封门撤走。老周只能和许遥用手头的设备。',
  },
  {
    name: '救援艇',
    savedMinutes: 4,
    early: '船长报出油量：还能跑一趟。他问要停哪儿待命。你把背风的东坡坐标报给他。他关掉远频，把救生衣全搬到了船头。',
    earlyAfter: '艇在东坡待命，接到信号时没有再横穿主流，提前四分钟靠上待命点。船长空出艇尾，给安置点多带了一趟急救箱。',
    late: '船长已经驶离东坡，去避开主河道里的漂木。他只能从下游回转，并提醒你别把这艘艇算成眼下就能到的船。',
  },
];

export function minutesLeft(calls) {
  return windowMinutes - calls.length * callMinutes;
}

export function rescueMinutes(calls) {
  return (contacts[calls[0]]?.savedMinutes ?? 0) - calls.length * callMinutes;
}
