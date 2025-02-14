import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StarWarsService, Person } from '../services/star-wars.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-character-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="character-list">
      <h2>Star Wars Characters</h2>
      
      <div class="search-container">
        <input
          type="text"
          [(ngModel)]="searchQuery"
          (ngModelChange)="searchSubject.next($event)"
          placeholder="Search characters..."
          class="search-input"
        />
      </div>

      <div *ngIf="initialLoading" class="loading">
        Loading characters...
      </div>

      <div *ngIf="error" class="error">
        {{ error }}
      </div>

      <div *ngIf="characters.length === 0 && !initialLoading && !error" class="no-results">
        No characters found matching your search.
      </div>

      <div *ngFor="let character of characters; let i = index" class="character-card">
        <h3>{{ character.name }}</h3>
        <p>Height: {{ character.height }}cm</p>
        <p>Mass: {{ character.mass }}kg</p>
        <p>Birth Year: {{ character.birth_year }}</p>
        <p>Gender: {{ character.gender }}</p>
        <a [routerLink]="['/character', getCharacterId(i + 1)]" class="view-details">
          View Details
        </a>
      </div>

      <div *ngIf="loadingMore" class="loading">
        Loading more characters...
      </div>

      <div *ngIf="!hasMore && characters.length > 0" class="no-more">
        No more characters to load
      </div>
    </div>
  `
})
export class CharacterListComponent implements OnInit {
  characters: Person[] = [];
  initialLoading = true;
  loadingMore = false;
  error = '';
  currentPage = 1;
  hasMore = true;
  searchQuery = '';
  searchSubject = new Subject<string>();

  constructor(private starWarsService: StarWarsService) {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(query => {
        this.searchQuery = query;
        this.currentPage = 1;
        this.performSearch();
      });
  }

  ngOnInit() {
    this.loadCharacters();
  }

  getCharacterId(index: number): string {
    return ((this.currentPage - 1) * 10 + index).toString();
  }

  performSearch() {
    this.initialLoading = true;
    this.error = '';
    
    if (!this.searchQuery.trim()) {
      this.loadCharacters();
      return;
    }

    this.starWarsService.searchPeople(this.searchQuery, this.currentPage).subscribe({
      next: (response) => {
        this.characters = response.results;
        this.hasMore = !!response.next;
        this.initialLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to search Star Wars characters';
        this.initialLoading = false;
      }
    });
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    if (this.loadingMore || !this.hasMore) return;

    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    if (windowHeight + scrollTop >= documentHeight - 100) {
      this.loadMore();
    }
  }

  loadCharacters() {
    this.starWarsService.getPeople(this.currentPage).subscribe({
      next: (response) => {
        this.characters = response.results;
        this.hasMore = !!response.next;
        this.initialLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load Star Wars characters';
        this.initialLoading = false;
      }
    });
  }

  loadMore() {
    this.loadingMore = true;
    this.currentPage++;

    const request = this.searchQuery.trim()
      ? this.starWarsService.searchPeople(this.searchQuery, this.currentPage)
      : this.starWarsService.getPeople(this.currentPage);

    request.subscribe({
      next: (response) => {
        this.characters = [...this.characters, ...response.results];
        this.hasMore = !!response.next;
        this.loadingMore = false;
      },
      error: (err) => {
        this.error = 'Failed to load more characters';
        this.loadingMore = false;
        this.currentPage--;
      }
    });
  }
}