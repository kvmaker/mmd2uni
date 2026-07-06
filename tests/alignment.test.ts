import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { render } from '../src/render'
import { checkAlignment } from './helpers'

const FIXTURE_DIR = fileURLToPath(new URL('./fixtures', import.meta.url))
const cases = readdirSync(FIXTURE_DIR).filter((f) => f.endsWith('.mmd'))

describe('对齐性质：所有 fixture 输出框边框显示宽度一致', () => {
  for (const file of cases) {
    it(file, () => {
      const src = readFileSync(join(FIXTURE_DIR, file), 'utf8')
      const out = render(src, { color: 'none' })
      expect(checkAlignment(out)).toEqual([])
    })
  }
})
