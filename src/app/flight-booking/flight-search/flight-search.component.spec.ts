import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightSearchComponent } from './flight-search.component';
import { provideHttpClient } from '@angular/common/http';

describe('Unit test: FlightSearchComponent', () => {
  let component: FlightSearchComponent;
  let fixture: ComponentFixture<FlightSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        // Add imports if you need them for your tests
      ],
      providers: [
        // Add providers if you need them for your tests
        provideHttpClient(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FlightSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not have any flights loaded initially', () => {
    expect(component['flights'].length).toBe(0);
  });
});
