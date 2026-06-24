# files-component

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
<script type="module" src="https://unpkg.com/files-component"></script>

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

Web components work in React, but React's synthetic event system does **not** intercept custom DOM events like `wmxFilesChanged`. You must attach listeners via `ref`:

```tsx
import { useRef, useEffect } from 'react';
import 'files-component/dist/components/wmx-file-uploader';

function FileUploader() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onChanged = (e) => console.log('Files:', e.detail.files);
    const onRejected = (e) => console.log('Rejected:', e.detail.files);
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

> **Should we create a React wrapper?** A wrapper (`useFileUploader` hook or `<FileUploader />` component) would provide type-safe props and event callbacks without manual `ref` + `addEventListener` boilerplate. If this component is used primarily in React apps, a wrapper is worth adding. For now, the `ref` approach above works.

### Vue

```vue
<template>
  <wmx-file-uploader multiple accept="image/*,.pdf" @wmx-files-changed="onChanged" />
</template>

<script setup>
import 'files-component/dist/components/wmx-file-uploader';
const onChanged = (e) => console.log('Files:', e.detail.files);
</script>
```

Vue automatically maps `@wmx-files-changed` to the `wmxFilesChanged` custom event.

### Svelte

```svelte
<script>
  import 'files-component/dist/components/wmx-file-uploader';
  function onChanged(e) { console.log('Files:', e.detail.files); }
</script>

<wmx-file-uploader multiple accept="image/*,.pdf" on:wmxFilesChanged={onChanged} />
```

## Build Outputs

| Target | Description |
|--------|-------------|
| `dist/` | Lazy-loaded loader (bootstrap script) |
| `dist-custom-elements` | Standalone custom elements (auto-defined) |

Import the lazy loader for automatic registration of all components, or import individual files for tree-shaking.

## License

MIT
