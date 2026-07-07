# create-docstatic

Create a [docStatic](https://docstatic.com/) documentation site with one command:

```sh
npx create-docstatic@latest my-docs
```

or equivalently:

```sh
npm create docstatic@latest my-docs
yarn create docstatic my-docs
pnpm create docstatic my-docs
```

This scaffolds a new Docusaurus + TinaCMS documentation site from the
[docstatic](https://www.npmjs.com/package/docstatic) template, installs
dependencies, and initializes a git repository.

## Options

| Option | Description |
| --- | --- |
| `--template <name>` | Template to use (default: `default`) |
| `--use-npm` / `--use-yarn` / `--use-pnpm` | Choose the package manager for the install step |
| `--no-install` | Skip installing dependencies |
| `--tag <dist-tag>` | Scaffold from a specific docstatic dist-tag or version (default: `latest`) |

## After scaffolding

```sh
cd my-docs
npm run dev
```

Your site runs at `http://localhost:3000` with the TinaCMS editor at
`http://localhost:3000/admin/index.html`.

## License

MIT
