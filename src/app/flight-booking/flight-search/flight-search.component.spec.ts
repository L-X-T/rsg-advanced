import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightSearchComponent } from './flight-search.component';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

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
        provideHttpClientTesting(),
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

  it('should load flights when user entered from and to', () => {
    component['from'] = 'Graz';
    component['to'] = 'Hamburg';
    component['onSearch']();

    const httpTestingController = TestBed.inject(HttpTestingController);
    const req = httpTestingController.expectOne('http://www.angular.at/api/flight?from=Graz&to=Hamburg');
    // req.request.method === 'GET'

    req.flush([
      {
        id: 22,
        from: 'Graz',
        to: 'Hamburg',
        date: '',
      },
    ]);

    expect(component['flights'].length).toBe(1);
  });
});
