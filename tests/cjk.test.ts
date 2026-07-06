import { describe, it, expect } from 'vitest'
import { isWide, displayWidth } from '../src/cjk'

describe('isWide', () => {
  it('汉字为宽', () => expect(isWide('中')).toBe(true))
  it('CJK 扩展 B 为宽', () => expect(isWide('𠀀')).toBe(true))
  it('假名为宽', () => expect(isWide('あ')).toBe(true))
  it('谚文为宽', () => expect(isWide('한')).toBe(true))
  it('全角标点为宽', () => expect(isWide('，')).toBe(true))
  it('全角字母为宽', () => expect(isWide('Ａ')).toBe(true))
  it('emoji 为宽', () => expect(isWide('🚀')).toBe(true))
  it('ASCII 为窄', () => expect(isWide('A')).toBe(false))
  it('制表符字符为窄', () => expect(isWide('┌')).toBe(false))
  it('箭头 ▼ 为窄', () => expect(isWide('▼')).toBe(false))
  it('EAW Ambiguous ※ 按窄处理', () => expect(isWide('※')).toBe(false))
  it('EAW Ambiguous … 按窄处理', () => expect(isWide('…')).toBe(false))
})

describe('displayWidth', () => {
  it('纯中文', () => expect(displayWidth('中文')).toBe(4))
  it('中英混排', () => expect(displayWidth('HTTP 请求')).toBe(9))
  it('空串', () => expect(displayWidth('')).toBe(0))
  it('制表符边框', () => expect(displayWidth('┌──┐')).toBe(4))
})
