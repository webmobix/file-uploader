## Why

The project ships as a Stencil Web Component library but currently has no actual reusable component, only the starter `my-component` sample. We need a self-contained, framework-agnostic file uploader that developers can drop into any app via a single custom element tag. It should encapsulate the entire upload UX, drag-and-drop interaction, and file preview rendering so consumers do not have to wire any of that themselves.

## What Changes

- Add a new Stencil Web Component `<wmx-file-uploader>` that encapsulates file upload interactions end-to-end.
- Square drop zone that accepts drag-and-drop; border and background change on drag-over/hover state.
- Drop zone is also clickable to open the native file chooser dialog.
- Component props mirror the native `<input type="file">` API: `multiple` (boolean) and `accept` (comma-separated MIME types / extensions).
- For image files, render a thumbnail preserving the correct aspect ratio.
- For non-image files, render a placeholder box showing the file type label, with the file name as a tooltip on hover.
- Each selected file tile shows a remove `X` control on the top-right.
- When `multiple` is enabled, an empty upload box is rendered to the right of the last uploaded tile, so users can keep adding files.
- Tiles lay out in a flex row that wraps to new lines on narrow/mobile viewports.
- Remove the placeholder `my-component` sample so the library ships only the real component.
- **BREAKING**: Drop the `my-component` export and tag (replaced by `wmx-file-uploader`).

## Capabilities

### New Capabilities
- `file-uploader`: Encapsulates the drag-and-drop/click file selection surface, file type and multiple selection configuration, and preview/tile rendering with remove controls for a Stencil Web Component.

### Modified Capabilities
<!-- No existing specs in openspec/specs/ to modify. -->

## Impact

- **Code**: New `src/components/file-uploader/` directory with component, styles, tests, and readme. Remove `src/components/my-component/` and its references in `src/index.ts`, `src/components.d.ts`.
- **APIs**: New public custom element `<wmx-file-uploader>` with props `multiple` and `accept`, plus events for file selection and removal (consumers may listen to react to changes). Package exports updated to expose the new component.
- **Dependencies**: No new runtime dependencies; relies on Stencil core and native browser File/ObjectURL APIs.
- **Build**: `stencil.config.ts` namespace remains `files-component`; no config changes required. Docs-readme output will regenerate for the new component.
- **Tests**: New component + unit tests via `@stencil/vitest`; remove old `my-component` tests.