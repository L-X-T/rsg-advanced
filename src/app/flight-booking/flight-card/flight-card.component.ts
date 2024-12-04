import { Component, input, model, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';

import { Flight } from '../../entities/flight';

@Component({
  standalone: true,
  imports: [DatePipe],
  selector: 'app-flight-card',
  templateUrl: './flight-card.component.html',
  styleUrls: ['./flight-card.component.css'],
})
export class FlightCardComponent implements OnInit, OnChanges, OnDestroy {
  debug = true;

  item = input.required<Flight>();
  selected = model(false);

  constructor() {
    this.debugInputs('constructor');
  }

  ngOnChanges(): void {
    this.debugInputs('ngOnChanges');
  }

  ngOnInit(): void {
    this.debugInputs('ngOnInit');
  }

  ngOnDestroy(): void {
    this.debugInputs('ngOnDestroy');
  }

  onSelect(): void {
    this.selected.set(true);
  }

  onDeselect(): void {
    this.selected.set(false);
  }

  private debugInputs(method: string): void {
    if (this.debug) {
      console.debug('[FlightCardComponent - ' + method + '()]');
      console.debug('flight', this.item);
      console.debug('selected', this.selected);
    }
  }
}
