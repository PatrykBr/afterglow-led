import { rm } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const outdir = resolve(root, 'dist');
// Only the generated dist directory beside this project's source may be replaced.
if (relative(root, outdir) !== 'dist')
  throw new Error('Refusing to replace an unexpected directory.');
await rm(outdir, { recursive: true, force: true });

const result = await Bun.build({
  entrypoints: [join(root, 'index.html')],
  outdir,
  target: 'browser',
  format: 'esm',
  minify: true,
  sourcemap: 'linked',
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
});
if (!result.success) throw new AggregateError(result.logs, 'Production bundle failed.');
const html = await Bun.file(join(outdir, 'index.html')).text();
if (html.includes('/src/main.tsx') || html.includes('@vite/client'))
  throw new Error('The output still references development source.');
console.log(`Built ${result.outputs.length} browser assets with Bun ${Bun.version}.`);
for (const output of result.outputs)
  console.log(`${relative(root, output.path)}  ${(output.size / 1024).toFixed(1)} kB`);
