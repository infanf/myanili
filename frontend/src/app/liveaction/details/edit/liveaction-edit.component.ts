import { ChangeDetectionStrategy, Component, HostListener, Input, OnInit } from '@angular/core';
import { TmdbComponent } from '@external/tmdb/tmdb.component';
import { Liveaction, LiveactionUpdate } from '@models/liveaction';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DialogueService } from '@services/dialogue.service';
import { LiveactionService } from '@services/liveaction/liveaction.service';

interface Mapping {
  type: 'movie' | 'tv';
  tmdb?: number;
  season: number;
  anisearch?: number;
  mdl?: string;
}

@Component({
  selector: 'myanili-liveaction-edit',
  templateUrl: './liveaction-edit.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class LiveactionEditComponent implements OnInit {
  @Input() liveaction?: Liveaction;
  @Input() title = '';

  edit?: LiveactionUpdate;
  mapping?: Mapping;
  episodes = 0;
  busy = false;

  private originalEdit = '';
  private originalMapping = '';

  constructor(
    public modal: NgbActiveModal,
    private modalService: NgbModal,
    private dialogue: DialogueService,
    private liveactionService: LiveactionService,
  ) {}

  ngOnInit() {
    if (!this.liveaction) return;
    const status = this.liveaction.my_list_status;
    this.edit = {
      status: status?.status || 'plan_to_watch',
      score: status?.score || 0,
      num_watched_episodes: status?.num_watched_episodes || 0,
      comment: status?.comment || '',
    };
    const meta = this.liveaction.meta;
    this.mapping = {
      type: meta?.mediaType || (this.liveaction.platform === '电影' ? 'movie' : 'tv'),
      tmdb: meta?.tmdb,
      season: meta?.season || 1,
      anisearch: meta?.anisearch || undefined,
      mdl: meta?.mdl || undefined,
    };
    this.episodes = this.liveactionService.getEpisodes(this.liveaction, meta);
    this.originalEdit = JSON.stringify(this.edit);
    this.originalMapping = JSON.stringify(this.mapping);
  }

  get isMovie() {
    return this.mapping?.type === 'movie';
  }

  hasUnsavedChanges(): boolean {
    return (
      JSON.stringify(this.edit) !== this.originalEdit ||
      JSON.stringify(this.mapping) !== this.originalMapping
    );
  }

  async save() {
    if (!this.liveaction || !this.edit || !this.mapping) return;
    this.busy = true;
    try {
      if (JSON.stringify(this.mapping) !== this.originalMapping) {
        this.liveaction.meta = await this.liveactionService.setMapping(this.liveaction.id, {
          type: this.mapping.type,
          tmdb: this.mapping.tmdb || undefined,
          season: this.isMovie ? 1 : this.mapping.season,
          anisearch: this.mapping.anisearch || undefined,
          mdl: this.mapping.mdl?.trim() || undefined,
        });
      }
      const data = { ...this.edit };
      if (data.status === 'completed' && this.episodes) {
        data.num_watched_episodes = this.episodes;
      }
      await this.liveactionService.update(this.liveaction, data);
      this.modal.close(true);
    } catch (error: unknown) {
      this.busy = false;
      const message = (error as { message?: string })?.message || 'Unknown error';
      await this.dialogue.confirm(`Failed to save: ${message}`, 'Save Failed');
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
    if (!this.liveaction) return;
    const confirmed = await this.dialogue.confirm(
      `Are you sure you want to delete "${this.title}"?`,
      'Remove Entry',
    );
    if (!confirmed) return;
    this.busy = true;
    try {
      await this.liveactionService.delete(this.liveaction);
      this.modal.close('deleted');
    } catch (error: unknown) {
      this.busy = false;
      const message = (error as { message?: string })?.message || 'Unknown error';
      await this.dialogue.confirm(`Failed to delete: ${message}`, 'Delete Failed');
    }
  }

  async findTmdb() {
    if (!this.liveaction || !this.mapping) return;
    const modal = this.modalService.open(TmdbComponent, { size: 'lg' });
    modal.componentInstance.title = this.liveaction.name;
    modal.componentInstance.type = this.mapping.type;
    modal.closed.subscribe(value => {
      if (this.mapping) this.mapping.tmdb = Number(value) || undefined;
    });
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      if (!this.busy) this.save();
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      if (!this.busy) this.cancel();
    }
  }
}
