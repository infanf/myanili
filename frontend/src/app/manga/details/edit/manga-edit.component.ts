import { Component, HostListener, Input, OnInit } from '@angular/core';
import { PlatformPipe } from '@components/platform.pipe';
import { AnnComponent } from '@external/ann/ann.component';
import { BakamangaComponent } from '@external/bakamanga/bakamanga.component';
import { KitsuComponent } from '@external/kitsu/kitsu.component';
import { Manga, MangaExtension, MyMangaUpdate, MyMangaUpdateExtended } from '@models/manga';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DialogueService } from '@services/dialogue.service';
import { MangaService } from '@services/manga/manga.service';
import { Base64 } from 'js-base64';

@Component({
  selector: 'myanili-manga-edit',
  templateUrl: './manga-edit.component.html',
  standalone: false,
})
export class MangaEditComponent implements OnInit {
  @Input() manga?: Manga;

  editBackup?: Partial<MyMangaUpdate>;
  editExtension?: MangaExtension;
  busy = false;

  private originalBackup?: string;
  private originalExtension?: string;

  constructor(
    public modal: NgbActiveModal,
    private mangaService: MangaService,
    private dialogue: DialogueService,
    private modalService: NgbModal,
    public platformPipe: PlatformPipe,
  ) {}

  async ngOnInit() {
    if (!this.manga?.my_list_status) return;

    // Initialize backup objects (copied from details startEdit method)
    this.editBackup = {
      status: this.manga.my_list_status.status || 'plan_to_read',
      is_rereading: this.manga.my_list_status.is_rereading,
      score: this.manga.my_list_status.score,
      num_chapters_read: this.manga.my_list_status.num_chapters_read,
      num_volumes_read: this.manga.my_list_status.num_volumes_read,
      priority: this.manga.my_list_status.priority,
      reread_value: this.manga.my_list_status.reread_value,
      start_date: this.manga.my_list_status.start_date,
      finish_date: this.manga.my_list_status.finish_date,
      tags: this.manga.my_list_status.tags,
    };

    try {
      const extension = JSON.parse(
        Base64.decode(this.manga.my_list_status.comments),
      ) as unknown as Partial<MangaExtension>;
      this.editExtension = {
        ...this.manga.my_extension,
        ...extension,
      };
    } catch (e) {
      this.editExtension = { ...this.manga.my_extension };
    }

    // Store original values for change detection
    this.originalBackup = JSON.stringify(this.editBackup);
    this.originalExtension = JSON.stringify(this.editExtension);
  }

  hasUnsavedChanges(): boolean {
    const currentBackup = JSON.stringify(this.editBackup);
    const currentExtension = JSON.stringify(this.editExtension);
    return currentBackup !== this.originalBackup || currentExtension !== this.originalExtension;
  }

