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
