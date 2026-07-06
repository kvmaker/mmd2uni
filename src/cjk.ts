// CJK 双宽补偿层：宽字符判定、显示宽度、PUA 占位符转换
export const PUA_START = 0xe000
export const PUA_END = 0xf8ff

const EMOJI_RE = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/u

// Unicode East Asian Width 为 W/F 的主要区段
const WIDE_RANGES: Array<[number, number]> = [
  [0x1100, 0x115f], // 谚文字母
  [0x2e80, 0x303e], // CJK 部首 / 康熙部首 / CJK 符号与标点
  [0x3041, 0x33ff], // 假名 / 注音 / 围字 / CJK 兼容
  [0x3400, 0x4dbf], // CJK 扩展 A
  [0x4e00, 0x9fff], // CJK 统一表意文字
  [0xa000, 0xa4cf], // 彝文
  [0xac00, 0xd7a3], // 谚文音节
  [0xf900, 0xfaff], // CJK 兼容表意文字
  [0xfe30, 0xfe4f], // CJK 兼容形式
  [0xff00, 0xff60], // 全角形式
  [0xffe0, 0xffe6], // 全角符号
  [0x20000, 0x3fffd], // CJK 扩展 B 及以后
]

export function isWide(ch: string): boolean {
  const c = ch.codePointAt(0)
  if (c === undefined) return false
  if (WIDE_RANGES.some(([lo, hi]) => c >= lo && c <= hi)) return true
  return EMOJI_RE.test(ch)
}

export function displayWidth(s: string): number {
  let w = 0
  for (const ch of s) w += isWide(ch) ? 2 : 1
  return w
}
