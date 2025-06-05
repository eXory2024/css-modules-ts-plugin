# css-modules-ts-plugin

This plugin aims to provide a basic LSP support for CSS modules that _should be_ compatible with TypeScript 5 and composite projects.

List of things that currently don't work:

- CSS import specifiers that are not relative, i.e. they rely on TypeScript's path resolution. (e.g. `import styles from "@components/Button.css`)
