import { readFileSync } from 'node:fs'
import { runCli } from './cli'

const result = runCli(process.argv.slice(2), () =>
  process.stdin.isTTY ? null : readFileSync(0, 'utf8'),
)
if (result.stdout) process.stdout.write(result.stdout)
if (result.stderr) process.stderr.write(result.stderr)
// 用 exitCode 而非 process.exit()：后者会立即终止并可能截断管道中未刷新的输出缓冲
process.exitCode = result.exitCode
