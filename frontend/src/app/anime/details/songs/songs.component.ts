import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Media, MediaTheme } from '@models/media';
import { DeviceDetectorService } from 'ngx-device-detector';
import { GlobalService } from 'src/app/global.service';
import { MalService } from 'src/app/mal.service';

@Component({
  selector: 'app-anime-songs',
  templateUrl: './songs.component.html',
  styleUrls: ['./songs.component.scss'],
})
export class AnimeSongsComponent {
  @Input() anime?: Media;
  @Input() edit = false;
  constructor(
    private deviceDetector: DeviceDetectorService,
    private sanitizer: DomSanitizer,
    private glob: GlobalService,
    private malService: MalService,
  ) {}

  getSongUrl(spotifyUri?: string): string | SafeUrl {
    if (!spotifyUri) return '';
    if (this.deviceDetector.isMobile()) return this.sanitizer.bypassSecurityTrustUrl(spotifyUri);
    const parts = spotifyUri.split(':');
    if (parts[0] === 'spotify' && parts.length === 3) {
      return `https://open.spotify.com/${parts[1]}/${parts[2]}`;
    }
    return '';
  }

  async setSongUrl(song: MediaTheme) {
    this.glob.busy();
    const spotify = prompt('Spotify URI', song.spotify)?.replace(
      /https:\/\/open.spotify.com\/track\/(\w+)(\?.+)?/,
      'spotify:track:$1',
    );
    if (!spotify?.match(/^spotify:track:\w+$/) || song.spotify === spotify) {
      this.glob.notbusy();
      return;
    }
    await this.malService.post('song/' + song.id, { spotify });
    this.glob.notbusy();
    song.spotify = spotify;
  }
}
