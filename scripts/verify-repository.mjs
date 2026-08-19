import { access, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const packages = [
  {
    dir: 'packages/runtime',
    name: '@deepseek-ai/dsh-runtime',
    required: ['lib/index.js', 'lib/typert.host.js', 'lib/typert.remote-client.js', 'src/index.ts'],
  },
  {
    dir: 'packages/ui-runtime',
    name: '@deepseek-ai/dsh-client-ui-runtime',
    required: ['lib/index.js', 'lib/client.js', 'src/client/RuntimeExplorer.tsx'],
  },
]

for (const item of packages) {
  const manifestPath = resolve(root, item.dir, 'package.json')
  const manifestText = await readFile(manifestPath, 'utf8')
  const manifest = JSON.parse(manifestText)
  if (manifest.name !== item.name) throw new Error(`${item.dir}: expected package name ${item.name}`)
  if (manifest.version !== '0.1.0') throw new Error(`${item.dir}: expected version 0.1.0`)
  if (manifestText.includes('workspace' + ':')) throw new Error(`${item.dir}: workspace protocol leaked into release manifest`)
  for (const file of item.required) await access(resolve(root, item.dir, file))
}

await access(resolve(root, 'integration/README.md'))
await access(resolve(root, 'integration/README.zh.md'))
await access(resolve(root, 'integration/cordis.patch.fragment.yml'))
console.log('dsh-runtime repository verification passed')
