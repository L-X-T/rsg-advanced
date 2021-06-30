# Performance

- [Performance](#performance)
  - [Lazy Loading](#lazy-loading)
    - [Implementing Lazy Loading for a feature module](#implementing-lazy-loading-for-a-feature-module)
    - [Implementing Preloading](#implementing-preloading)
    - [Bonus: Implementing a Custom Preloading Strategy \*\*](#bonus-implementing-a-custom-preloading-strategy-)
  - [Improving Data Binding Performance with OnPush](#improving-data-binding-performance-with-onpush)
  - [Improving Startup Performance with Prod-Mode](#improving-startup-performance-with-prod-mode)
  - [Bonus: Inspecting Bundles with webpack-bundle-analyzer](#bonus-inspecting-bundles-with-webpack-bundle-analyzer)

## Lazy Loading

### Implementing Lazy Loading for a feature module

Implement lazy loading for the `flight-booking.routes.ts` in your `app.routes.ts`.

Keep in mind that lazy loading only works if the module in question isn't referenced directly but only with a string in the router configuration.

1. Open the file `app.routes.ts` and introduce a route with the path `flight-booking`.
   It should point to the `flightBookingRoutes` using `loadChildren`:

   <details>
   <summary>Show Code</summary>
   <p>

   ```typescript
   [...]
   {
     path: 'flight-booking',
     loadChildren: () => import('./flight-booking/flight-booking.routes').then(m => m.flightBookingRoutes)
   },
   {
     // This route needs to be the last one!
     path: '**',
     [...]
   }
   [...]
   ```

   </p>
   </details>

3. Make sure your sidebar link to flight-search and passenger-search still works (something like `routerLink="/flight-booking/flight-search"`).

4. Also make sure your `Edit` Button in your `FlightCardComponent` still works (`[routerLink]="['/flight-booking/flight-edit', ...`).

5. Find out that webpack splits off an own chunk for the `flightBookingRoutes` after implementing lazy loading.
   If this works, you will see another chunk at the console (e. g. `flight-booking-flight-booking-module.js` depending on the used version of the CLI)

6. Try it out in the browser and use the network tab within the dev tools (F12) to make sure that it is only loaded on demand.
   If it doesn't work, have a look to the console tab within the dev tools.

### Implementing Preloading

In this exercise you will implement Preloading using Angular `PreloadAllModules` strategy.

1. Open the file `app.config.ts` and register the `PreloadAllModules` strategy when calling `provideRouter()`.

   <details>
   <summary>Show Code</summary>
   <p>

   ```typescript
   provideRouter(
      appRoutes,
      // withDebugTracing(),
      // withHashLocation(),
      withPreloading(PreloadAllModules),
      // withEnabledBlockingInitialNavigation()
    ),
   ```

   </p>
   </details>

2. Make sure it works using the network tab within Chrome's dev tools. If it works, the lazy bundles are loaded **after** the app has been initializes. If this is the case, the chunks show up quite late in the water fall diagram.

### Bonus: Using ngx-quicklink \*\*

1. [Here](https://www.npmjs.com/package/ngx-quicklink) you find some information about this fancy preloading strategy. Have a look at it.

2. Implement to `ngx-quicklink` solution.

3. Test it.

## Improving Data Binding Performance with OnPush

1. Open the file `flight-search.component.ts` and add this method `delayFirstFlight` which you bind to the new button with the label `Delay 1st Flight` in the HTML Template.

   ```typescript
   delay(): void {
     const ONE_MINUTE = 1000 * 60;
     const oldFlights = this.flights;
     const oldFlight = oldFlights[0];
     const oldDate = new Date(oldFlight.date);

     // Mutable
     oldDate.setTime(oldDate.getTime() + 15 * ONE_MINUTE);
     oldFlight.date = oldDate.toISOString();
   }
   ```

   ```html
       [...]
         Search
       </button>

       @if (flights.length > 0) {
         <button type="button" class="btn btn-default" style="margin-left: 10px" (click)="delayFirstFlight()">
           Delay 1st Flight
         </button>
       }
     </div>
     [...]
   ```

2. Now open the file `flight-card.component.ts` inject this in your component: `private readonly elementRef: ElementRef` and `private readonly ngZzone: NgZone)` (make sure the imports are added correctly) and then add this `blink` method to your component.

   ```typescript
   blink(): void {
     // Dirty Hack used to visualize the change detector
     // let originalColor = this.elementRef.nativeElement.firstChild.style.backgroundColor;
     this.elementRef.nativeElement.firstChild.style.backgroundColor = 'crimson';
     //              ^----- DOM-Element

     this.ngZone.runOutsideAngular(() => {
       setTimeout(() => {
         this.elementRef.nativeElement.firstChild.style.backgroundColor = this.selected ? 'rgb(204, 197, 185)' : '';
       }, 1000);
     });
   }
   ```

3. Move to the file `flight-card.component.html` and create a data binding for this method at the end:

   ```
   {{ blink() }}
   ```

   Please note that binding methods is not a good idea with respect to performance. We do it here just to visualize the change tracker.

4. Open the solution in the browser and search for flights form `Hamburg` to `Graz`.

5. Click the button `Delay 1st Flight` and see that just the first flight gets a new date. But you also see that every component is checked for changes by Angular b/c every component blinks.

6. Open the file `flight-card.component.ts`. Switch on `OnPush` for your `FlightCard`.

   <details>
   <summary>Show Code</summary>
   <p>

   ```typescript
   import { ChangeDetectionStrategy } from '@angular/core';
   [...]
   @Component({
     selector: 'app-flight-card',
     templateUrl: 'flight-card.component.html',
     changeDetection: ChangeDetectionStrategy.OnPush
   })
   export class FlightCardComponent {
     [...]
   }
   ```

   </p>
   </details>

7. Open the `flight-search.component.ts` and alter it to update the selected flight's date in an _immutable_ way:

   <details>
   <summary>Show Code</summary>
   <p>

   ```typescript
   delay(): void {
     const ONE_MINUTE = 1000 * 60;

     const oldFlights = this.flights;
     const oldFlight = oldFlights[0];
     const oldDate = new Date(oldFlight.date);

     // Mutable
     // oldDate.setTime(oldDate.getTime() + 15 * ONE_MINUTE );
     // oldFlight.date = oldDate.toISOString();

     // Immutable
     const newDate = new Date(oldDate.getTime() + 15 * ONE_MINUTE);
     const newFlight: Flight = { ...oldFlight, date: newDate.toISOString() };
     this.flights = [ newFlight, ...oldFlights.slice(1) ];
   }
   ```

</p>
</details>

You find some information about the object spread operator (e. g. `...oldFlight`) [here](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-1.html) (scroll down to Object Spread) and about the array spread operator (e. g. [newFlight, ...oldFlights.slice(1)]) [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_operator).

8. Make sure your implementation works. Switch to the browser and search for flights again. Click `Delay 1st Flight` one more time and find out that Angular is just checking and updating the first flight card.

## Improving Startup Performance with Prod-Mode

1. Make sure, your solution runs in debug mode (`ng serve -o`)

2. Open the performance tab in Chrome's dev tools and reload the app. Find out how long bootstrapping takes and create a screenshot.

   **Hint:** In order to respect the cache, do it twice and take the screenshot after the 2nd try.

3. Install the simple web server serve:

   ```
   npm install serve -g
   ```

4. Switch to the console and move to the root folder of your project. Create a production build:

   ```
   ng build --prod
   ```

5. Start live-server for your production build. For this, switch to your project within the `dist` folder and call serve:

   ```
   serve -s
   ```

6. Open the performance tab in Chrome's dev tools and reload the app. Find out how long bootstrapping takes and create a screenshot.

   **Hint:** In order to respect the cache, do it twice and take the screenshot after the 2nd try.

7. Compare your screenshot with the performance results.
