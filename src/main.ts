import { readFileSync } from 'node:fs'
import { runCli } from './cli'

const result = runCli(process.argv.slice(2), () =>
  process.stdin.isTTY ? null : readFileSync(0, 'utf8'),
)
if (result.stdout) process.stdout.write(result.stdout)
if (result.stderr) process.stderr.write(result.stderr)
process.exit(result.exitCode)
