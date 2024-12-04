# RxJS Operator

- [RxJS Operators](#rxjs-operators)
  - [Simple Lookahead](#simple-lookahead)
    - [Further Operators for Lookahead \*](#further-operators-for-lookahead-)
    - [Size Difference of two Search Results \*](#size-difference-of-two-search-results-)
  - [Combine Streams \*](#combine-streams-)
    - [Search by from and to \*\*](#search-by-from-and-to-)
    - [Refresh Button \*\*\*](#refresh-button-)
  - [Error Handling \*](#error-handling-)
  - [Bonus: Shopping Basket with Scan \*](#bonus-shopping-basket-with-scan-)
    - [Bonus: Result History with Scan \*\*](#bonus-result-history-with-scan-)
  - [Bonus: Custom Operator: switchMapCompensate \*\*](#bonus-custom-operator-switchmapcompensate-)
    - [Bonus: Custom Operator: switchMapRetry \*\*\*](#bonus-custom-operator-switchmapretry-)
    - [Bonus: Custom Operator: switchMapBackoff for Exponential Backoff \*\*\*](#bonus-custom-operator-switchmapbackoff-for-exponential-backoff-)

## Preparation: FlightLookaheadComponent

In this exercise, you will expand your application by one component that lists all flights departing from a chosen airport. So once again we add a component:

You can follow these steps:

1. Start by creating your new `FlightLookaheadComponent` in your project's root. To generate the files needed, run the following command (or use your IDE):

   ```
   ng g c flight-lookahead
   ```

2. Switch back to the file _app.component.html_, and add the new component:

   ```html
   […]
   <div class="content">
     <!--<app-flight-search />-->
     <app-airports />
     <app-flight-lookahead />
   </div>
   […]
   ```

3. Make sure the component was also imported in _app.component.ts_.

4. Check if you see the newly added component (below your airports).

## Simple Lookahead

In this exercise, you'll implement the presented lookahead. For this, you can use the following API:

    http://www.angular.at/api/flight?from=Graz

As you see in this URL, the API takes a parameter for filtering flights with respect to a specific airport name.

Important note:

1. Open your new `flight-lookahead.component.ts` file and add the import for the `ReactiveFormsModule`:

   ```typescript
   @Component({
     //[...]
     imports: [ReactiveFormsModule],
     //[...]
   })
   export class AppModule {}
   ```

2. Now add the following properties:

   ```typescript
   protected readonly control = new FormControl<string>('', { nonNullable: true }); // typed FormControl, since NG 14
   protected readonly flights$?: Observable<Flight[]>;
   protected isLoading = false;
   ```

3. Inject the `HttpClient` into the component.

   <details>
   <summary>Show code</summary>
   <p>

   ```typescript
   private readonly http = inject(HttpClient);
   ```

   </p>
   </details>

4. Create a method `load(from: string): Observable<Flight[]> { ... } `. Implement this method, so that all flights starting at the passed airport are returned.

   <details>
   <summary>Show code</summary>
   <p>

   ```typescript
   private load(from: string): Observable<Flight[]> {
     const url = "http://www.angular.at/api/flight";
     const params = new HttpParams().set('from', from);
     const headers = new HttpHeaders().set('Accept', 'application/json');

     return this.http.get<Flight[]>(url, { params, headers });
   }
   ```

   </p>
   </details>

5. Implement a constructor() to establish the dataflow between your input control (property `control`) and your result (`flights$`).

   <details>
   <summary>Show code</summary>
   <p>

   ```typescript
   export class FlightLookaheadComponent {
     // [field initializers]

     constructor() {
       this.flights$ = this.control.valueChanges.pipe(
         debounceTime(300),
         tap(input => this.isLoading = true),
         switchMap(input => this.load(input)),
         tap(v => this.isLoading = false)
       );
     }

     [...]
   }
   ```

   </p>
   </details>

   Note: make sure to import all the necessary `RxJS` operators.

   Alternatively, you could set this up directly in the field initializer:

   <details>
   <summary>Show code</summary>
   <p>

   ```typescript
   export class FlightLookaheadComponent {
     // [field initializers]

     private readonly http = inject(HttpClient);

     protected readonly flights$ = this.control.valueChanges.pipe(
         debounceTime(300),
         tap(input => this.isLoading = true),
         switchMap(input => this.load(input)),
         tap(v => this.isLoading = false)
       );

     [...]
   }
   ```

   Which variant do you like better?

6. Open the file `flight-lookahead.component.html` and create an input element. Bind it to your control object. Also, display the value of your property `isLoading`.

   <details>
   <summary>Show code</summary>
   <p>

   ```html
   <div class="card">
     <div class="header">
       <h1 class="title">Lookahead</h1>
     </div>

     <div class="content">
       <div class="control-group">
         <label>City</label>
         <input class="form-control" [formControl]="control" />
       </div>

       @if (isLoading) {
       <div>Loading ...</div>
       }
     </div>
   </div>
   ```

   </p>
   </details>

7. Create a new table and bind it to your `flights$` property using the `async` pipe.

    <details>
    <summary>Show code</summary>
    <p>

   ```html
   <table class="table table-striped">
     @for (f of flights$ | async; track f.id) {
     <tr>
       <td>{{ f.id }}</td>
       <td>{{ f.from }}</td>
       <td>{{ f.to }}</td>
       <td>{{ f.date | date:'dd.MM.yyyy HH:mm' }}</td>
     </tr>
     }
   </table>
   ```

    </p>
    </details>

   **Please note:** for the AsyncPipe and the DatePipe to work, you need to import the `CommonModule` in your component:

   ```typescript
    import { CommonModule } from '@angular/common';

    @Component({
      imports: [CommonModule, ReactiveFormsModule]
    })
   ```

8. Test your solution.

### Further Operators for Lookahead \*

In this exercise, you'll add the operators `distinctUntilChanged` and `filter` to your case study. You find further information about them at `http://rxmarbles.com`.

1. Look at the docs for `distinctUntilChanged` at http://rxmarbles.com/#distinctUntilChanged and integrate it into your example. The goal is to prevent an additional http call when during a `debounce` period something is changed and undone again.

2. Test your solution. You can use your browser's network tab find out how many http requests are sent out.

3. Have a look at the docs of the operator `filter` at http://rxmarbles.com/#filter. Integrate it into your example to make sure that a http request is only done after the user has entered 3 characters at minimum.

4. Test your solution.

### Size Difference of two Search Results \*

In this example, you'll calculate the size difference of two subsequent search results. Let's assume, the first search brings up 10 flights and the second one brings 15. In this case, the calculated difference is 5.

For this, create an observable using the existing `flights$` observable:

```typescript
this.diff$ = this.flights$.pipe(); // here we need some operators ...
```

To finish this implementation, you'll need the operators `pairwise` and `map`. You can find a description for `pairwise` [here](https://rxjs-dev.firebaseapp.com/api/operators/pairwise) and [here](https://www.learnrxjs.io/operators/combination/pairwise).

<details>
<summary>Solution</summary>
<p>

```typescript
this.diff$ = this.flights$.pipe(
  pairwise(),
  map(([a, b]) => b.length - a.length),
);
```

```angular2html
<div>
  @let diff = diff$ | async;
  @if (isLoading) {
    Loading ...
  } @else if (diff) {
    #flights diff: {{ diff > 0 ? '+' + diff : diff }}
  } @else {
    &nbsp; // &nbpsc; insert a non-breaking space
  }
</div>
```

</p>
</details>

## Combine Streams \*

In this example, you'll introduce another observable that simulates the network state. Also, you will make sure, that your solution will only search for flights if the state is "connected".

1. Add the following properties to your component:

   - `online$?: Observable<boolean>`;

2. Add the following lines to your `ngOnInit` method.

   ```typescript
   constructor() {
     [...]

     this.online$ = interval(2000).pipe(
       startWith(0),
       map((_) => Math.random() < 0.5),
       distinctUntilChanged()
     );

     [...]
   }
   ```

   As you can see here, `online$` can emit a new network state (true or false for connected and disconnected) every two seconds. As it is a cold observable, it will only start sending data after a subscription has been setup. Hence, you'll combine it with the other observable in the next step.

3. Have a look at http://rxmarbles.com to find out how `combineLatest` and `filter` work. Try to find out how to use them to combine the new `online$` observable with the existing `flights$` observable. The goal is to only search for flights when the machine is connected.

   **Hint:** `combineLatest` returns an array with the current values of the combined observables:

   ```typescript
   combineLatest([observable1, observable2]).subscribe(
     (tuple) => {
       const latestFromObservable1 = tuple[0];
       const latestFromObservable2 = tuple[1];
       [...]
     }
   )

   [...]

   // The same, with a compacter syntax:
   combineLatest([observable1, observable2]).subscribe(
     ([latestFromObservable1, latestFromObservable2]) => {
       [...]
     }
   )
   ```

   **Hint:** Further information about `combineLatest` can be found at https://www.learnrxjs.io.

   <details>
   <summary>Solution</summary>
   <p>

   ```typescript
   this.online$ = interval(2000).pipe(
     startWith(0),
     map((_) => Math.random() < 0.5),
     distinctUntilChanged(),
   );

   const input$ = this.control.valueChanges.pipe(debounceTime(300));

   this.flights$ = combineLatest([input$, this.online$]).pipe(
     filter(([, online]: [string, boolean]) => online),
     map(([input]) => input),
     switchMap((input) => this.load(input)),
   );
   ```

   </p>
   </details>

4. Display the value of `online$` via `@if` and `@else` and the `async` pipe:

   ```html
   @if (online$ | async) {
   <div style="background-color: darkgreen">Online</div>
   } @else {
   <div style="background-color: darkred">Offline</div>
   }
   ```

5. Test your solution.

### Search by from and to \*\*

Implement a second textbox for the airport of destination (field `to`). When ever the field `from` or `to` is modified, the result table shall be updated.

Make sure, no query is sent to the server, when both, `from` and `to` are empty.

**Hint:** `combineLatest` can take several parameters:

```typescript
combineLatest([a$, b$, c$]).pipe(
  tap(([a,b,c]) => console.debug('abc', a, b, c) );
)
```

### Refresh Button \*\*\*

Now, let's try to introduce a button reloading the current result set. For this, add an observable and a click handler for the button:

```typescript
private readonly refreshClickSubject = new Subject<void>();
protected readonly refreshClick$ = this.refreshClickSubject.asObservable();

protected refresh(): void {
  this.refreshClickSubject.next();
}
```

<details>
<summary>Solution</summary>
<p>

```typescript
[...]

const debouncedFrom$ = this.controlFrom.valueChanges.pipe(debounceTime(300));
const debouncedTo$ = this.controlTo.valueChanges.pipe(debounceTime(300));

const combined$ = combineLatest([debouncedFrom$, debouncedTo$, this.online$]).pipe(
  // [...]
);

// we need to type this Observable to make the strict mode happy ;-)
const combinedRefresh$: Observable<[string, string, boolean]> = this.refreshClick$.pipe(
  map((_) => [this.fromControl.value, this.toControl.value, true])
);

this.flights$ = merge(combined$, combinedRefresh$).pipe(
  filter(([f, t, online]: [string, string, boolean]) => !!(f || t) && online),
  map(([from, to, _]) => [from, to]),
  // further remaining operators
);
```

</p>
</details>

The button in the template looks like this:

```html
<button type="button" (click)="refresh()">Refresh</button>
```

To implement the logic, `merge` the result of your existing `combineLatest` call with `refreshClick$`. You find some information about `merge` [here](https://rxmarbles.com/#merge) and [here](https://www.learnrxjs.io/operators/combination/merge.html).

Make sure to emit the current search criteria via `refreshClick$`.

## Error Handling \*

Have a look at the description of [catchError](https://rxjs-dev.firebaseapp.com/api/operators/catchError) and [retry](https://rxjs-dev.firebaseapp.com/api/operators/retry) and try to use these operators in your lookahead example.

**Hint:** Change your `online$` observable so that it always returns `true` (`map(_ => true)`).

**Hint:** Use your network tab within the F12 tools to simulate an offline state.

<!-- ## RetryWhen **

RetryWhen gets an Observable that emits the current error as a regular value. You have the following options:

- Return the observable, e.g. with a delay, and RxJS returns the failed action
- Return  -->

## Bonus: Shopping Basket with Scan \*

Let's allow to add flights to a shopping basket in a reactive way. For this, add a `basket$` Observable as well as an Observable `addToBasket$`:

```typescript
basket$: Observable<Flight[]>;

private readonly addToBasketSubject = new Subject<Flight>();
protected readonly addToBasket$ = this.addToBasketSubject.asObservable();
```

Also, add a method `select`:

```typescript
select(flight: Flight): void {
  this.addToBasketSubject.next(flight);
}
```

Use `select` and `basket$` in your basket:

```html
<table class="table table-striped">
  @for (f of flights$ | async; track f.id) {
  <tr>
    [...]
    <td><a (click)="select(f)">Select</a></td>
  </tr>
  }
</table>

@if (basket$ | async) {
<pre>{{ basket$ | async }}</pre>
}
```

Now, within your `constructor`, connect `addToBasket$` to `basket$` so that `basket$` always contains the selected flights. In order to prevent side effects, use the [scan operator](https://rxjs-dev.firebaseapp.com/api/operators/scan) for this.

<details>
<summary>Solution</summary>
<p>

```typescript
this.basket$ = this.addToBasket$.pipe(
  scan((acc, flight) => {
    return [...acc, flight];
  }, []),
);
```

</p>
</details>

### Bonus: Result History with Scan \*\*

Use the `scan` operator in a similar way as in the last exercise to provide an observable with **all** flights you've found while using the lookahaed. E. g., if searching for _Graz - Hamburg_ and then for _Frankfurt - Berlin_ one should find the results of both requests within this observable.

Also, display these flights within your template.

## Bonus: Custom Operator: switchMapCompensate \*\*

Write a custom `switchMapCompensate` operator combining the usage of `switchMap` and `catchError`. It shall allow to write

```typescript
const result$ = myObservable$.pipe(switchMapCompensate(([from, to]) => this.load(from, to)));
```

instead of:

```typescript
const result$ = myObservable$.pipe(switchMap(([from, to]) => this.load(from, to).pipe(catchError((err) => of([])))));
```

<details>
<summary>First Simple Solution (untyped)</summary>
<p>

```typescript
function switchMapCompensate(projector) {
  return (source$) => {
    return source$.pipe(switchMap((p) => projector(p).pipe(catchError((_) => of([])))));
  };
}
```

</p>
</details>

<details>
<summary>Typed Solution</summary>
<p>

```typescript
type Projector<T, U> = (item: T) => Observable<U>;

function switchMapCompensate<T, U>(projector: Projector<T, U>) {
  return (source$: Observable<T>) => {
    return source$.pipe(switchMap((p: T) => projector(p).pipe(catchError((_) => of([])))));
  };
}
```

Please note, that our `Projector` type is a bit simpler than the one used by `switchMap`. However, for our case and for a lot of other cases it should be good enough.

</p>
</details>

### Bonus: Custom Operator: switchMapRetry \*\*\*

Use the technique from the last exercise to write a `switchMapRetry` operator combining `switchMap` and `retry`. Provide a way to configure the amount of retries.

### Bonus: Custom Operator: switchMapBackoff for Exponential Backoff \*\*\*

Have a look to the description of [retryWhen](https://rxjs-dev.firebaseapp.com/api/operators/retryWhen).

Also, have a look to the following custom operator implementing a combination of `switchMap` and `retryWhen` to provide an exponential backoff. This means we are waiting `2^i * delay` milliseconds before retrying a failed action where `i` is the count of already performed retries and `delay` represents the delay of the first retry:

```typescript
export interface SwitchMapRetryOptions {
  delayMsec: number;
  maxRetries: number;
}

const defaults: SwitchMapRetryOptions = {
  delayMsec: 500,
  maxRetries: 3,
};

export function switchMapBackoff<T, U>(
  projector: Projector<T, U>,
  { maxRetries, delayMsec }: SwitchMapRetryOptions = defaults,
) {
  let i = 0;
  return pipe(
    switchMap((item: T) =>
      projector(item).pipe(
        retryWhen((err$) =>
          err$.pipe(
            switchMap((err) => {
              if (i++ >= maxRetries) {
                return throwError(err);
              }
              return of(err).pipe(delay(Math.pow(2, i) * delayMsec));
            }),
          ),
        ),
      ),
    ),
  );
}
```

Further tasks:

- Try to find out how this operator works
- Use this operator in your example (just copy/paste it this time)
- Use the network tab (F12 dev tools) to see how it works
