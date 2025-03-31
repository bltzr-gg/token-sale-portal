# Real Token Public Sale UI

Monorepo for Real Token Public Sale using [turbo](https://turbo.build/repo), forked from [Axis Standalone UI](https://github.com/Axis-Fi/standalone-ui)

This app is designed for projects looking to host and manage their Token Generation Event (TGE) with minimal configuration. It provides seamless integration of Axis Protocol contracts through ready-to-use hooks and UI components, enabling full ownership and control over the TGE process.

## App Configuration

- add your Chain Id, Subgraphurl, Auction lot id and other metadata to `./app-config.ts`

## Dev Setup

- run `pnpm install` to install dependencies for all packages
- Setup `.env` on dapp repo
- run `pnpm dev --filter=dapp`

### Other Useful Commands

- `pnpm build` - Build all packages
- `pnpm dev` - Run all packages locally
- `pnpm dev --filter=<project_name>` - Run a specific package locally
- `pnpm storybook` - Runs storybook locally
- `pnpm lint` - Lint all packages
- `pnpm format` - Format all packages
- `pnpm clean` - Clean up all `node_modules` and `dist` folders (runs each package's clean script)

## Apps & Packages

This Turborepo includes the following packages and applications:

- `apps/dapp`: Decentralized App to interact with Axis contracts
- `packages/ui`: Primitive React components built using [shadcn](https://ui.shadcn.com/)
- `packages/brand-assets`: Brand images and fonts
- `config/tailwind-config`: Shared TailwindCSS configs
- `config/typescript-config`: Shared `tsconfig.json`s used throughout the Turborepo
- `config/eslint-config`: ESLint preset

0x454d504100
0xBE2bC88bac5F1C94360AC4Df95424529511e25E2
0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
0x0 //
0x000067e8298f
0x000000000e10
false
1000000000000000000000000
