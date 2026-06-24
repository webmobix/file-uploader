# wmx-file-uploader



<!-- Auto Generated Below -->


## Properties

| Property   | Attribute  | Description                                                                | Type      | Default |
| ---------- | ---------- | -------------------------------------------------------------------------- | --------- | ------- |
| `accept`   | `accept`   | Comma-separated MIME types and/or extensions (e.g. `image/*,.pdf`).        | `string`  | `''`    |
| `multiple` | `multiple` | When true, allows selecting multiple files. When false, holds at most one. | `boolean` | `false` |


## Events

| Event             | Description                                      | Type                              |
| ----------------- | ------------------------------------------------ | --------------------------------- |
| `wmxFileRejected` | Emitted when dropped files don't match `accept`. | `CustomEvent<{ files: File[]; }>` |
| `wmxFilesChanged` | Emitted when files are added or removed.         | `CustomEvent<{ files: File[]; }>` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*

## Usage

```html
<!-- Basic usage -->
<wmx-file-uploader></wmx-file-uploader>

<!-- Single file, images only -->
<wmx-file-uploader accept="image/*"></wmx-file-uploader>

<!-- Multiple files, images and PDFs -->
<wmx-file-uploader multiple accept="image/*,.pdf"></wmx-file-uploader>
```

### Listening to events

```html
<wmx-file-uploader id="uploader" multiple></wmx-file-uploader>
<script>
  customElements.whenDefined('wmx-file-uploader').then(() => {
    const uploader = document.getElementById('uploader');
    uploader.addEventListener('wmxFilesChanged', (e) => {
      console.log('Files:', e.detail.files);
    });
    uploader.addEventListener('wmxFileRejected', (e) => {
      console.log('Rejected files:', e.detail.files);
    });
  });
</script>
```

## CSS Custom Properties

| Property             | Default   | Description                   |
| -------------------- | --------- | ----------------------------- |
| `--wmx-tile-size`    | `96px`    | Width/height of tiles.        |
| `--wmx-accent-color` | `#3b82f6` | Accent color for drag-over.   |
| `--wmx-border-color` | `#d1d5db` | Default border color.         |
