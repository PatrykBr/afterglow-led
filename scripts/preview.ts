import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = fileURLToPath(new URL('../dist/', import.meta.url));
if (!(await Bun.file(resolve(directory, 'index.html')).exists()))
  throw new Error('Build first with bun run build.');
const assets = new Map<string, Bun.BunFile>();
for await (const path of new Bun.Glob('**/*').scan({ cwd: directory, onlyFiles: true })) {
  assets.set('/' + path.replaceAll('\\', '/'), Bun.file(resolve(directory, path)));
}
const port = Number(Bun.env.PORT ?? 4173);
if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw new Error('PORT must be from 1 to 65535.');
const server = Bun.serve({
  hostname: '127.0.0.1',
  port,
  development: false,
  fetch(request) {
    let path: string;
    try {
      path = decodeURIComponent(new URL(request.url).pathname);
    } catch {
      return new Response('Bad path', { status: 400 });
    }
    // Only files enumerated from dist are reachable; never join a request path to disk.
    const file = assets.get(path === '/' ? '/index.html' : path);
    if (!file || !['GET', 'HEAD'].includes(request.method))
      return new Response('Not found', { status: 404 });
    return new Response(request.method === 'HEAD' ? null : file, {
      headers: {
        'Content-Type': file.type,
        'Cache-Control': 'no-store',
        'Permissions-Policy': 'bluetooth=(self)',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  },
});
console.log(`Afterglow production preview: http://localhost:${server.port}`);
