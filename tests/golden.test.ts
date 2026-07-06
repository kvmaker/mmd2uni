import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { render } from '../src/render'

const FIXTURE_DIR = fileURLToPath(new URL('./fixtures', import.meta.url))
const cases = readdirSync(FIXTURE_DIR).filter((f) => f.endsWith('.mmd'))

describe('golden', () => {
  for (const file of cases) {
    it(file, () => {
      const src = readFileSync(join(FIXTURE_DIR, file), 'utf8')
      const out = render(src, { color: 'none' })
      const expectedPath = join(FIXTURE_DIR, file.replace(/\.mmd$/, '.expected.txt'))
      if (process.env.UPDATE_GOLDEN) writeFileSync(expectedPath, out)
      expect(
        existsSync(expectedPath),
        `缺少 ${expectedPath}，先运行 UPDATE_GOLDEN=1 pnpm test`,
      ).toBe(true)
      expect(out).toBe(readFileSync(expectedPath, 'utf8'))
    })
  }
})
