import { Component, Prop, State, Event, EventEmitter, h } from '@stencil/core';

interface SelectedFile {
  id: string;
  file: File;
  previewUrl: string | null;
  typeLabel: string;
}

@Component({
  tag: 'wmx-file-uploader',
  styleUrl: 'file-uploader.css',
  shadow: true,
})
export class FileUploader {
  /** When true, allows selecting multiple files. When false, holds at most one. */
  @Prop() multiple: boolean = false;

  /** Comma-separated MIME types and/or extensions (e.g. `image/*,.pdf`). */
  @Prop() accept: string = '';

  @State() files: SelectedFile[] = [];

  @State() isDragOver: boolean = false;

  /** Emitted when files are added or removed. */
  @Event() wmxFilesChanged: EventEmitter<{ files: File[] }>;

  /** Emitted when dropped files don't match `accept`. */
  @Event() wmxFileRejected: EventEmitter<{ files: File[] }>;

  private fileInput?: HTMLInputElement;

  private openFileChooser() {
    if (this.fileInput) {
      this.fileInput.value = '';
      this.fileInput.click();
    }
  }

  private matchesAccept(file: File, accept: string): boolean {
    if (!accept) return true;
    const types = accept.split(',').map(t => t.trim());
    return types.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      if (type.endsWith('/*')) {
        const prefix = type.slice(0, -1);
        return file.type.startsWith(prefix);
      }
      return file.type === type;
    });
  }

  private ingestFiles(fileList: FileList | File[]) {
    const incoming = Array.from(fileList);
    const accepted: File[] = [];
    const rejected: File[] = [];

    for (const file of incoming) {
      if (this.matchesAccept(file, this.accept)) {
        accepted.push(file);
      } else {
        rejected.push(file);
      }
    }

    if (rejected.length > 0) {
      this.wmxFileRejected.emit({ files: rejected });
    }

    if (accepted.length === 0) return;

    if (!this.multiple) {
      for (const f of this.files) {
        if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
      }
      this.files = [];
    }

    const newEntries: SelectedFile[] = accepted.map(file => {
      const isImage = file.type.startsWith('image/');
      return {
        id: crypto.randomUUID(),
        file,
        previewUrl: isImage ? URL.createObjectURL(file) : null,
        typeLabel: this.deriveTypeLabel(file.type),
      };
    });

    this.files = [...this.files, ...newEntries];
    this.wmxFilesChanged.emit({ files: this.files.map(f => f.file) });
  }

  private deriveTypeLabel(mime: string): string {
    if (!mime) return 'FILE';
    const parts = mime.split('/');
    if (parts.length === 2 && parts[1]) {
      return parts[1].toUpperCase();
    }
    return 'FILE';
  }

  private handleFileInputChange = () => {
    if (this.fileInput?.files) {
      this.ingestFiles(this.fileInput.files);
    }
  };

  private removeFile(id: string) {
    const entry = this.files.find(f => f.id === id);
    if (entry) {
      if (entry.previewUrl) URL.revokeObjectURL(entry.previewUrl);
      this.files = this.files.filter(f => f.id !== id);
      this.wmxFilesChanged.emit({ files: this.files.map(f => f.file) });
    }
  }

  disconnectedCallback() {
    for (const f of this.files) {
      if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
    }
  }

  private dragCounter = 0;

  private handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    this.dragCounter++;
    this.isDragOver = true;
  };

  private handleDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  private handleDragLeave = (_e: DragEvent) => {
    this.dragCounter--;
    if (this.dragCounter <= 0) {
      this.dragCounter = 0;
      this.isDragOver = false;
    }
  };

  private handleDrop = (e: DragEvent) => {
    e.preventDefault();
    this.dragCounter = 0;
    this.isDragOver = false;
    if (e.dataTransfer?.files) {
      this.ingestFiles(e.dataTransfer.files);
    }
  };

  render() {
    const showDropZone = this.multiple || this.files.length === 0;

    return (
      <div class="root">
        <input type="file" accept={this.accept} multiple={this.multiple} ref={el => (this.fileInput = el)} onChange={this.handleFileInputChange} style={{ display: 'none' }} />
        {this.files.map(f => (
          <div class="tile" key={f.id} title={f.file.name}>
            {f.previewUrl ? <img class="preview" src={f.previewUrl} alt={f.file.name} /> : <div class="placeholder">{f.typeLabel}</div>}
            <button type="button" class="remove-btn" aria-label={`Remove ${f.file.name}`} onClick={() => this.removeFile(f.id)}>
              X
            </button>
          </div>
        ))}
        {showDropZone && (
          <div
            class={`drop-zone${this.isDragOver ? ' drag-over' : ''}`}
            onClick={() => this.openFileChooser()}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') this.openFileChooser();
            }}
            tabIndex={0}
            role="button"
            aria-label="Choose files to upload"
            onDragEnter={this.handleDragEnter}
            onDragOver={this.handleDragOver}
            onDragLeave={this.handleDragLeave}
            onDrop={this.handleDrop}
          >
            +
          </div>
        )}
      </div>
    );
  }
}
