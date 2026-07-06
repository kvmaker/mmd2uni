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

  // 引擎附带能力：这些类型由 beautiful-mermaid 原生支持，
  // 冒烟测试仅断言「能渲染且产出结构」，不纳入 golden 基线（上游任何微调都会破坏字节比对）。
  // 中文对齐性质由 flowchart/sequence 的 golden 基线保证，这里不重复断言。
  describe.each([
    ['classDiagram', 'classDiagram\n  class Animal\n  Animal: +name\n  class Dog\n  Dog <|-- Animal'],
    ['erDiagram', 'erDiagram\n  CUSTOMER ||--o{ ORDER : places'],
    ['stateDiagram-v2', 'stateDiagram-v2\n  [*] --> Active\n  Active --> Inactive'],
    ['xychart-beta', 'xychart-beta\n  title T\n  x-axis [1,2,3]\n  bar [10,20,30]'],
  ])('%s 可渲染', (_name, src) => {
    it('不抛错且产出含边框的输出', () => {
      const out = render(src, { color: 'none' })
      expect(out.length).toBeGreaterThan(0)
      expect(/[┌│+]/.test(out)).toBe(true)
    })
  })
})
