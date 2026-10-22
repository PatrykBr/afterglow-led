import homepage from '../index.html';

const port = Number(Bun.env.PORT ?? 5173);
if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw new Error('PORT must be from 1 to 65535.');

const server = Bun.serve({
  hostname: '127.0.0.1',
  port,
  routes: { '/': homepage },
  development: { hmr: true, console: true },
});
console.log(`Afterglow development: http://localhost:${server.port}`);
