import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Anime } from '@models/anime';

import { AnimeService } from '../anime.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
})
export class DetailsComponent implements OnInit {
  @Input() id!: number;
  anime?: Anime;
  shortsyn = true;
  edit = false;
  busy = false;

  constructor(private animeService: AnimeService, private route: ActivatedRoute) {
    this.id = Number(this.route?.snapshot?.paramMap?.get('id'));
    this.route.url.subscribe(url => {
      const newId = Number(this.route?.snapshot?.paramMap?.get('id'));
      if (newId !== this.id) {
        this.id = newId;
        delete this.anime;
        this.ngOnInit();
      }
    });
  }

  async ngOnInit() {
    this.anime = await this.animeService.getAnime(this.id);
  }

  getRelatedAnimes() {
    if (!this.anime?.related_anime?.length) return [];
    const types = this.anime.related_anime
      .map(an => an.relation_type_formatted)
      .filter((value, index, self) => self.indexOf(value) === index);
    const relatedAnime = [];
    for (const type of types) {
      const related = this.anime.related_anime
        .filter(value => value.relation_type_formatted === type)
        .map(an => an.node);
      relatedAnime.push({ name: type, entries: related });
    }
    return relatedAnime;
  }
  getRelatedMangas() {
    if (!this.anime?.related_manga?.length) return [];
    const types = this.anime.related_manga
      .map(an => an.relation_type_formatted)
      .filter((value, index, self) => self.indexOf(value) === index);
    const relatedAnime = [];
    for (const type of types) {
      const related = this.anime.related_manga
        .filter(value => value.relation_type_formatted === type)
        .map(an => an.node);
      relatedAnime.push({ name: type, entries: related });
    }
    return relatedAnime;
  }

  async editSave() {
    if (this.busy) return;
    if (this.anime?.my_list_status) {
      if (this.edit) return this.save();
      this.edit = true;
    } else {
      this.busy = true;
    }
  }

  async save() {
    if (!this.anime?.my_list_status) return;
    this.busy = true;
  }
}