  async save() {
    if (!this.manga?.my_list_status) return;
    if (!this.editBackup) {
      this.modal.dismiss();
      return;
    }

    this.busy = true;

    try {
      const updateData = {
        comments: this.editExtension?.comment || '',
        extension: Base64.encode(JSON.stringify(this.editExtension)),
        status: this.editBackup?.status || this.manga.my_list_status.status,
        is_rereading: this.editBackup?.is_rereading || this.manga.my_list_status.is_rereading,
      } as MyMangaUpdateExtended;

      // Include only changed fields
      if (this.editBackup.status && this.editBackup.status !== this.manga.my_list_status.status) {
        updateData.status = this.editBackup.status;
      }
      if (
        this.editBackup.is_rereading !== undefined &&
        this.editBackup.is_rereading !== this.manga.my_list_status.is_rereading
      ) {
        updateData.is_rereading = this.editBackup?.is_rereading;
      }
      if (this.editBackup.score !== this.manga.my_list_status.score) {
        updateData.score = this.editBackup?.score;
      }
      if (this.editBackup.num_chapters_read !== this.manga.my_list_status.num_chapters_read) {
        updateData.num_chapters_read = this.editBackup?.num_chapters_read;
      }
      if (this.editBackup.num_volumes_read !== this.manga.my_list_status.num_volumes_read) {
        updateData.num_volumes_read = this.editBackup?.num_volumes_read;
      }
      if (this.editBackup.priority !== this.manga.my_list_status.priority) {
        updateData.priority = this.editBackup?.priority;
      }
      if (this.editBackup.reread_value !== this.manga.my_list_status.reread_value) {
        updateData.reread_value = this.editBackup?.reread_value;
      }
      if (this.editBackup.tags !== this.manga.my_list_status.tags) {
        updateData.tags = this.editBackup?.tags;
      }
      if (this.editBackup.start_date !== this.manga.my_list_status.start_date) {
        updateData.start_date = this.editBackup?.start_date;
      }
      if (this.editBackup.finish_date !== this.manga.my_list_status.finish_date) {
        updateData.finish_date = this.editBackup?.finish_date;
      }

      await this.mangaService.updateManga(
        {
          malId: this.manga.id,
          anilistId: this.manga.my_extension?.anilistId,
          kitsuId: this.manga.my_extension?.kitsuId,
          anisearchId: this.manga.my_extension?.anisearchId,
          bakaId: this.manga.my_extension?.bakaId,
        },
        updateData,
      );

      this.busy = false;
      this.modal.close(true); // Signal success
    } catch (error: unknown) {
      this.busy = false;

      // Provide more specific error messages based on the error type
      let errorMessage = 'Failed to save changes. Please try again.';

      const err = error as { status?: number; message?: string };
      if (err?.status === 0) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (err?.status === 400) {
        errorMessage = 'Invalid data. Please check your inputs and try again.';
      } else if (err?.status === 401 || err?.status === 403) {
        errorMessage = 'Authentication error. Please log in again.';
      } else if (err?.status === 404) {
        errorMessage = 'Manga not found. It may have been deleted.';
      } else if (err?.status === 429) {
        errorMessage = 'Too many requests. Please wait a moment and try again.';
      } else if (err?.status && err.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (err?.message) {
        errorMessage = `Error: ${err.message}`;
      }

      await this.dialogue.confirm(errorMessage, 'Save Failed');
    }
  }

  async cancel() {
    if (this.hasUnsavedChanges()) {
      const confirmed = await this.dialogue.confirm(
        'You have unsaved changes. Are you sure you want to close without saving?',
        'Unsaved Changes',
      );
      if (!confirmed) return;
    }
    this.modal.dismiss();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Ctrl+Enter or Cmd+Enter to save
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      if (!this.busy) {
        this.save();
      }
    }
    // Escape to cancel
    if (event.key === 'Escape') {
      event.preventDefault();
      if (!this.busy) {
        this.cancel();
      }
    }
  }

  enableKitsu() {
    if (!this.editExtension) return false;
    if (!this.editExtension.kitsuId) {
      this.editExtension.kitsuId = { kitsuId: '' };
    }
    return true;
  }

  changeOngoing() {
    const ongoing = !this.editExtension?.ongoing;
    if (!this.editExtension) this.editExtension = { ongoing };
    this.editExtension.ongoing = ongoing;
  }

  changeShelf() {
    const hideShelf = !this.editExtension?.hideShelf;
    if (!this.editExtension) this.editExtension = { hideShelf };
    this.editExtension.hideShelf = hideShelf;
  }

  // External ID search methods (copied from manga details component)
  async findKitsu() {
    if (!this.manga || !this.editExtension) return;
    const modal = this.modalService.open(KitsuComponent);
    modal.componentInstance.type = 'manga';
    modal.componentInstance.title = this.manga.title;
    modal.closed.subscribe((value: number) => {
      if (this.editExtension) this.editExtension.kitsuId = { kitsuId: Number(value) };
    });
  }

  async findBaka() {
    if (!this.manga || !this.editExtension) return;
    const modal = this.modalService.open(BakamangaComponent);
    modal.componentInstance.title = this.manga.title;
    modal.closed.subscribe((value: string) => {
      if (this.editExtension) this.editExtension.bakaId = value;
    });
  }

  async findANN() {
    if (!this.manga || !this.editExtension) return;
    const modal = this.modalService.open(AnnComponent);
    modal.componentInstance.title =
      this.manga.alternative_titles?.en?.replace(/^The /, '') || this.manga.title;
    modal.componentInstance.type = 'manga';
    modal.closed.subscribe((value: number) => {
      if (this.editExtension) this.editExtension.annId = Number(value);
    });
  }
}
