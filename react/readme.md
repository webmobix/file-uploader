# @webmobix/file-uploader-react

React wrapper for the `<wmx-file-uploader>` web component.

The web component is auto-defined on import — no separate import needed.

## Installation

```bash
pnpm add @webmobix/file-uploader-react
```

## Usage

```tsx
import { WmxFileUploader } from '@webmobix/file-uploader-react';

function App() {
  return (
    <WmxFileUploader
      multiple
      accept="image/*"
      onWmxFilesChanged={(e) => console.log('Files:', e.detail.files)}
      onWmxFileRejected={(e) => console.log('Rejected:', e.detail.files)}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `multiple` | `boolean` | `false` | Allow multiple file selection |
| `accept` | `string` | `''` | Accepted file types (MIME, `.ext`, or `image/*`) |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `onWmxFilesChanged` | `{ files: File[] }` | Emitted when files are added or removed |
| `onWmxFileRejected` | `{ files: File[] }` | Emitted when files don't match `accept` |

## License

MIT

## Contact

Build by [Webmobix Solutions AG](https://webmobix.com)
