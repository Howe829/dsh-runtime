import { Context } from '@deepseek-ai/cordis'
import { describe, expect, it } from 'vitest'
import InvariantRegistry from '@deepseek-ai/dsh-invariants'
import * as RuntimeInvariant from '../src/invariant.ts'

describe('dsh-runtime invariant companion', () => {
  it('registers the package-owned empty installer across reload', async () => {
    const ctx = new Context()
    await ctx.plugin(InvariantRegistry, { enabled: true })
    const fiber = ctx.plugin(RuntimeInvariant)
    await expect(fiber.await()).resolves.toBeDefined()
    await fiber.dispose()
    await expect(ctx.plugin(RuntimeInvariant).await()).resolves.toBeDefined()
    await ctx.fiber.dispose()
  })
})
