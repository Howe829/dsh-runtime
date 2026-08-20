import { access, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const packages = [
  {
    dir: 'packages/runtime',
    name: '@deepseek-ai/dsh-runtime',
    required: ['lib/index.js', 'lib/typert.host.js', 'lib/typert.remote-client.js', 'src/index.ts'],
    private: true,
  },
  {
    dir: 'packages/ui-runtime',
    name: '@deepseek-ai/dsh-client-ui-runtime',
    required: ['lib/index.js', 'lib/client.js', 'src/client/RuntimeExplorer.tsx'],
    private: true,
  },
  {
    dir: 'packages/dsh-runtime',
    name: '@howardchan/dsh-runtime',
    required: [
      'cordis.patch.yml',
      'lib/index.js',
      'lib/client.js',
      'lib/typert.host.js',
      'lib/typert.remote-client.js',
      'lib/types/index.d.ts',
      'lib/client-types/index.d.ts',
    ],
    private: false,
  },
]

for (const item of packages) {
  const manifestPath = resolve(root, item.dir, 'package.json')
  const manifestText = await readFile(manifestPath, 'utf8')
  const manifest = JSON.parse(manifestText)
  if (manifest.name !== item.name) throw new Error(`${item.dir}: expected package name ${item.name}`)
  if (manifest.version !== '0.1.0') throw new Error(`${item.dir}: expected version 0.1.0`)
  if ((manifest.private === true) !== item.private) {
    throw new Error(`${item.dir}: expected private=${String(item.private)}`)
  }
  if (manifestText.includes('workspace' + ':')) throw new Error(`${item.dir}: workspace protocol leaked into release manifest`)
  for (const file of item.required) await access(resolve(root, item.dir, file))
}

const publicManifest = JSON.parse(await readFile(resolve(root, 'packages/dsh-runtime/package.json'), 'utf8'))
if (publicManifest.dsh?.bundle?.patch !== './cordis.patch.yml') {
  throw new Error('packages/dsh-runtime: missing dsh.bundle patch declaration')
}
if (publicManifest.dsh?.client?.platform !== 'web') {
  throw new Error('packages/dsh-runtime: missing Web dsh.client declaration')
}

await access(resolve(root, 'integration/README.md'))
await access(resolve(root, 'integration/README.zh.md'))
await access(resolve(root, 'integration/cordis.patch.fragment.yml'))
console.log('dsh-runtime repository verification passed')
