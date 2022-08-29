# React Snippets Cli
A cli for create react snippets easily

## Quick Overview
```
cd your-react-app-dir/components
npx rsc fc TestComponent
```

## Install

### pnpm
```
pnpm add react-snippets-cli -g
```

### npm
```
npm i react-snippets-cli -g
```
### yarn
```
yarn add react-snippets-cli -g
```

## Usage
```
rsc fc <displayName> [--type=type] [--out=out]
```

## Example

### Create function component
1. css module
```
rsc fc test-component
```

2. css in js
```
rsc fc test-component --type=css-in-js
```
