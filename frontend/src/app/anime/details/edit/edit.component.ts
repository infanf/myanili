import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { StreamPipe } from '@components/stream.pipe';
import { Anime, AnimeExtension, MyAnimeUpdate } from '@models/anime';

@Component({
  selector: 'myanili-anime-edit',
  templateUrl: './edit.component.html',
})
export class EditComponent implements OnInit {
  @Input() data: Partial<MyAnimeUpdate> = {};
  @Output() dataChange = new EventEmitter<Partial<MyAnimeUpdate>>();
  @Input() extension: AnimeExtension = {};
  @Output() extensionChange = new EventEmitter<Partial<AnimeExtension>>();
  @Input() anime!: Anime;
  @Input() busy = false;
  constructor(public streamPipe: StreamPipe) {}

  ngOnInit(): void {}
}
