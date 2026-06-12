# TypeScript Monorepo Configuration

This project uses a monorepo setup with separate TypeScript configurations for client and server.

## Structure

```
├── tsconfig.base.json      # Base config shared by all packages
├── tsconfig.json           # Client-side (React/Vite)
├── tsconfig.server.json    # Server-side (Express/Node)
├── src/                    # Client source code
└── server/                 # Server source code
```

## Scripts

- `pnpm dev` - Start client dev server (Rsbuild)
- `pnpm dev:server` - Start auth server with watch mode
- `pnpm build` - Build client for production
- `pnpm build:server` - Build server for production
- `pnpm typecheck` - Type check both client and server

## Configuration Details

### tsconfig.base.json
Shared base configuration for all TypeScript projects.

### tsconfig.json (Client)
- Target: Browser environment
- JSX: React JSX
- Module Resolution: Bundler (Vite)
- Path aliases: `@/*` → `./src/*`

### tsconfig.server.json (Server)
- Target: Node.js environment
- Module: NodeNext (ESM)
- Types: Node.js types
- Output: `./dist/server`
