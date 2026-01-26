import { Component, HostListener, Input, OnInit } from '@angular/core';
import { StreamPipe } from '@components/stream.pipe';
import { AnnComponent } from '@external/ann/ann.component';
import { AnnictComponent } from '@external/annict/annict.component';
import { KitsuComponent } from '@external/kitsu/kitsu.component';
import { LivechartComponent } from '@external/livechart/livechart.component';
import { TraktComponent } from '@external/trakt/trakt.component';
import {
  Anime,
  AnimeExtension,
  MyAnimeUpdate,
  MyAnimeUpdateExtended,
  parseExtension,
} from '@models/anime';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AnimeService } from '@services/anime/anime.service';
import { DialogueService } from '@services/dialogue.service';
import { Base64 } from 'js-base64';
import Timezone from 'timezone-enum';

@Component({
  selector: 'myanili-anime-edit',
  templateUrl: './anime-edit.component.html',
  standalone: false,
})
export class AnimeEditComponent implements OnInit {
  @Input() anime?: Anime;
  @Input() traktUser?: string;
  @Input() annictUser?: string;

  editBackup?: Partial<MyAnimeUpdate>;
  editExtension?: { simulcast: {} } & AnimeExtension;
  busy = false;

  private originalBackup?: string;
  private originalExtension?: string;

  constructor(
    public modal: NgbActiveModal,
    private animeService: AnimeService,
    private dialogue: DialogueService,
    private modalService: NgbModal,
    public streamPipe: StreamPipe,
  ) {}

