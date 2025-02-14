import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StarWarsService, Starship } from '../services/star-wars.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-starship-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="list-container">
      <h2>Star Wars Starships</h2>
      
      <div class="search-container">
        <input
          type="text"
          [(ngModel)]="searchQuery"
          (ngModelChange)="searchSubject.next($event)"
          placeholder="Search starships..."
          class="search-input"
        />
      </div>

      <div *ngIf="initialLoading" class="loading">
        Loading starships...
      </div>

      <div *ngIf="error" class="error">
        {{ error }}
      </div>

      <div *ngIf="starships.length === 0 && !initialLoading && !error" class="no-results">
        No starships found matching your search.
      </div>

      <div *ngFor="let starship of starships" class="item-card">
        <h3>{{ starship.name }}</h3>
        <p>Model: {{ starship.model }}</p>
        <p>Manufacturer: {{ starship.manufacturer }}</p>
        <p>Starship Class: {{ starship.starship_class }}</p>
        <p>Hyperdrive Rating: {{ starship.hyperdrive_rating }}</p>
        <p>Crew: {{ starship.crew }}</p>
        <p>Passengers: {{ starship.passengers }}</p>
      </div>

      <div *ngIf="loadingMore" class="loading">
        Loading more starships...
      </div>

      <div *ngIf="!hasMore && starships.length > 0" class="no-more">
        No more starships to load
      </div>
    </div>
  `
})
export class StarshipListComponent implements OnInit {
  starships: Starship[] = [];
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
    this.loadStarships();
  }

  performSearch() {
    this.initialLoading = true;
    this.error = '';
    
    if (!this.searchQuery.trim()) {
      this.loadStarships();
      return;
    }

    this.starWarsService.searchStarships(this.searchQuery, this.currentPage).subscribe({
      next: (response) => {
        this.starships = response.results;
        this.hasMore = !!response.next;
        this.initialLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to search Star Wars starships';
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

  loadStarships() {
    this.starWarsService.getStarships(this.currentPage).subscribe({
      next: (response) => {
        this.starships = response.results;
        this.hasMore = !!response.next;
        this.initialLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load Star Wars starships';
        this.initialLoading = false;
      }
    });
  }

  loadMore() {
    this.loadingMore = true;
    this.currentPage++;

    const request = this.searchQuery.trim()
      ? this.starWarsService.searchStarships(this.searchQuery, this.currentPage)
      : this.starWarsService.getStarships(this.currentPage);

    request.subscribe({
      next: (response) => {
        this.starships = [...this.starships, ...response.results];
        this.hasMore = !!response.next;
        this.loadingMore = false;
      },
      error: (err) => {
        this.error = 'Failed to load more starships';
        this.loadingMore = false;
        this.currentPage--;
      }
    });
  }
}