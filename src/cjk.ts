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
  [0xa960, 0xa97f], // 谚文字母扩展 A（Hangul Jamo Extended-A）
  [0xac00, 0xd7a3], // 谚文音节
  [0xd7b0, 0xd7ff], // 谚文字母扩展 B（Hangul Jamo Extended-B）
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

export interface MaskResult {
  masked: string
  map: Map<string, { orig: string; pair: string }>
}

export function mask(src: string): MaskResult {
  const map: MaskResult['map'] = new Map()
  let next = PUA_START
  let masked = ''
  for (const ch of src) {
    const c = ch.codePointAt(0)!
    if (c >= PUA_START && c <= PUA_END) {
      throw new Error('输入包含 Unicode 私有区（PUA）字符，无法处理')
    }
    if (isWide(ch)) {
      if (next + 1 > PUA_END) {
        throw new Error('图表过大：宽字符数量超出补偿层容量（约 3200 个），请拆分图表')
      }
      const a = String.fromCharCode(next++)
      const b = String.fromCharCode(next++)
      map.set(a, { orig: ch, pair: b })
      masked += a + b
    } else {
      masked += ch
    }
  }
  return { masked, map }
}

export function unmask(rendered: string, map: MaskResult['map']): string {
  const pairChars = new Set<string>()
  for (const { pair } of map.values()) pairChars.add(pair)
  let out = ''
  const chars = [...rendered]
  for (let i = 0; i < chars.length; i++) {
    const info = map.get(chars[i])
    if (info) {
      out += info.orig
      if (chars[i + 1] === info.pair) i++
    } else if (pairChars.has(chars[i])) {
      out += ' ' // 占位符对被布局拆开时的兜底
    } else {
      out += chars[i]
    }
  }
  return out
}
