## Context

The repository is a Stencil Web Component library (namespace `files-component`) configured with both `dist` (lazy-loading loader) and `dist-custom-elements` (`auto-define-custom-elements`) output targets. It currently contains only the starter `my-component` sample and no real reusable component. We are introducing the first real component, `<wmx-file-uploader>`, which must be self-contained, framework-agnostic, and usable via a single custom element tag with no consumer-side wiring of upload UX.

Constraints:
- Stencil 4/5, TypeScript, JSX, Shadow DOM (per existing component convention).
- No new runtime dependencies; use native File, `URL.createObjectURL`, and drag-and-drop APIs.
- Tests run via `@stencil/vitest` (Vitest + Playwright browser).
- Package must remain publishable with current exports structure.

## Goals / Non-Goals

**Goals:**
- Deliver a single custom element that encapsulates the full file-upload UX: drag-and-drop, click-to-choose, previews, and removal.
- Mirror the native `<input type="file">` configuration surface via `multiple` and `accept` props so it is intuitive to adopt.
- Render correct previews: aspect-ratio-preserving thumbnails for images; type-labeled placeholder boxes with filename tooltip for non-images.
- Support a continuous "add more" flow when `multiple` is enabled by rendering an empty upload box after the last tile.
- Responsive layout: flex row that wraps to new lines on narrow viewports.
- Provide events so consumers can react to selection/removal without coupling to internals.

**Non-Goals:**
- Server-side upload / progress / network transport. The component handles local selection and preview only; transport is the consumer's responsibility.
- File validation beyond `accept` filtering (no size limits, no custom validators in this change).
- Reordering, sorting, or renaming of selected files.
- Accessibility beyond basic keyboard focus on the drop zone and remove buttons (full ARIA file-grid semantics deferred).
- Theming/CSS custom properties API beyond reasonable defaults (a small set of CSS variables for sizing/colors is acceptable but not a full design-token system).

## Decisions

### 1. Component tag and file layout
**Decision**: New component at `src/components/file-uploader/file-uploader.tsx` with tag `wmx-file-uploader`, Shadow DOM enabled, co-located `file-uploader.css`. Remove `src/components/my-component/` and its references in `src/index.ts` and `src/components.d.ts`.

**Rationale**: `wmx` prefix (webmobix) keeps the tag short and namespaced without using `stencil`. Co-located CSS follows the existing `my-component` convention. Removing the starter sample avoids shipping a placeholder component.

**Alternatives considered**: Keep `my-component` alongside (rejected - confusing for consumers and bloats the package); use a longer prefix like `files-component-uploader` (rejected - verbose).

### 2. State management: internal `@State` file list
**Decision**: Maintain an internal `@State() files: SelectedFile[]` array. Each entry holds the native `File`, a generated `id`, a `previewUrl` (object URL for images, `null` otherwise), and a derived `typeLabel` for non-images. Props `multiple` and `accept` are `@Prop()` with `mutable: false`; they configure behavior but do not carry the file list.

**Rationale**: The component encapsulates upload state so consumers need no local state plumbing. Object URLs give cheap image previews without reading file bytes. A stable `id` (e.g., `crypto.randomUUID()`) keys tiles for stable re-renders and removal.

**Alternatives considered**: Make `files` a `@Prop` controlled by the consumer (rejected - breaks encapsulation goal and doubles wiring); read image bytes into base64 (rejected - heavier, blocking).

### 3. Native input for file chooser, hidden
**Decision**: Render a hidden `<input type="file">` inside the shadow root. The drop zone's click handler calls `input.click()`. The input's `change` event feeds the same ingestion path as drop events. The input is recreated/reset between selections so the same file can be re-selected.

**Rationale**: Reusing the native input guarantees correct `accept`/`multiple` behavior in the OS dialog and accessibility, with no custom dialog logic.

**Alternatives considered**: Build a purely custom picker (rejected - cannot match native OS dialog and a11y).

### 4. Accept filtering
**Decision**: Apply `accept` to the hidden input's `accept` attribute so the OS dialog filters. Additionally, on ingestion (drop or change), programmatically filter dropped files against `accept` when the browser does not enforce it for drops (drops bypass the input's accept). Matching supports both MIME types (`image/*`, `image/png`) and extensions (`.pdf`). `image/*` is treated as any image MIME.

**Rationale**: Drag-and-drop does not honor `<input accept>`, so a secondary guard is required to honor the contract. Keeping the input attribute too gives the native dialog UX benefit.

**Alternatives considered**: Rely only on the input attribute (rejected - drops would bypass it); reject silently vs. emit an event (decision: filter out invalid files and emit a `wmxFileRejected` event so consumers can show feedback).

### 5. Image vs. non-image preview
**Decision**: Detect images via `file.type.startsWith('image/')`. For images, create `URL.createObjectURL(file)` and render an `<img>` with `object-fit: contain` inside a square tile so the aspect ratio is preserved within the fixed tile. For non-images, render a box whose content is a short type label derived from `file.type` (e.g., `application/pdf` → `PDF`, `text/csv` → `CSV`, unknown → `FILE`) and set `title={file.name}` on the tile for hover tooltip.

**Rationale**: Object URLs are async-free and cheap. `object-fit: contain` preserves aspect ratio without distortion. Deriving a label from MIME avoids needing a file-extension icon set (non-goal: full icon system).

**Alternatives considered**: Use file-extension-based icons (rejected - requires asset bundling, out of scope); show filename text inside the box (rejected - requested: type label inside, filename as hover title).

