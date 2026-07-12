import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Language, ScoreDisplay, SettingsService } from '@services/settings.service';

export type ViewSettingKey =
  | 'language'
  | 'layout'
  | 'watchlistLayout'
  | 'scoreDisplay'
  | 'autoFilter'
  | 'startingSoon'
  | 'inList'
  | 'nsfw';

interface ViewSettingDefinition {
  key: ViewSettingKey;
  label: string;
  description: string;
  options: Array<{ value: string; label: string }>;
}

const VIEW_SETTING_DEFINITIONS: ViewSettingDefinition[] = [
  {
    key: 'language',
    label: 'Title Language',
    description:
      'Language used for anime and manga titles. "Rōmaji" shows the default title from MyAnimeList, "Native" the original (mostly Japanese) title.',
    options: [
      { value: 'default', label: 'Rōmaji' },
      { value: 'en', label: 'English' },
      { value: 'jp', label: 'Native' },
    ],
  },
  {
    key: 'layout',
    label: 'Layout',
    description: 'Display list views as a compact table or as a grid of posters.',
    options: [
      { value: 'list', label: 'List' },
      { value: 'grid', label: 'Grid' },
    ],
  },
  {
    key: 'scoreDisplay',
    label: 'Scores',
    description: 'How scores are displayed throughout the app, e.g. "8.50 / 10" or "85%".',
    options: [
      { value: 'default', label: 'Default' },
      { value: '10', label: 'X.YY / 10' },
      { value: '100', label: 'XX%' },
    ],
  },
  {
    key: 'watchlistLayout',
    label: 'Layout',
    description: 'Display the watchlist as a compact table or as cards with posters.',
    options: [
      { value: 'list', label: 'List' },
      { value: 'grid', label: 'Cards' },
    ],
  },
  {
    key: 'autoFilter',
    label: 'Paused Shows',
    description:
      'Hide shows from the watchlist while their broadcast is paused, i.e. no new episode airs this week.',
    options: [
      { value: 'false', label: 'Show on Watchlist' },
      { value: 'true', label: 'Hide on Watchlist' },
    ],
  },
  {
    key: 'startingSoon',
    label: 'Starting Shows',
    description:
      'Show planned anime on the watchlist as soon as their first episode is about to air.',
    options: [
      { value: 'true', label: 'Show on Watchlist' },
      { value: 'false', label: 'Hide on Watchlist' },
    ],
  },
  {
    key: 'inList',
    label: 'Seasonal Anime',
    description:
      'Show all anime airing in the selected season or only those that are already in your list.',
    options: [
      { value: 'false', label: 'Show all Airing' },
      { value: 'true', label: 'Show only in my list' },
    ],
  },
  {
    key: 'nsfw',
    label: 'Adult Content',
    description: 'Show or hide hentai titles in search results and the seasonal view.',
    options: [
      { value: 'false', label: 'Hide Hentai' },
      { value: 'true', label: 'Show Hentai' },
    ],
  },
];

@Component({
  selector: 'myanili-view-settings',
  templateUrl: './view-settings.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class ViewSettingsComponent {
  @Input() title = 'Settings';
  @Input() set keys(keys: ViewSettingKey[]) {
    this.definitions = keys
      .map(key => VIEW_SETTING_DEFINITIONS.find(def => def.key === key))
      .filter((def): def is ViewSettingDefinition => Boolean(def));
  }
  definitions: ViewSettingDefinition[] = [];

  constructor(
    private settings: SettingsService,
    public modal: NgbActiveModal,
  ) {}

  getValue(key: ViewSettingKey): string {
    switch (key) {
      case 'language':
        return this.settings.language$.value;
      case 'layout':
        return this.settings.layout$.value;
      case 'watchlistLayout':
        return this.settings.watchlistLayout$.value;
      case 'scoreDisplay':
        return this.settings.scoreDisplay$.value;
      case 'autoFilter':
        return String(this.settings.autoFilter$.value);
      case 'startingSoon':
        return String(this.settings.startingSoon$.value);
      case 'inList':
        return String(this.settings.inList$.value);
      case 'nsfw':
        return String(this.settings.nsfw$.value);
      default:
        return '';
    }
  }

  setValue(key: ViewSettingKey, value: string) {
    switch (key) {
      case 'language':
        this.settings.language = value as Language;
        break;
      case 'layout':
        this.settings.layout = value;
        break;
      case 'watchlistLayout':
        this.settings.watchlistLayout = value;
        break;
      case 'scoreDisplay':
        this.settings.scoreDisplay = value as ScoreDisplay;
        break;
      case 'autoFilter':
        this.settings.autoFilter = value === 'true';
        break;
      case 'startingSoon':
        this.settings.startingSoon = value === 'true';
        break;
      case 'inList':
        this.settings.inList = value === 'true';
        break;
      case 'nsfw':
        this.settings.nsfw = value === 'true';
        break;
      default:
        break;
    }
  }
}
