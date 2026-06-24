## 1. Scaffold the new component

- [x] 1.1 Generate the `file-uploader` component scaffold via `npm run generate` (creates `src/components/file-uploader/file-uploader.tsx`, `.css`, `.cmp.test.tsx`, readme)
- [x] 1.2 Set the `@Component` tag to `wmx-file-uploader` and enable `shadow: true`; remove generated boilerplate
- [x] 1.3 Define the `SelectedFile` internal type (id, file, previewUrl, typeLabel) in the component file

## 2. Props, state, and events

- [x] 2.1 Add `@Prop() multiple: boolean = false`
- [x] 2.2 Add `@Prop() accept: string = ''`
- [x] 2.3 Add `@State() files: SelectedFile[] = []`
- [x] 2.4 Add `@State() isDragOver: boolean = false`
- [x] 2.5 Add `@Event() wmxFilesChanged` emitter with detail `{ files: File[] }`
- [x] 2.6 Add `@Event() wmxFileRejected` emitter with detail `{ files: File[] }`

## 3. File ingestion and accept matching

- [x] 3.1 Add a hidden `<input type="file">` in the render tree, wired to `accept` and `multiple`
- [x] 3.2 Implement `openFileChooser()` that resets the input value and calls `input.click()`
- [x] 3.3 Implement `matchesAccept(file, accept)` handling MIME, `image/*` wildcards, and `.ext` forms
- [x] 3.4 Implement `ingestFiles(FileList | File[])` that filters by `accept`, splits accepted vs. rejected, and emits `wmxFileRejected` for rejected files
- [x] 3.5 In `ingestFiles`, enforce single-file replacement when `multiple` is false (revoke prior file's URL, replace list)
- [x] 3.6 In `ingestFiles`, append when `multiple` is true; create object URLs for images and derive `typeLabel` for non-images; assign `crypto.randomUUID()` ids
- [x] 3.7 Wire the input `change` handler to call `ingestFiles`

## 4. Drag-and-drop handling

- [x] 4.1 Add `handleDragEnter`/`handleDragOver` that `preventDefault` and set `isDragOver = true`
- [x] 4.2 Add `handleDragLeave` with a drag counter or `relatedTarget` null/outside check to avoid flicker; clear `isDragOver` when leaving the zone
- [x] 4.3 Add `handleDrop` that `preventDefault`, clears `isDragOver`, and calls `ingestFiles` with `event.dataTransfer.files`

## 5. Remove handling and cleanup

- [x] 5.1 Implement `removeFile(id)` that revokes the object URL, removes the entry from `files`, and emits `wmxFilesChanged`
- [x] 5.2 Implement `disconnectedCallback` that revokes all remaining object URLs

## 6. Rendering and layout

- [x] 6.1 Render a root flex container (`display:flex; flex-wrap:wrap; gap`)
- [x] 6.2 Render file tiles: image tiles with `<img object-fit:contain>`; non-image tiles with a derived type label and `title={file.name}`
- [x] 6.3 Render the top-right remove `X` button on each tile with `aria-label="Remove <name>"` and wire to `removeFile`
- [x] 6.4 Render the drop zone: always (single mode, no file) or as the trailing tile (multi mode); hide in single mode once a file exists
- [x] 6.5 Make the drop zone clickable (call `openFileChooser`) and keyboard-activatable
- [x] 6.6 Apply the drag-over CSS class to the drop zone when `isDragOver` is true

## 7. Styles (file-uploader.css)

- [x] 7.1 Define square tile size via `--wmx-tile-size` (default 96px) and accent/border CSS variables
- [x] 7.2 Style the drop zone border, background, and drag-over state (thicker accent border + accent fill)
- [x] 7.3 Style image thumbnails (`object-fit: contain`) and non-image placeholder boxes
- [x] 7.4 Position the remove button at the top-right of each tile
- [x] 7.5 Ensure responsive wrap behavior via flex-wrap on the root

## 8. Remove starter sample and update exports

- [x] 8.1 Delete `src/components/my-component/` (component, css, test, readme)
- [x] 8.2 Update `src/index.ts` to remove the `my-component`-only `format` export (and remove `src/utils/utils.ts` + its test if no longer referenced)
- [x] 8.3 Update `package.json` `exports` to replace `./my-component` with `./file-uploader` pointing at the custom-elements output
- [x] 8.4 Run `npm run build` to regenerate `src/components.d.ts` and dist outputs; verify `<wmx-file-uploader>` and no `<my-component>` appear

## 9. Tests

- [x] 9.1 Write a component test verifying the drop zone renders with no props
- [x] 9.2 Write a test verifying click-to-choose opens the file chooser (mock input.click)
- [x] 9.3 Write a test verifying `accept` filtering on dropped files and `wmxFileRejected` emission
- [x] 9.4 Write a test verifying image tiles render an `<img>` and non-image tiles render a type label with the filename title
- [x] 9.5 Write a test verifying remove button removes the file and emits `wmxFilesChanged`
- [x] 9.6 Write a test verifying single-file mode replaces the existing file and hides the drop zone
- [x] 9.7 Write a test verifying multi-file mode renders the trailing upload box after files
- [x] 9.8 Write a test verifying drag-over sets the drag-over state class and drop clears it
- [x] 9.9 Remove the old `my-component` test file (covered by 8.1) and run `npm test` to confirm a green suite

## 10. Docs and verification

- [x] 10.1 Fill in `src/components/file-uploader/readme.md` with props, events, and usage examples
- [x] 10.2 Run `npm run build` and `npm test` end-to-end; confirm no errors
- [x] 10.3 Verify the built output exposes the `./file-uploader` export and registers `wmx-file-uploader`