  async ngOnInit() {
    if (!this.anime?.my_list_status) return;

    // Initialize backup objects (copied from details startEdit method)
    this.editBackup = {
      status: this.anime.my_list_status.status || 'plan_to_watch',
      is_rewatching: this.anime.my_list_status.is_rewatching,
      score: this.anime.my_list_status.score,
      num_watched_episodes: this.anime.my_list_status.num_episodes_watched,
      priority: this.anime.my_list_status.priority,
      rewatch_value: this.anime.my_list_status.rewatch_value,
      start_date: this.anime.my_list_status.start_date,
      finish_date: this.anime.my_list_status.finish_date,
      tags: this.anime.my_list_status.tags?.join(','),
    };

    try {
      const extension = parseExtension(this.anime.my_list_status.comments);
      this.editExtension = {
        series: '',
        seasonNumber: 1,
        episodeCorOffset: 0,
        ...this.anime.my_extension,
        ...extension,
      };
    } catch (e) {
      this.editExtension = {
        series: '',
        seasonNumber: 1,
        episodeCorOffset: 0,
        externalStreaming: '',
        externalStreamingId: '',
        simulcast: {},
        ...this.anime.my_extension,
      };
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
    if (!this.anime?.my_list_status) return;
    if (!this.editBackup) {
      this.modal.dismiss();
      return;
    }

    this.busy = true;

    try {
      const updateData = {
        comments: this.editExtension?.comment || '',
        status: this.editBackup?.status || this.anime.my_list_status.status,
        is_rewatching: this.editBackup?.is_rewatching || this.anime.my_list_status.is_rewatching,
        extension: Base64.encode(JSON.stringify(this.editExtension)),
      } as MyAnimeUpdateExtended;

      // Include only changed fields
      if (this.editBackup.status && this.editBackup.status !== this.anime.my_list_status.status) {
        updateData.status = this.editBackup.status;
      }
      if (
        this.editBackup.is_rewatching !== undefined &&
        this.editBackup.is_rewatching !== this.anime.my_list_status.is_rewatching
      ) {
        updateData.is_rewatching = this.editBackup?.is_rewatching;
      }
      if (this.editBackup.score !== this.anime.my_list_status.score) {
        updateData.score = this.editBackup?.score;
      }
      if (this.editBackup.num_watched_episodes !== this.anime.my_list_status.num_episodes_watched) {
        updateData.num_watched_episodes = this.editBackup?.num_watched_episodes;
      }
      if (this.editBackup.priority !== this.anime.my_list_status.priority) {
        updateData.priority = this.editBackup?.priority;
      }
      if (this.editBackup.rewatch_value !== this.anime.my_list_status.rewatch_value) {
        updateData.rewatch_value = this.editBackup?.rewatch_value;
      }
      if (this.editBackup.tags !== this.anime.my_list_status.tags?.join(',')) {
        updateData.tags = this.editBackup?.tags;
      }
      if (this.editBackup.start_date !== this.anime.my_list_status.start_date) {
        updateData.start_date = this.editBackup?.start_date;
      }
      if (this.editBackup.finish_date !== this.anime.my_list_status.finish_date) {
        updateData.finish_date = this.editBackup?.finish_date;
      }

      await this.animeService.updateAnime(
        {
          malId: this.anime.id,
          anilistId: this.anime.my_extension?.anilistId,
          kitsuId: this.anime.my_extension?.kitsuId,
          anisearchId: this.anime.my_extension?.anisearchId,
          simklId: this.anime.my_extension?.simklId,
          annictId: this.anime.my_extension?.annictId,
          trakt: {
            id: this.anime.my_extension?.trakt,
            season: this.anime.media_type === 'movie' ? -1 : this.anime.my_extension?.seasonNumber,
          },
          livechartId: this.anime.my_extension?.livechartId,
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
        errorMessage = 'Anime not found. It may have been deleted.';
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

  async deleteEntry() {
    if (!this.anime) return;
    const confirmed = await this.dialogue.confirm(
      `Are you sure you want to delete "${this.anime.title}"?`,
      'Remove Entry',
    );
    if (!confirmed) return;

    this.busy = true;
    try {
      await this.animeService.deleteAnime({
        malId: this.anime.id,
        anilistId: this.anime.my_extension?.anilistId,
        kitsuId: this.anime.my_extension?.kitsuId,
        anisearchId: this.anime.my_extension?.anisearchId,
        simklId: this.anime.my_extension?.simklId,
        annictId: this.anime.my_extension?.annictId,
        traktId: this.anime.my_extension?.trakt,
        livechartId: this.anime.my_extension?.livechartId,
      });
      this.modal.close('deleted'); // Signal deletion to parent
    } catch (error: unknown) {
      this.busy = false;
      const err = error as { status?: number; message?: string };
      let errorMessage = 'Failed to delete entry. Please try again.';

      if (err?.status === 0) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (err?.status === 401 || err?.status === 403) {
        errorMessage = 'Authentication error. Please log in again.';
      } else if (err?.status === 404) {
        errorMessage = 'Entry not found. It may have been already deleted.';
      } else if (err?.message) {
        errorMessage = `Error: ${err.message}`;
      }

      await this.dialogue.confirm(errorMessage, 'Delete Failed');
    }
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

  changeWatchlist() {
    const hideWatchlist = !this.editExtension?.hideWatchlist;
    if (!this.editExtension) this.editExtension = { hideWatchlist, simulcast: {} };
    this.editExtension.hideWatchlist = hideWatchlist;
  }

  enableKitsu() {
    if (!this.editExtension) return false;
    if (!this.editExtension.kitsuId) {
      this.editExtension.kitsuId = { kitsuId: '' };
    }
    return true;
  }

  // External ID search methods (copied from details component)
  async findTrakt() {
    if (!this.anime || !this.editExtension) return;
    const modal = this.modalService.open(TraktComponent);
    modal.componentInstance.isMovie = this.anime.media_type === 'movie';
    modal.componentInstance.title = this.anime.title;
    modal.closed.subscribe(value => {
      if (this.editExtension) this.editExtension.trakt = String(value);
    });
  }

  async findKitsu() {
    if (!this.anime || !this.editExtension) return;
    const modal = this.modalService.open(KitsuComponent);
    modal.componentInstance.title = this.anime.title;
    modal.closed.subscribe(value => {
      if (this.editExtension) this.editExtension.kitsuId = { kitsuId: Number(value) };
    });
  }

  async findAnnict() {
    if (!this.anime || !this.editExtension) return;
    const modal = this.modalService.open(AnnictComponent);
    modal.componentInstance.title = this.anime.alternative_titles?.ja || this.anime.title;
    modal.closed.subscribe(value => {
      if (this.editExtension) this.editExtension.annictId = Number(value);
    });
  }

  async findLivechart() {
    if (!this.anime || !this.editExtension) return;
    const modal = this.modalService.open(LivechartComponent);
    modal.componentInstance.title = this.anime.title;
    modal.closed.subscribe(value => {
      if (this.editExtension) this.editExtension.livechartId = Number(value);
    });
  }

  async findANN() {
    if (!this.anime || !this.editExtension) return;
    const modal = this.modalService.open(AnnComponent);
    modal.componentInstance.title =
      this.anime.alternative_titles?.en?.replace(/^The /, '') || this.anime.title;
    modal.componentInstance.type = 'anime';
    modal.closed.subscribe(value => {
      if (this.editExtension) this.editExtension.annId = Number(value);
    });
  }

  get timezones() {
    return Object.values(Timezone);
  }
}
