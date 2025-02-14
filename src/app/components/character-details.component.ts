import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { StarWarsService, Person } from '../services/star-wars.service';

@Component({
  selector: 'app-character-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="character-details">
      <a routerLink="/" class="back-link">← Back to List</a>

      <div *ngIf="loading" class="loading">
        Loading character details...
      </div>

      <div *ngIf="error" class="error">
        {{ error }}
      </div>

      <div *ngIf="character && !loading" class="details-card">
        <h2>{{ character.name }}</h2>
        
        <div class="details-section">
          <h3>Physical Characteristics</h3>
          <p><strong>Height:</strong> {{ character.height }}cm</p>
          <p><strong>Mass:</strong> {{ character.mass }}kg</p>
          <p><strong>Hair Color:</strong> {{ character.hair_color }}</p>
          <p><strong>Skin Color:</strong> {{ character.skin_color }}</p>
          <p><strong>Eye Color:</strong> {{ character.eye_color }}</p>
        </div>

        <div class="details-section">
          <h3>Background Information</h3>
          <p><strong>Birth Year:</strong> {{ character.birth_year }}</p>
          <p><strong>Gender:</strong> {{ character.gender }}</p>
          <p><strong>Homeworld:</strong> {{ character.homeworld }}</p>
        </div>

        <div class="details-section">
          <h3>Appearances</h3>
          <p><strong>Films:</strong> {{ character.films.length }}</p>
          <p><strong>Vehicles:</strong> {{ character.vehicles.length }}</p>
          <p><strong>Starships:</strong> {{ character.starships.length }}</p>
        </div>
      </div>
    </div>
  `
})
export class CharacterDetailsComponent implements OnInit {
  character: Person | null = null;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private starWarsService: StarWarsService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.starWarsService.getCharacter(id).subscribe({
        next: (character) => {
          this.character = character;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load character details';
          this.loading = false;
        }
      });
    }
  }
}