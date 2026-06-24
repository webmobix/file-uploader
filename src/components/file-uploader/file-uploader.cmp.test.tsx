import { render, h, describe, it, expect, vi } from '@stencil/vitest';

describe('wmx-file-uploader', () => {
  it('renders drop zone with no props', async () => {
    const { root } = await render(<wmx-file-uploader></wmx-file-uploader>);
    expect(root).toBeDefined();
    const shadow = root.shadowRoot!;
    expect(shadow.querySelector('.drop-zone')).not.toBeNull();
    expect(shadow.querySelector('.tile')).toBeNull();
  });

  it('click-to-choose opens file chooser', async () => {
    const { root, waitForChanges } = await render(<wmx-file-uploader></wmx-file-uploader>);
    const shadow = root.shadowRoot!;
    const input = shadow.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click');
    const dropZone = shadow.querySelector('.drop-zone') as HTMLElement;
    dropZone.click();
    await waitForChanges();
    expect(clickSpy).toHaveBeenCalled();
  });

  it('accept filtering on dropped files emits wmxFileRejected', async () => {
    const { root, waitForChanges } = await render(<wmx-file-uploader accept="image/*"></wmx-file-uploader>);
    const rejectedSpy = vi.fn();
    root.addEventListener('wmxFileRejected', rejectedSpy);
    const changedSpy = vi.fn();
    root.addEventListener('wmxFilesChanged', changedSpy);

    const dropZone = root.shadowRoot!.querySelector('.drop-zone') as HTMLElement;
    const textFile = new File(['text'], 'test.txt', { type: 'text/plain' });
    const pngFile = new File(['png'], 'test.png', { type: 'image/png' });

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(textFile);
    dataTransfer.items.add(pngFile);

    dropZone.dispatchEvent(new DragEvent('drop', { dataTransfer, bubbles: true }));
    await waitForChanges();

    expect(rejectedSpy).toHaveBeenCalled();
    expect(rejectedSpy.mock.calls[0][0].detail.files).toHaveLength(1);
    expect(rejectedSpy.mock.calls[0][0].detail.files[0].name).toBe('test.txt');
    expect(changedSpy).toHaveBeenCalled();
    expect(changedSpy.mock.calls[0][0].detail.files).toHaveLength(1);
    expect(changedSpy.mock.calls[0][0].detail.files[0].name).toBe('test.png');
  });

  it('image tiles render img and non-image tiles render type label with filename title', async () => {
    const { root, waitForChanges } = await render(<wmx-file-uploader multiple></wmx-file-uploader>);
    const dropZone = root.shadowRoot!.querySelector('.drop-zone') as HTMLElement;

    const pngFile = new File(['png'], 'photo.png', { type: 'image/png' });
    const pdfFile = new File(['pdf'], 'doc.pdf', { type: 'application/pdf' });

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(pngFile);
    dataTransfer.items.add(pdfFile);

    dropZone.dispatchEvent(new DragEvent('drop', { dataTransfer, bubbles: true }));
    await waitForChanges();

    const tiles = root.shadowRoot!.querySelectorAll('.tile');
    expect(tiles).toHaveLength(2);

    const img = tiles[0].querySelector('img');
    expect(img).not.toBeNull();
    expect(img!.getAttribute('alt')).toBe('photo.png');

    const placeholder = tiles[1].querySelector('.placeholder');
    expect(placeholder).not.toBeNull();
    expect(placeholder!.textContent).toBe('PDF');
    expect(tiles[1].getAttribute('title')).toBe('doc.pdf');
  });

  it('remove button removes file and emits wmxFilesChanged', async () => {
    const { root, waitForChanges } = await render(<wmx-file-uploader></wmx-file-uploader>);
    const changedSpy = vi.fn();
    root.addEventListener('wmxFilesChanged', changedSpy);

    const dropZone = root.shadowRoot!.querySelector('.drop-zone') as HTMLElement;
    const pngFile = new File(['png'], 'photo.png', { type: 'image/png' });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(pngFile);
    dropZone.dispatchEvent(new DragEvent('drop', { dataTransfer, bubbles: true }));
    await waitForChanges();

    expect(root.shadowRoot!.querySelectorAll('.tile')).toHaveLength(1);

    const removeBtn = root.shadowRoot!.querySelector('.remove-btn') as HTMLElement;
    removeBtn.click();
    await waitForChanges();

    expect(root.shadowRoot!.querySelectorAll('.tile')).toHaveLength(0);
    expect(changedSpy).toHaveBeenCalledTimes(2);
    expect(changedSpy.mock.calls[1][0].detail.files).toHaveLength(0);
  });

  it('single-file mode replaces existing file and hides drop zone', async () => {
    const { root, waitForChanges } = await render(<wmx-file-uploader></wmx-file-uploader>);
    const dropZone = root.shadowRoot!.querySelector('.drop-zone') as HTMLElement;

    const file1 = new File(['png1'], 'first.png', { type: 'image/png' });
    const dt1 = new DataTransfer();
    dt1.items.add(file1);
    dropZone.dispatchEvent(new DragEvent('drop', { dataTransfer: dt1, bubbles: true }));
    await waitForChanges();

    expect(root.shadowRoot!.querySelectorAll('.tile')).toHaveLength(1);
    expect(root.shadowRoot!.querySelector('.drop-zone')).toBeNull();

    const file2 = new File(['png2'], 'second.png', { type: 'image/png' });
    const dt2 = new DataTransfer();
    dt2.items.add(file2);
    const hiddenInput = root.shadowRoot!.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(hiddenInput, 'files', { value: dt2.files });
    hiddenInput.dispatchEvent(new Event('change'));
    await waitForChanges();

    expect(root.shadowRoot!.querySelectorAll('.tile')).toHaveLength(1);
  });

  it('multi-file mode renders trailing upload box after files', async () => {
    const { root, waitForChanges } = await render(<wmx-file-uploader multiple></wmx-file-uploader>);
    const dropZone = root.shadowRoot!.querySelector('.drop-zone') as HTMLElement;

    const file1 = new File(['png1'], 'first.png', { type: 'image/png' });
    const dt1 = new DataTransfer();
    dt1.items.add(file1);
    dropZone.dispatchEvent(new DragEvent('drop', { dataTransfer: dt1, bubbles: true }));
    await waitForChanges();

    expect(root.shadowRoot!.querySelectorAll('.tile')).toHaveLength(1);
    expect(root.shadowRoot!.querySelector('.drop-zone')).not.toBeNull();
  });

  it('drag-over sets drag-over class and drop clears it', async () => {
    const { root, waitForChanges } = await render(<wmx-file-uploader multiple></wmx-file-uploader>);
    const dropZone = root.shadowRoot!.querySelector('.drop-zone') as HTMLElement;

    dropZone.dispatchEvent(new DragEvent('dragenter', { bubbles: true }));
    await waitForChanges();
    expect(dropZone.classList.contains('drag-over')).toBe(true);

    dropZone.dispatchEvent(new DragEvent('dragleave', { bubbles: true }));
    await waitForChanges();
    expect(dropZone.classList.contains('drag-over')).toBe(false);

    dropZone.dispatchEvent(new DragEvent('dragenter', { bubbles: true }));
    await waitForChanges();
    expect(dropZone.classList.contains('drag-over')).toBe(true);

    const pngFile = new File(['png'], 'test.png', { type: 'image/png' });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(pngFile);
    dropZone.dispatchEvent(new DragEvent('drop', { dataTransfer, bubbles: true }));
    await waitForChanges();
    expect(dropZone.classList.contains('drag-over')).toBe(false);
  });
});
