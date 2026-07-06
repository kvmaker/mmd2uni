import { describe, it, expect } from 'vitest'
import { isWide, displayWidth, mask, unmask, PUA_START } from '../src/cjk'

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

describe('mask', () => {
  it('宽字符替换为 2 个 PUA 占位符', () => {
    const { masked } = mask('中')
    expect([...masked]).toHaveLength(2)
    const codes = [...masked].map((c) => c.codePointAt(0)!)
    expect(codes.every((c) => c >= PUA_START)).toBe(true)
  })
  it('窄字符原样保留', () => {
    const { masked } = mask('A-中')
    expect(masked.startsWith('A-')).toBe(true)
  })
  it('重复宽字符使用不同占位符', () => {
    const { masked } = mask('中中')
    expect(new Set([...masked]).size).toBe(4)
  })
  it('拒绝含 PUA 的输入', () => {
    expect(() => mask(String.fromCharCode(PUA_START))).toThrow(/私有区/)
  })
  it('超出容量报错', () => {
    expect(() => mask('中'.repeat(3201))).toThrow(/图表过大/)
    expect(() => mask('中'.repeat(3200))).not.toThrow()
  })
})

describe('unmask', () => {
  it('mask→unmask 往返恒等', () => {
    const src = 'graph TD\n  A[开始] --> B{余额是否充足}'
    const { masked, map } = mask(src)
    expect(unmask(masked, map)).toBe(src)
  })
  it('落单的配对占位符还原为空格', () => {
    const { map } = mask('中')
    const pairChar = [...map.values()][0].pair
    expect(unmask(`x${pairChar}y`, map)).toBe('x y')
  })
  it('无占位符的文本原样通过', () => {
    const { map } = mask('中')
    expect(unmask('┌──┐', map)).toBe('┌──┐')
  })
})