### 6. Object URL lifecycle
**Decision**: Track each created object URL on its `SelectedFile` and call `URL.revokeObjectURL` on removal of a file and on `disconnectedCallback` to avoid leaks. Recreate nothing on re-render; URLs are created once at ingestion.

**Rationale**: Object URLs persist until revoked and can leak memory; explicit cleanup is required.

### 7. Layout: flex wrap with trailing upload box
**Decision**: Root container is a `display: flex; flex-wrap: wrap; gap` row. Tiles are fixed-size squares (CSS variable `--wmx-tile-size`, default e.g. 96px). When `multiple` is true, render an extra "add" tile (same square drop zone) as the last flex child, after the file tiles. When `multiple` is false, render the drop zone only when no file is selected; once a file is selected, hide the drop zone (single-file mode shows just the one tile).

**Rationale**: Matches the requested UX: empty upload box appears to the right of the last upload; flex wrap handles mobile newline breaks. Single-file mode hides the box to avoid a dangling empty slot.

**Alternatives considered**: Always show the drop zone as a separate area below tiles (rejected - does not match "to the right of the last upload" requirement).

### 8. Drag-over visual state
**Decision**: Track a `@State() isDragOver` boolean. On `dragenter`/`dragover` set true (and `preventDefault` to allow drop); on `dragleave`/`drop` set false. Apply a CSS class that changes border (e.g., thicker, accent color) and background (light accent fill). Use `dragenter`/`dragleave` count or `relatedTarget` null-check to avoid flicker when moving over child elements inside the zone.

**Rationale**: Native DnD fires `dragleave` on child boundaries; a counter or relatedTarget guard prevents flicker. The visual change is the requested hover affordance.

### 9. Remove control
**Decision**: Each tile renders a button in its top-right corner with an `X` glyph (text/SVG). Clicking removes the file from `files` (revoking its object URL) and emits `wmxFileRemoved`. The button has `type="button"` and an `aria-label` like "Remove <filename>".

**Rationale**: Top-right X matches the request; a real `<button>` gives keyboard access and focus. Revoking URL on removal prevents leaks.

### 10. Events
**Decision**: Emit custom events via Stencil `@Event`:
- `wmxFilesChanged` - detail `{ files: File[] }` - fires after any selection or removal (full current list).
- `wmxFileRejected` - detail `{ files: File[] }` - fires when dropped files are filtered out by `accept`.

Events use kebab-case DOM names automatically derived from camelCase emitter names by Stencil.

**Rationale**: Lets consumers react to state changes and invalid drops without inspecting internals. Keeping a single `wmxFilesChanged` for both add and remove simplifies consumer wiring.

**Alternatives considered**: Separate `wmxFileAdded`/`wmxFileRemoved` plus a combined change (rejected - no clear need for granularity in this change; can add later).

### 11. Cleanup of starter code and exports
**Decision**: Delete `src/components/my-component/` and its test. Update `src/index.ts` to drop the `format` utility export only if it is solely used by `my-component` (it is - remove it and `src/utils/utils.ts` if unused elsewhere, but keep `utils.ts` only if still referenced). Regenerate `src/components.d.ts` via build. Update package `exports` map to expose `./file-uploader` analogous to the existing `./my-component` entry.

**Rationale**: Ship a clean library with only the real component.

## Risks / Trade-offs

- [Drag-over flicker on nested elements] → Mitigation: use a dragenter/dragleave counter scoped to the drop zone, or check `event.relatedTarget` is null/outside the zone before clearing `isDragOver`.
- [Object URL memory leaks if component is removed abruptly] → Mitigation: revoke all URLs in `disconnectedCallback`.
- [`accept` matching for drops is imperfect (e.g., `image/*` vs. extensions)] → Mitigation: implement a small matcher handling `*` wildcards, MIME prefixes, and `.ext` forms; document that matching is best-effort like the native input.
- [Large image files may create many/big object URLs] → Mitigation: revoke on removal; acceptable for this scope. Non-goal: thumbnail generation/resizing.
- [Shadow DOM prevents consumers from styling internals easily] → Mitigation: expose a small set of CSS custom properties (`--wmx-tile-size`, `--wmx-accent-color`, `--wmx-border-color`) so basic theming works without piercing the shadow boundary.
- [Removing `my-component` is a breaking change for any early adopter] → Mitigation: project is pre-1.0 (0.0.1) and starter-only; acceptable. Bump version and note in changelog.
- [Single-file mode hiding the drop zone after selection may surprise users expecting to replace] → Mitigation: in single mode, selecting a new file via the hidden input replaces the existing one (drop zone remains hidden but re-clicking the tile or a small replace affordance could be added later). For this change, single-file mode: clicking the selected tile reopens the chooser to replace. Documented as a scenario.

## Migration Plan

1. Implement the new component and tests.
2. Remove `my-component` and its references; update `src/index.ts` and package `exports`.
3. Run `npm run build` to regenerate `src/components.d.ts` and dist outputs.
4. Run `npm test` to verify.
5. Rollback: revert the commit; no data migration involved since this is a client-only component library.

## Open Questions

- Should `wmxFilesChanged` emit the native `File[]` or a serializable subset? Current decision: native `File[]` (consumers typically need the File for upload). Revisit if non-DOM consumers need JSON.
- Default tile size value (`96px`) - confirm with design review; exposed via CSS variable so adjustable without code change.