import { describe, it, expect } from 'vitest'
import { fileURLToPath } from 'node:url'
import { runCli } from '../src/cli'

const FIXTURE = fileURLToPath(new URL('./fixtures/flow-lr-en.mmd', import.meta.url))
const noStdin = () => null

describe('runCli', () => {
  it('--help 输出用法，退出码 0', () => {
    const r = runCli(['--help'], noStdin)
    expect(r.exitCode).toBe(0)
    expect(r.stdout).toContain('用法')
  })

  it('--version 输出版本号', () => {
    const r = runCli(['--version'], noStdin)
    expect(r.exitCode).toBe(0)
    expect(r.stdout).toMatch(/\d+\.\d+\.\d+/)
  })

  it('文件输入渲染成功', () => {
    const r = runCli(['--color', 'none', FIXTURE], noStdin)
    expect(r.exitCode).toBe(0)
    expect(r.stdout).toContain('Parser')
    expect(r.stdout).toContain('┌')
  })

  it('stdin 输入渲染成功', () => {
    const r = runCli(['--color', 'none'], () => 'graph LR\n  A --> B')
    expect(r.exitCode).toBe(0)
    expect(r.stdout).toContain('┌')
  })

  it('参数 - 表示 stdin', () => {
    const r = runCli(['--color', 'none', '-'], () => 'graph LR\n  A --> B')
    expect(r.exitCode).toBe(0)
    expect(r.stdout).toContain('┌')
  })

  it('--ascii 模式', () => {
    const r = runCli(['--ascii', '--color', 'none', FIXTURE], noStdin)
    expect(r.exitCode).toBe(0)
    expect(r.stdout).toContain('+')
    expect(r.stdout).not.toContain('┌')
  })

  it('无输入且无管道 → 退出码 2', () => {
    const r = runCli([], noStdin)
    expect(r.exitCode).toBe(2)
    expect(r.stderr).toContain('缺少输入')
  })

  it('文件不存在 → 退出码 2', () => {
    const r = runCli(['no-such-file.mmd'], noStdin)
    expect(r.exitCode).toBe(2)
    expect(r.stderr).toContain('文件不存在')
  })

  it('未知参数 → 退出码 2', () => {
    const r = runCli(['--bogus'], noStdin)
    expect(r.exitCode).toBe(2)
    expect(r.stderr).toContain('参数错误')
  })

  it('无效 --color 值 → 退出码 2', () => {
    const r = runCli(['--color', 'rainbow'], () => 'graph LR\n  A --> B')
    expect(r.exitCode).toBe(2)
    expect(r.stderr).toContain('无效的 --color')
  })

  it('多个文件参数 → 退出码 2', () => {
    const r = runCli([FIXTURE, FIXTURE], noStdin)
    expect(r.exitCode).toBe(2)
  })

  it('渲染错误（空输入内容）→ 退出码 1', () => {
    const r = runCli([], () => '   ')
    expect(r.exitCode).toBe(1)
    expect(r.stderr).toContain('渲染失败')
  })

  it('图输出到 stdout、错误只进 stderr', () => {
    const ok = runCli(['--color', 'none', FIXTURE], noStdin)
    expect(ok.stderr).toBe('')
    const bad = runCli(['no-such-file.mmd'], noStdin)
    expect(bad.stdout).toBe('')
  })
})
