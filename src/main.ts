import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CharacterListComponent } from './app/components/character-list.component';
import { CharacterDetailsComponent } from './app/components/character-details.component';
import { VehicleListComponent } from './app/components/vehicle-list.component';
import { StarshipListComponent } from './app/components/starship-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  template: `
    <div class="app-container">
      <nav class="main-nav">
        <a routerLink="/" class="nav-link" routerLinkActive="active">
          Characters
        </a>
        <a routerLink="/vehicles" class="nav-link" routerLinkActive="active">
          Vehicles
        </a>
        <a routerLink="/starships" class="nav-link" routerLinkActive="active">
          Starships
        </a>
      </nav>

      <router-outlet></router-outlet>
    </div>
  `
})
export class App {
  name = 'Star Wars App';
}

const routes = [
  { path: '', component: CharacterListComponent },
  { path: 'character/:id', component: CharacterDetailsComponent },
  { path: 'vehicles', component: VehicleListComponent },
  { path: 'starships', component: StarshipListComponent }
];

bootstrapApplication(App, {
  providers: [
    provideHttpClient(),
    provideRouter(routes)
  ]
}).catch(err => console.error(err));