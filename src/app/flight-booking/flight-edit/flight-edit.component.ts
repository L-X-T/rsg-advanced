import { Component, DestroyRef, effect, inject, model } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { Flight } from '../../entities/flight';
import { FlightService } from '../shared/services/flight.service';
import { FlightValidationErrorsComponent } from '../flight-validation-errors/flight-validation-errors.component';
import { validateCity } from '../shared/validation/city-validator';
import { validateAsyncCity } from '../shared/validation/async-city-validator';
import { validateRoundTrip } from '../shared/validation/round-trip-validator';
import { CITY_PATTERN } from '../../shared/global';

@Component({
  standalone: true,
  selector: 'app-flight-edit',
  templateUrl: './flight-edit.component.html',
  styleUrls: ['./flight-edit.component.css'],
  imports: [ReactiveFormsModule, FlightValidationErrorsComponent],
})
export class FlightEditComponent {
  readonly flight = model.required<Flight>();

  private readonly destroyRef = inject(DestroyRef);
  private readonly flightService = inject(FlightService);
  private readonly formBuilder = inject(FormBuilder);

  protected editForm: FormGroup = this.formBuilder.group(
    {
      id: [0, [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]+$/)]],
      from: [
        '',
        {
          asyncValidators: [validateAsyncCity(this.flightService)],
          validators: [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(15),
            Validators.pattern(CITY_PATTERN),
            validateCity(['Graz', 'Wien', 'Hamburg', 'Berlin']),
          ],
          updateOn: 'blur',
        },
      ],
      to: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(15),
          Validators.pattern(CITY_PATTERN),
          validateCity(['Graz', 'Wien', 'Hamburg', 'Berlin']),
        ],
      ],
      date: ['', [Validators.required, Validators.minLength(33), Validators.maxLength(33)]],
    },
    {
      validators: validateRoundTrip,
    },
  );

  protected message = '';

  private readonly valueChangesLogger = this.editForm.valueChanges
    .pipe(
      debounceTime(250),
      distinctUntilChanged((a, b) => a.id === b.id && a.from === b.from && a.to === b.to && a.date === b.date),
      takeUntilDestroyed(),
    )
    .subscribe((value) => {
      console.log(value);
    });

  private updated = effect(() => this.editForm.patchValue(this.flight()));

  onSave(): void {
    this.flightService
      .save(this.editForm.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (flight) => {
          console.log('saved flight:', flight);

          this.flight.set(flight);

          this.message = 'Success!';
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error', err);
          this.message = 'Error!';
        },
      });
  }
}
