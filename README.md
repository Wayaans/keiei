# keiei

A strict, type-safe TypeScript package for [Pi](https://pi.dev), managed with Bun.

## Development

```sh
bun install
bun run typecheck
bun test
bun run check
```

Pi discovers extension entry points from `extensions/` through the `pi` manifest in `package.json`.

To load this package locally:

```sh
pi -e .
```
