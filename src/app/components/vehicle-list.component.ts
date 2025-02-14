import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StarWarsService, Vehicle } from '../services/star-wars.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="list-container">
      <h2>Star Wars Vehicles</h2>
      
      <div class="search-container">
        <input
          type="text"
          [(ngModel)]="searchQuery"
          (ngModelChange)="searchSubject.next($event)"
          placeholder="Search vehicles..."
          class="search-input"
        />
      </div>

      <div *ngIf="initialLoading" class="loading">
        Loading vehicles...
      </div>

      <div *ngIf="error" class="error">
        {{ error }}
      </div>

      <div *ngIf="vehicles.length === 0 && !initialLoading && !error" class="no-results">
        No vehicles found matching your search.
      </div>

      <div *ngFor="let vehicle of vehicles" class="item-card">
        <h3>{{ vehicle.name }}</h3>
        <p>Model: {{ vehicle.model }}</p>
        <p>Manufacturer: {{ vehicle.manufacturer }}</p>
        <p>Vehicle Class: {{ vehicle.vehicle_class }}</p>
        <p>Crew: {{ vehicle.crew }}</p>
        <p>Passengers: {{ vehicle.passengers }}</p>
      </div>

      <div *ngIf="loadingMore" class="loading">
        Loading more vehicles...
      </div>

      <div *ngIf="!hasMore && vehicles.length > 0" class="no-more">
        No more vehicles to load
      </div>
    </div>
  `
})
export class VehicleListComponent implements OnInit {
  vehicles: Vehicle[] = [];
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
    this.loadVehicles();
  }

  performSearch() {
    this.initialLoading = true;
    this.error = '';
    
    if (!this.searchQuery.trim()) {
      this.loadVehicles();
      return;
    }

    this.starWarsService.searchVehicles(this.searchQuery, this.currentPage).subscribe({
      next: (response) => {
        this.vehicles = response.results;
        this.hasMore = !!response.next;
        this.initialLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to search Star Wars vehicles';
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

  loadVehicles() {
    this.starWarsService.getVehicles(this.currentPage).subscribe({
      next: (response) => {
        this.vehicles = response.results;
        this.hasMore = !!response.next;
        this.initialLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load Star Wars vehicles';
        this.initialLoading = false;
      }
    });
  }

  loadMore() {
    this.loadingMore = true;
    this.currentPage++;

    const request = this.searchQuery.trim()
      ? this.starWarsService.searchVehicles(this.searchQuery, this.currentPage)
      : this.starWarsService.getVehicles(this.currentPage);

    request.subscribe({
      next: (response) => {
        this.vehicles = [...this.vehicles, ...response.results];
        this.hasMore = !!response.next;
        this.loadingMore = false;
      },
      error: (err) => {
        this.error = 'Failed to load more vehicles';
        this.loadingMore = false;
        this.currentPage--;
      }
    });
  }
}