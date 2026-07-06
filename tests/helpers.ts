import { displayWidth } from '../src/cjk'

const BOX_TOP_END = new Set(['┐', '╮', '◇', '◯'])

/**
 * 对齐性质检查：同缩进下，框顶边行与紧随的内容行显示宽度必须一致。
 * 返回问题描述列表，空数组表示全部对齐。
 */
export function checkAlignment(output: string): string[] {
  const lines = output.split('\n').map((l) => l.replace(/\s+$/, ''))
  const problems: string[] = []
  for (let i = 0; i < lines.length - 1; i++) {
    const a = lines[i]
    const b = lines[i + 1]
    const ta = a.trimStart()
    const tb = b.trimStart()
    const indentA = a.length - ta.length
    const indentB = b.length - tb.length
    if (
      indentA === indentB &&
      BOX_TOP_END.has(ta.at(-1) ?? '') &&
      tb.startsWith('│') &&
      tb.endsWith('│')
    ) {
      const wa = displayWidth(a)
      const wb = displayWidth(b)
      if (wa !== wb) {
        problems.push(`第 ${i + 1}-${i + 2} 行显示宽度不一致（${wa} vs ${wb}）：\n${a}\n${b}`)
      }
    }
  }
  return problems
}
