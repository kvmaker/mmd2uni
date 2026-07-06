import { describe, it, expect } from 'vitest'
import { render } from '../src/render'
import { checkAlignment } from './helpers'

const CN_FLOW = `graph TD
  A[开始] --> B{余额是否充足}
  B -->|是| C[扣款成功]
  B -->|否| D[提示余额不足]`

describe('render', () => {
  it('中文 flowchart 渲染且边框对齐', () => {
    const out = render(CN_FLOW, { color: 'none' })
    expect(out).toContain('开始')
    expect(out).toContain('余额是否充足')
    expect(out).toContain('┌')
    expect(checkAlignment(out)).toEqual([])
  })

  it('输出不含 PUA 占位符', () => {
    const out = render(CN_FLOW, { color: 'none' })
    for (const ch of out) {
      const c = ch.codePointAt(0)!
      expect(c < 0xe000 || c > 0xf8ff).toBe(true)
    }
  })

  it('ascii 模式使用 + - | 字符', () => {
    const out = render('graph LR\n  A --> B', { ascii: true, color: 'none' })
    expect(out).toContain('+')
    expect(out).not.toContain('┌')
  })

  it('color none 时输出无 ANSI 转义', () => {
    const out = render(CN_FLOW, { color: 'none' })
    expect(out).not.toContain('\x1b[')
  })

  it('空输入抛错', () => {
    expect(() => render('   \n  ')).toThrow(/输入为空/)
  })
})
