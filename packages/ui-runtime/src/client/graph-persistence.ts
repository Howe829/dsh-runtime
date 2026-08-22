/** Browser-only persistence for user-arranged runtime graph positions. */

import type { RuntimeGraphNode } from '@deepseek-ai/dsh-api-remotes/client'
import type { RuntimeGraphNeighbourDepth, RuntimeGraphSavedPositions } from './graph.ts'

// Keep the pre-rename key so DSH Insider restores layouts saved by dsh-runtime.
const STORAGE_PREFIX = 'dsh-runtime:graph-layout:v1:'

interface StoredGraphLayout {
  readonly schemaVersion: 1
  readonly profile: string | null
  readonly updatedAt: number
  readonly positions: RuntimeGraphSavedPositions
  readonly neighbourDepth: RuntimeGraphNeighbourDepth
}

/** Presentation preferences restored alongside pinned positions. */
export interface RuntimeGraphPresentation {
  readonly positions: RuntimeGraphSavedPositions
  readonly neighbourDepth: RuntimeGraphNeighbourDepth
}

/** Stable localStorage key scoped to the active Harness profile. */
export function graphLayoutStorageKey(profile: string | null | undefined): string {
  return `${STORAGE_PREFIX}${encodeURIComponent(profile ?? 'unknown')}`
}

/** Read valid finite positions without allowing corrupt browser data to break the graph. */
export function readGraphPresentation(profile: string | null | undefined): RuntimeGraphPresentation {
  const fallback: RuntimeGraphPresentation = { positions: {}, neighbourDepth: 1 }
  if (typeof window === 'undefined') return fallback
  try {
    const value = window.localStorage.getItem(graphLayoutStorageKey(profile))
    if (value === null) return fallback
    const parsed = JSON.parse(value) as Partial<StoredGraphLayout>
    if (parsed.schemaVersion !== 1 || parsed.positions === undefined || typeof parsed.positions !== 'object') return fallback
    const positions = Object.fromEntries(Object.entries(parsed.positions).filter(([, position]) => (
      position !== null
      && typeof position === 'object'
      && Number.isFinite((position as { x?: unknown }).x)
      && Number.isFinite((position as { y?: unknown }).y)
      && typeof (position as { pinned?: unknown }).pinned === 'boolean'
    )))
    const neighbourDepth = parsed.neighbourDepth === 2 || parsed.neighbourDepth === 'all'
      ? parsed.neighbourDepth
      : 1
    return { positions, neighbourDepth }
  } catch {
    return fallback
  }
}

/** Compatibility helper for callers that only need saved node positions. */
export function readGraphLayout(profile: string | null | undefined): RuntimeGraphSavedPositions {
  return readGraphPresentation(profile).positions
}

/** Persist presentation state only; runtime state never enters browser storage. */
export function writeGraphLayout(
  profile: string | null | undefined,
  positions: RuntimeGraphSavedPositions,
  neighbourDepth: RuntimeGraphNeighbourDepth = 1,
): void {
  if (typeof window === 'undefined') return
  try {
    const value: StoredGraphLayout = {
      schemaVersion: 1,
      profile: profile ?? null,
      updatedAt: Date.now(),
      positions,
      neighbourDepth,
    }
    window.localStorage.setItem(graphLayoutStorageKey(profile), JSON.stringify(value))
  } catch {
    // Storage may be unavailable or full; the in-memory arrangement remains usable.
  }
}

/** Drop placements that no longer correspond to the current logical graph. */
export function pruneGraphLayout(
  positions: RuntimeGraphSavedPositions,
  nodes: readonly RuntimeGraphNode[],
): RuntimeGraphSavedPositions {
  const logicalKeys = new Set(nodes.map(node => node.logicalKey))
  return Object.fromEntries(Object.entries(positions).filter(([key]) => logicalKeys.has(key)))
}
