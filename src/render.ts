import { renderMermaidASCII } from 'beautiful-mermaid'
import { mask, unmask } from './cjk'

export interface RenderOptions {
  ascii?: boolean
  color?: 'auto' | 'none' | 'ansi16' | 'ansi256' | 'truecolor'
}

export function render(src: string, options: RenderOptions = {}): string {
  if (src.trim() === '') throw new Error('输入为空')
  const { masked, map } = mask(src)
  const rendered = renderMermaidASCII(masked, {
    useAscii: options.ascii ?? false,
    colorMode: options.color ?? 'auto',
  })
  return unmask(rendered, map)
}
