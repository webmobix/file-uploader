## ADDED Requirements

### Requirement: Component exposes a single custom element tag
The library SHALL provide a Stencil Web Component registered as `<wmx-file-uploader>` that encapsulates file selection, preview, and removal with no consumer-side wiring beyond placing the tag and listening to events.

#### Scenario: Component renders without props
- **WHEN** `<wmx-file-uploader></wmx-file-uploader>` is placed in a document
- **THEN** the component renders a single square drop zone and no file tiles

#### Scenario: Shadow DOM encapsulation
- **WHEN** the component renders
- **THEN** its internal markup and styles are encapsulated in a shadow root and not affected by host page styles

### Requirement: Square drop zone accepts drag-and-drop
The component SHALL render a square drop zone that accepts dragged files. While a drag is over the zone, the zone's border and background SHALL visually change to indicate an active hover state.

#### Scenario: Drag over changes visual state
- **WHEN** a user drags a file over the drop zone
- **THEN** the drop zone border becomes thicker/accent-colored and its background fills with an accent tint
- **AND** the visual state persists while the drag remains over the zone without flickering as the pointer crosses child elements

#### Scenario: Drag leave restores visual state
- **WHEN** the user drags the file out of the drop zone
- **THEN** the border and background return to their default (non-hover) appearance

#### Scenario: Drop ingests files
- **WHEN** the user drops one or more files onto the drop zone
- **THEN** the dropped files are added to the component's file list (subject to `multiple` and `accept` rules)
- **AND** the drag-over visual state is cleared

### Requirement: Drop zone is clickable to open the file chooser
The drop zone SHALL be clickable to open the native OS file chooser dialog. The chooser SHALL honor the `multiple` and `accept` configuration.

#### Scenario: Click opens file chooser
- **WHEN** the user clicks the drop zone
- **THEN** the native file chooser dialog opens
- **AND** selecting one or more files (per `multiple`) adds them to the file list

#### Scenario: Re-selecting the same file is possible
- **WHEN** the user selects a file, then opens the chooser again and selects the same file
- **THEN** the file chooser allows the selection (the underlying input is reset between selections)

### Requirement: `multiple` prop controls multi-file selection
The component SHALL accept a boolean `multiple` prop. When `multiple` is false, the component SHALL hold at most one file. When `multiple` is true, the component SHALL hold any number of files.

#### Scenario: Single-file mode replaces existing file
- **WHEN** `multiple` is false and a file is already selected and the user selects or drops a new file
- **THEN** the new file replaces the existing file in the file list
- **AND** the previously selected file is removed (and its preview URL revoked)

#### Scenario: Single-file mode hides drop zone once selected
- **WHEN** `multiple` is false and a file is selected
- **THEN** the drop zone is not rendered; only the selected file's tile is shown

#### Scenario: Multi-file mode appends files
- **WHEN** `multiple` is true and the user selects or drops additional files
- **THEN** the new files are appended to the existing file list without removing prior files

### Requirement: `accept` prop filters file types
The component SHALL accept an `accept` prop using the same value format as the native `<input type="file">` `accept` attribute (comma-separated MIME types and/or extensions, including `image/*` wildcards). Files that do not match SHALL be rejected from drop ingestion.

#### Scenario: Native dialog filters by accept
- **WHEN** `accept` is set (e.g., `image/*,.pdf`) and the user opens the file chooser
- **THEN** the native dialog applies the `accept` filter to the listed files

#### Scenario: Dropped files are filtered by accept
- **WHEN** `accept` is set and the user drops files that include both matching and non-matching types
- **THEN** only matching files are added to the file list
- **AND** a `wmxFileRejected` event is emitted with the non-matching files

#### Scenario: Wildcard MIME matching
- **WHEN** `accept` is `image/*` and a file with MIME `image/png` is dropped
- **THEN** the file matches and is added to the file list

### Requirement: Image files render aspect-ratio-preserving thumbnails
For files whose MIME type starts with `image/`, the component SHALL render a thumbnail tile that displays the image preserving its aspect ratio within the square tile.

