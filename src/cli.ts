import { parseArgs } from 'node:util'
import { existsSync, readFileSync } from 'node:fs'
import { render, type RenderOptions } from './render'
import pkg from '../package.json'

const COLORS = ['auto', 'none', 'ansi16', 'ansi256', 'truecolor'] as const
type Color = (typeof COLORS)[number]

const HELP = `mmd2uni — 将 mermaid 图表转换为终端 Unicode 字符图

用法：
  mmd2uni [选项] [文件]
  cat diagram.mmd | mmd2uni [选项]

选项：
  --ascii            使用纯 ASCII 字符（+ - | >）代替 Unicode 制表符
  --color <模式>     颜色输出：auto|none|ansi16|ansi256|truecolor（默认 auto）
  -h, --help         显示帮助
  -v, --version      显示版本号

退出码：
  0 成功    1 解析/渲染错误    2 用法错误
`

export interface CliResult {
  exitCode: number
  stdout: string
  stderr: string
}

export function runCli(argv: string[], readStdin: () => string | null): CliResult {
  let parsed: ReturnType<typeof parseArgs<{
    options: {
      ascii: { type: 'boolean'; default: false }
      color: { type: 'string'; default: 'auto' }
      help: { type: 'boolean'; short: 'h'; default: false }
      version: { type: 'boolean'; short: 'v'; default: false }
    }
    allowPositionals: true
  }>>
  try {
    parsed = parseArgs({
      args: argv,
      options: {
        ascii: { type: 'boolean', default: false },
        color: { type: 'string', default: 'auto' },
        help: { type: 'boolean', short: 'h', default: false },
        version: { type: 'boolean', short: 'v', default: false },
      },
      allowPositionals: true,
    })
  } catch (e) {
    return { exitCode: 2, stdout: '', stderr: `参数错误：${(e as Error).message}\n${HELP}` }
  }

  if (parsed.values.help) return { exitCode: 0, stdout: HELP, stderr: '' }
  if (parsed.values.version) return { exitCode: 0, stdout: `${pkg.version}\n`, stderr: '' }

  const color = parsed.values.color as string
  if (!(COLORS as readonly string[]).includes(color)) {
    return {
      exitCode: 2,
      stdout: '',
      stderr: `无效的 --color 值：${color}（可选：${COLORS.join('|')}）\n`,
    }
  }

  if (parsed.positionals.length > 1) {
    return { exitCode: 2, stdout: '', stderr: `只支持一个输入文件参数\n${HELP}` }
  }

  const target = parsed.positionals[0]
  let src: string
  if (target === undefined || target === '-') {
    const piped = readStdin()
    if (piped === null) {
      return { exitCode: 2, stdout: '', stderr: `缺少输入：请提供文件路径或通过管道输入\n${HELP}` }
    }
    src = piped
  } else {
    if (!existsSync(target)) {
      return { exitCode: 2, stdout: '', stderr: `文件不存在：${target}\n` }
    }
    try {
      src = readFileSync(target, 'utf8')
    } catch (e) {
      return { exitCode: 2, stdout: '', stderr: `无法读取文件：${target}（${(e as Error).message}）\n` }
    }
  }

  try {
    const out = render(src, {
      ascii: parsed.values.ascii as boolean,
      color: color as Color satisfies RenderOptions['color'],
    })
    return { exitCode: 0, stdout: out.endsWith('\n') ? out : `${out}\n`, stderr: '' }
  } catch (e) {
    return { exitCode: 1, stdout: '', stderr: `渲染失败：${(e as Error).message}\n` }
  }
}
