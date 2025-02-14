import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Person {
  name: string;
  height: string;
  mass: string;
  birth_year: string;
  gender: string;
  hair_color: string;
  skin_color: string;
  eye_color: string;
  homeworld: string;
  films: string[];
  species: string[];
  vehicles: string[];
  starships: string[];
}

export interface Vehicle {
  name: string;
  model: string;
  manufacturer: string;
  cost_in_credits: string;
  length: string;
  max_atmosphering_speed: string;
  crew: string;
  passengers: string;
  cargo_capacity: string;
  consumables: string;
  vehicle_class: string;
  pilots: string[];
  films: string[];
}

export interface Starship {
  name: string;
  model: string;
  manufacturer: string;
  cost_in_credits: string;
  length: string;
  max_atmosphering_speed: string;
  crew: string;
  passengers: string;
  cargo_capacity: string;
  consumables: string;
  hyperdrive_rating: string;
  MGLT: string;
  starship_class: string;
  pilots: string[];
  films: string[];
}

export interface SWAPIResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

@Injectable({
  providedIn: 'root'
})
export class StarWarsService {
  private baseUrl = 'https://swapi.dev/api';

  constructor(private http: HttpClient) {}

  getPeople(page: number = 1): Observable<SWAPIResponse<Person>> {
    return this.http.get<SWAPIResponse<Person>>(`${this.baseUrl}/people/?page=${page}`);
  }

  searchPeople(query: string, page: number = 1): Observable<SWAPIResponse<Person>> {
    return this.http.get<SWAPIResponse<Person>>(`${this.baseUrl}/people/?search=${query}&page=${page}`);
  }

  getCharacter(id: string): Observable<Person> {
    return this.http.get<Person>(`${this.baseUrl}/people/${id}`);
  }

  getVehicles(page: number = 1): Observable<SWAPIResponse<Vehicle>> {
    return this.http.get<SWAPIResponse<Vehicle>>(`${this.baseUrl}/vehicles/?page=${page}`);
  }

  searchVehicles(query: string, page: number = 1): Observable<SWAPIResponse<Vehicle>> {
    return this.http.get<SWAPIResponse<Vehicle>>(`${this.baseUrl}/vehicles/?search=${query}&page=${page}`);
  }

  getVehicle(id: string): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.baseUrl}/vehicles/${id}`);
  }

  getStarships(page: number = 1): Observable<SWAPIResponse<Starship>> {
    return this.http.get<SWAPIResponse<Starship>>(`${this.baseUrl}/starships/?page=${page}`);
  }

  searchStarships(query: string, page: number = 1): Observable<SWAPIResponse<Starship>> {
    return this.http.get<SWAPIResponse<Starship>>(`${this.baseUrl}/starships/?search=${query}&page=${page}`);
  }

  getStarship(id: string): Observable<Starship> {
    return this.http.get<Starship>(`${this.baseUrl}/starships/${id}`);
  }
}