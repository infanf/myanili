import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpotifyIconComponent } from './spotify.component';

describe('SpotifyIconComponent', () => {
  let component: SpotifyIconComponent;
  let fixture: ComponentFixture<SpotifyIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SpotifyIconComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpotifyIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
