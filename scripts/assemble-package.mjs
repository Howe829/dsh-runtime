import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const target = resolve(root, 'packages/dsh-runtime')
const targetLib = resolve(target, 'lib')
const runtimeLib = resolve(root, 'packages/runtime/lib')
const uiLib = resolve(root, 'packages/ui-runtime/lib')

const replacements = new Map([
  ['@deepseek-ai/dsh-client-ui-runtime', '@howardchan/dsh-runtime'],
  ['@deepseek-ai/dsh-runtime', '@howardchan/dsh-runtime'],
])

async function transformedCopy(source, destination) {
  let text = await readFile(source, 'utf8')
  for (const [from, to] of replacements) text = text.replaceAll(from, to)
  text = text.replace(/^\/\/# sourceMappingURL=.*$/gm, '')
  await mkdir(dirname(destination), { recursive: true })
  await writeFile(destination, `${text.trimEnd()}\n`)
}

async function copyDeclarationTree(sourceDir, destinationDir) {
  const queue = [[sourceDir, destinationDir]]
  while (queue.length > 0) {
    const [sourceDirectory, destinationDirectory] = queue.pop()
    for (const entry of await readdir(sourceDirectory, { withFileTypes: true })) {
      const source = resolve(sourceDirectory, entry.name)
      const destination = resolve(destinationDirectory, entry.name)
      if (entry.isDirectory()) queue.push([source, destination])
      else if (entry.name.endsWith('.d.ts')) await transformedCopy(source, destination)
    }
  }
}

await rm(targetLib, { recursive: true, force: true })
await mkdir(targetLib, { recursive: true })

for (const file of [
  'index.js',
  'invariant.js',
  'typert.host.js',
  'typert.host.d.ts',
  'typert.remote-client.js',
  'typert.remote-client.d.ts',
]) {
  await transformedCopy(resolve(runtimeLib, file), resolve(targetLib, file))
}

for (const file of ['index.js', 'index.d.ts', 'invariant.js', 'invariant.d.ts', 'types.js', 'types.d.ts']) {
  await transformedCopy(resolve(runtimeLib, 'types', file), resolve(targetLib, 'types', file))
}

await transformedCopy(resolve(uiLib, 'client.js'), resolve(targetLib, 'client.js'))
await copyDeclarationTree(resolve(uiLib, 'types/client'), resolve(targetLib, 'client-types'))
await cp(resolve(root, 'LICENSE'), resolve(target, 'LICENSE'))

console.log('assembled packages/dsh-runtime')
