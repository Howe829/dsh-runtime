// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import type { RuntimeGraphNode } from '@deepseek-ai/dsh-api-remotes/client'
import {
  graphLayoutStorageKey, pruneGraphLayout, readGraphLayout, readGraphPresentation, writeGraphLayout,
} from '../src/client/graph-persistence.ts'

const node = (logicalKey: string): RuntimeGraphNode => ({
  id: `fiber:${logicalKey}`,
  logicalKey,
  entryId: logicalKey,
  moduleName: `@fixture/${logicalKey}`,
  label: logicalKey,
  enabled: true,
  phase: 'active',
  provides: [],
  injects: [],
  missing: [],
  effects: [],
  effectCount: 0,
})

beforeEach(() => { window.localStorage.clear() })

describe('runtime graph layout persistence', () => {
  it('round-trips presentation positions per profile without runtime payload data', () => {
    writeGraphLayout('web', { provider: { x: 120, y: 240, pinned: true } }, 2)
    expect(readGraphLayout('web')).toEqual({ provider: { x: 120, y: 240, pinned: true } })
    expect(readGraphPresentation('web').neighbourDepth).toBe(2)
    expect(readGraphLayout('desktop')).toEqual({})

    const raw = window.localStorage.getItem(graphLayoutStorageKey('web')) as string
    expect(raw).toContain('"schemaVersion":1')
    expect(raw).not.toContain('fiberId')
    expect(raw).not.toContain('payload')
  })

  it('fails closed for corrupt storage and prunes stale logical keys', () => {
    window.localStorage.setItem(graphLayoutStorageKey('web'), '{not-json')
    expect(readGraphLayout('web')).toEqual({})
    expect(readGraphPresentation('web').neighbourDepth).toBe(1)

    const pruned = pruneGraphLayout({
      current: { x: 10, y: 20, pinned: true },
      stale: { x: 30, y: 40, pinned: true },
    }, [node('current')])
    expect(pruned).toEqual({ current: { x: 10, y: 20, pinned: true } })
  })
})
