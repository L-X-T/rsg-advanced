import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, map, Observable, pairwise, switchMap, tap } from 'rxjs';
import { Flight } from '../entities/flight';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-flight-lookahead',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './flight-lookahead.component.html',
  styleUrl: './flight-lookahead.component.css',
})
export class FlightLookaheadComponent {
  protected readonly control = new FormControl<string>('', { nonNullable: true }); // typed FormControl, since NG 14
  protected isLoading = false;

  private readonly http = inject(HttpClient);

  protected readonly flights$ = this.control.valueChanges.pipe(
    filter((input) => input.length >= 3),
    debounceTime(300),
    distinctUntilChanged(),
    tap((input) => (this.isLoading = true)),
    switchMap((input) => this.load(input)),
    tap((v) => (this.isLoading = false)),
  );

  protected readonly diff$ = this.flights$.pipe(
    pairwise(),
    map(([a, b]) => b.length - a.length),
  );

  load(from: string): Observable<Flight[]> {
    const url = 'http://www.angular.at/api/flight';
    const params = new HttpParams().set('from', from);
    const headers = new HttpHeaders().set('Accept', 'application/json');

    return this.http.get<Flight[]>(url, { params, headers });
  }
}
