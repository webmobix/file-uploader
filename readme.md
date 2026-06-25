# @webmobix/file-uploader

A Stencil Web Component library providing a self-contained, framework-agnostic file uploader.

## Components

### `<wmx-file-uploader>`

A file uploader web component with drag-and-drop, click-to-choose, image previews, and file type filtering.

**Props:** `multiple` (boolean), `accept` (string)  
**Events:** `wmxFilesChanged`, `wmxFileRejected`  
**CSS Variables:** `--wmx-tile-size`, `--wmx-accent-color`, `--wmx-border-color`

See [component docs](src/components/file-uploader/readme.md) for full API.

## Getting Started

```bash
npm install
npm start      # dev server with hot reload
npm run build  # production build
npm test       # run tests
```

## Usage

### Plain HTML

```html
<script type="module" src="https://unpkg.com/@webmobix/file-uploader"></script>

<wmx-file-uploader multiple accept="image/*,.pdf"></wmx-file-uploader>
<script>
  customElements.whenDefined('wmx-file-uploader').then(() => {
    const uploader = document.querySelector('wmx-file-uploader');
    uploader.addEventListener('wmxFilesChanged', (e) => {
      console.log('Files:', e.detail.files);
    });
  });
</script>
```

### React

This project ships an auto-generated React wrapper package (`@webmobix/file-uploader/react`) via Stencil's `@stencil/react-output-target`. It provides a type-safe `<WmxFileUploader />` React component with idiomatic event callback props — no `ref` or `addEventListener` needed.

#### Install

```bash
npm install @webmobix/file-uploader @webmobix/file-uploader/react
```

> `@webmobix/file-uploader/react` has `react` and `react-dom` (>=17) as peer dependencies.

#### Usage

```tsx
import { WmxFileUploader } from '@webmobix/file-uploader/react';

function App() {
  return (
    <WmxFileUploader
      multiple
      accept="image/*,.pdf"
      onWmxFilesChanged={(e) => console.log('Files:', e.detail.files)}
      onWmxFileRejected={(e) => console.warn('Rejected:', e.detail.files)}
    />
  );
}

export default App;
```

#### Component API

| Prop                | Type                          | Default | Description                                        |
| ------------------- | ----------------------------- | ------- | -------------------------------------------------- |
| `multiple`          | `boolean`                     | `false` | Allow multiple files; otherwise holds at most one. |
| `accept`            | `string`                      | `''`    | Comma-separated MIME types / extensions.           |
| `onWmxFilesChanged` | `(e: CustomEvent) => void`    | —       | Fired when files are added or removed.             |
| `onWmxFileRejected` | `(e: CustomEvent) => void`    | —       | Fired when dropped files don't match `accept`.     |

Both event callbacks receive a `CustomEvent` with `detail.files: File[]`.

The wrapper handles custom element definition, event binding, and listener cleanup automatically. It is marked `'use client'` for Next.js App Router compatibility and supports SSR.

#### Building the wrapper

The wrapper source is regenerated into `react/src/components/stencil-generated/` on every `npm run build`. To compile it:

```bash
pnpm --filter @webmobix/file-uploader/react build
```

#### Manual approach (without the wrapper)

If you prefer to use the raw web component directly:

```tsx
import { useRef, useEffect } from 'react';
import '@webmobix/file-uploader/dist/components/wmx-file-uploader';

function FileUploader() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onChanged = (e: any) => console.log('Files:', e.detail.files);
    const onRejected = (e: any) => console.log('Rejected:', e.detail.files);
    el.addEventListener('wmxFilesChanged', onChanged);
    el.addEventListener('wmxFileRejected', onRejected);
    return () => {
      el.removeEventListener('wmxFilesChanged', onChanged);
      el.removeEventListener('wmxFileRejected', onRejected);
    };
  }, []);

  return <wmx-file-uploader ref={ref} multiple accept="image/*,.pdf" />;
}
```

### Vue

```vue
<template>
  <wmx-file-uploader multiple accept="image/*,.pdf" @wmx-files-changed="onChanged" />
</template>

<script setup>
import '@webmobix/file-uploader/dist/components/wmx-file-uploader';
const onChanged = (e) => console.log('Files:', e.detail.files);
</script>
```

Vue automatically maps `@wmx-files-changed` to the `wmxFilesChanged` custom event.

### Svelte

```svelte
<script>
  import '@webmobix/file-uploader/dist/components/wmx-file-uploader';
  function onChanged(e) { console.log('Files:', e.detail.files); }
</script>

<wmx-file-uploader multiple accept="image/*,.pdf" on:wmxFilesChanged={onChanged} />
```

## Build Outputs

| Target | Description |
|--------|-------------|
| `dist/` | Lazy-loaded loader (bootstrap script) |
| `dist-custom-elements` | Standalone custom elements (auto-defined) |
| `react/` | Auto-generated React wrapper package (`@webmobix/file-uploader/react`) |

Import the lazy loader for automatic registration of all components, or import individual files for tree-shaking. Use the React wrapper package for idiomatic React integration.

## License

MIT