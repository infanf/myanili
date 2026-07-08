import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Anime } from '@models/anime';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AnimeService } from '@services/anime/anime.service';
import { LivechartService } from '@services/anime/livechart.service';
import { SeasonPlannerService } from '@services/anime/season-planner.service';
import { AnisearchService } from '@services/anisearch.service';

@Component({
  selector: 'myanili-season-planner',
  templateUrl: './planner.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class SeasonPlannerComponent implements OnInit {
  @Input() animes: Array<Partial<Anime>> = [];
  @Input() year = 0;
  @Input() season = 0;

  queue: Array<Partial<Anime>> = [];
  current: Partial<Anime> | undefined;
  remaining = 0;
  busy = false;
  loading = true;

  // swipe state
  dragX = 0;
  dragging = false;
  private startX = 0;
  private pointerId = -1;
  animating = false;

  readonly SWIPE_THRESHOLD = 100;

  constructor(
    public modal: NgbActiveModal,
    private animeService: AnimeService,
    private plannerService: SeasonPlannerService,
    private livechart: LivechartService,
    private anisearch: AnisearchService,
  ) {}

  async ngOnInit() {
    this.queue = await this.plannerService.getUndecidedAnimes(this.animes, this.year, this.season);
    this.remaining = this.queue.length;
    this.next();
    this.loading = false;
  }

  private next() {
    this.current = this.queue.shift();
    this.remaining = this.queue.length + (this.current ? 1 : 0);
    this.dragX = 0;
    this.dragging = false;
    this.animating = false;
  }

  get swipeLabel(): 'WATCH' | 'SKIP' | null {
    if (this.dragX > 40) return 'WATCH';
    if (this.dragX < -40) return 'SKIP';
    return null;
  }

  get swipeLabelOpacity(): number {
    return Math.min(Math.abs(this.dragX) / this.SWIPE_THRESHOLD, 1);
  }

  get cardStyle(): Record<string, string> {
    const rotate = this.dragX * 0.05;
    return {
      transform: `translateX(${this.dragX}px) rotate(${rotate}deg)`,
      transition: this.dragging ? 'none' : 'transform 0.3s ease',
    };
  }

  onPointerDown(event: PointerEvent) {
    if (this.busy || this.animating) return;
    this.dragging = true;
    this.startX = event.clientX;
    this.pointerId = event.pointerId;
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  }

  onPointerMove(event: PointerEvent) {
    if (!this.dragging || event.pointerId !== this.pointerId) return;
    this.dragX = event.clientX - this.startX;
  }

  onPointerUp(event: PointerEvent) {
    if (!this.dragging || event.pointerId !== this.pointerId) return;
    this.dragging = false;
    if (this.dragX > this.SWIPE_THRESHOLD) {
      this.flyOut('right');
    } else if (this.dragX < -this.SWIPE_THRESHOLD) {
      this.flyOut('left');
    } else {
      this.dragX = 0;
    }
  }

  private flyOut(direction: 'left' | 'right') {
    this.animating = true;
    this.dragX = direction === 'right' ? 600 : -600;
    setTimeout(() => {
      if (direction === 'right') {
        this.watch();
      } else {
        this.skip();
      }
    }, 300);
  }

  async watch() {
    if (!this.current?.id || this.busy) return;
    this.busy = true;
    const statusResponse = await this.animeService.addAnime(this.current);
    if (statusResponse) this.current.my_list_status = statusResponse;
    this.busy = false;
    this.next();
  }

  async skip() {
    if (!this.current?.id || this.busy) return;
    const animeId = this.current.id;
    const title = this.current.title;
    this.plannerService.skip(animeId, this.year, this.season);
    await Promise.all([
      (async () => {
        if (!this.livechart.loggedIn) return;
        const livechartId =
          this.current?.my_extension?.livechartId ??
          (title ? await this.livechart.getId(animeId, title) : undefined);
        if (livechartId) {
          await this.livechart.deleteAnime(livechartId).catch(() => {});
        }
      })(),
      (async () => {
        if (!this.anisearch.loggedIn) return;
        const anisearchId =
          this.current?.my_extension?.anisearchId ?? (await this.anisearch.getId(animeId, 'anime'));
        await this.anisearch.setNotInterested(anisearchId).catch(() => {});
      })(),
    ]);
    this.next();
  }

  askAgain() {
    if (!this.current?.id) return;
    this.plannerService.askAgain(this.current.id, this.year, this.season);
    this.next();
  }
}
