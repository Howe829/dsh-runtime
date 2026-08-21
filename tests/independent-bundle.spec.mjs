import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import test from 'node:test'
import { load } from 'js-yaml'

const root = resolve(import.meta.dirname, '..')
const packageRoot = resolve(root, 'packages/dsh-runtime')

async function text(path) {
  return readFile(resolve(packageRoot, path), 'utf8')
}

test('ships one dual-face package and one Loader row', async () => {
  const manifest = JSON.parse(await text('package.json'))
  const patch = await text('cordis.patch.yml')

  assert.equal(manifest.name, '@howardchan/dsh-runtime')
  assert.equal(manifest.dsh.bundle.patch, './cordis.patch.yml')
  assert.equal(manifest.dsh.client.platform, 'web')
  assert.deepEqual(load(patch), [{
    insert: [{ id: 'dsh-runtime', name: '@howardchan/dsh-runtime' }],
  }])
  assert.match(patch, /id: dsh-runtime/)
})

test('client bundle registers itself and mounts its Remote contribution', async () => {
  const client = await text('lib/client.js')

  assert.match(client, /id: "dsh-runtime"/)
  assert.match(client, /runtimeExplorer\/snapshot/)
  assert.match(client, /ctx\.remote\.\$mount\(TYPERT_REMOTE\)/)
  assert.match(client, /ctx\.get\("remote\.runtimeExplorer"\)/)
  assert.match(client, /inject\(\["remote\.runtimeExplorer"\]/)
  assert.match(client, /\[data-slot=\\"sidebar\.footer\.action\\"\]\{flex-direction:column\}/)
  assert.doesNotMatch(client, /@deepseek-ai\/dsh-client-ui-runtime/)
  assert.doesNotMatch(client, /@deepseek-ai\/dsh-runtime/)
})

test('Host and generated Remote artifacts share the public package identity', async () => {
  const host = await text('lib/index.js')
  const remote = await text('lib/typert.remote-client.js')
  const remoteTypes = await text('lib/typert.remote-client.d.ts')

  assert.match(host, /Symbol\.for\("@howardchan\/dsh-runtime\/process-state"\)/)
  assert.match(remote, /package: '@howardchan\/dsh-runtime'/)
  assert.match(remote, /@howardchan\/dsh-runtime#runtimeExplorer\/snapshot/)
  assert.match(remoteTypes, /from '@howardchan\/dsh-runtime\/types'/)
})