#### Scenario: Image thumbnail display
- **WHEN** an image file is in the file list
- **THEN** its tile renders the image via an object URL with `object-fit: contain` so the full image is visible without distortion within the square tile

### Requirement: Non-image files render a type-labeled placeholder
For files whose MIME type does not start with `image/`, the component SHALL render a placeholder box whose content is a short label derived from the file type, with the file name available as a hover tooltip.

#### Scenario: Non-image placeholder with type label
- **WHEN** a non-image file (e.g., `application/pdf`) is in the file list
- **THEN** its tile renders a box displaying a derived type label (e.g., `PDF`)
- **AND** the tile exposes the file name as a tooltip on hover

#### Scenario: Unknown type label fallback
- **WHEN** a file has an unknown or empty MIME type
- **THEN** the tile displays a generic label (e.g., `FILE`) and the file name as the hover tooltip

### Requirement: Each file tile has a top-right remove control
Every file tile SHALL display a remove control (`X`) positioned at the top-right corner. Activating it SHALL remove the file from the list and clean up its preview resources.

#### Scenario: Remove a file
- **WHEN** the user clicks the remove control on a tile
- **THEN** the file is removed from the file list
- **AND** any object URL created for that file is revoked

#### Scenario: Remove control is keyboard accessible
- **WHEN** the user focuses the remove control and activates it via keyboard
- **THEN** the file is removed from the file list

#### Scenario: Removal in single-file mode restores drop zone
- **WHEN** `multiple` is false and the user removes the only selected file
- **THEN** the drop zone is rendered again

### Requirement: Multi-file mode renders a trailing empty upload box
When `multiple` is true, the component SHALL render an empty square upload box (drop zone) as the last element, immediately to the right of the last uploaded file tile, so the user can keep adding files.

#### Scenario: Trailing upload box after files
- **WHEN** `multiple` is true and one or more files are selected
- **THEN** an empty drop zone is rendered to the right of the last file tile
- **AND** the trailing drop zone supports both drag-and-drop and click-to-choose

#### Scenario: Trailing upload box is the only drop zone in multi-file mode
- **WHEN** `multiple` is true and at least one file is selected
- **THEN** no other drop zone is rendered besides the trailing upload box

### Requirement: Tiles lay out in a wrapping flex row
File tiles and the trailing upload box SHALL lay out in a horizontal flex row that wraps to new lines when the container is too narrow (e.g., on mobile viewports).

#### Scenario: Wrap on narrow viewport
- **WHEN** the component is rendered in a narrow viewport and multiple tiles exist
- **THEN** tiles wrap onto additional lines rather than overflowing horizontally

### Requirement: Component emits change and rejection events
The component SHALL emit a `wmxFilesChanged` event whenever the file list changes (addition or removal), carrying the current list of native `File` objects. The component SHALL emit a `wmxFileRejected` event when files are filtered out by `accept`, carrying the rejected native `File` objects.

#### Scenario: Files changed event on selection
- **WHEN** the user selects or drops valid files
- **THEN** a `wmxFilesChanged` event is emitted whose detail contains the updated full list of `File` objects

#### Scenario: Files changed event on removal
- **WHEN** the user removes a file
- **THEN** a `wmxFilesChanged` event is emitted whose detail contains the updated (shorter) list of `File` objects

#### Scenario: Rejection event on invalid drop
- **WHEN** the user drops files that do not match `accept`
- **THEN** a `wmxFileRejected` event is emitted whose detail contains the rejected `File` objects

### Requirement: Starter sample component is removed
The library SHALL no longer ship the `my-component` starter sample. The `<my-component>` tag, its source files, tests, and exports SHALL be removed.

#### Scenario: No my-component export
- **WHEN** the library is built
- **THEN** no `my-component` component or `./my-component` package export is present in the output

#### Scenario: file-uploader export is present
- **WHEN** the library is built
- **THEN** a `./file-uploader` package export and the `<wmx-file-uploader>` custom element are present in the output