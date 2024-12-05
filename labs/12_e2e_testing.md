# E2E-Testing

- [E2E-Testing](#e2e-testing)
  - [Preparation](#preparation)
  - [Create a sanity check](#create-a-sanity-check)
    - [Bonus: Create a performance test \*](#bonus-create-a-performance-test-)
  - [Create some tests for your app](#create-some-tests-for-your-app)
    - [Check the document encoding](#check-the-document-encoding)
    - [Make an implicit Subject Assertion](#make-an-implicit-subject-assertion)
    - [Test via an explicit Subject Assertion](#test-via-an-explicit-subject-assertion)
    - [Count the listed nav links](#count-the-listed-nav-links)
  - [Test the Flight Search](#test-the-flight-search)
    - [Mock the Flight Search](#mock-the-flight-search)
    - [CSS Test](#css-test)
    - [Test Disabled Search Button](#test-disabled-search-button)
    - [Test Enabled Search Button](#test-enabled-search-button)
  - [Bonus: Implementing your own tests \*\*](#bonus-implementing-your-own-tests-)

## Preparation

1. First of all, you need to make sure that Cypress is already set up in your project. Try running:

```shell
ng e2e
```

2. If not, you can add Cypress to your project by running this schematic:

```shell
ng add @cypress/schematic
```

## Setup Cypress and run a sanity check

1. Create or switch the directory `/cypress/e2e` and create a new test file `app.cy.ts`.

   **Note**: If you're using a **Nx workspace** this file is found in the folder `apps/flight-app-e2e/src/integration`. You can remove the existing test because it will probably fail.

2. Rename the file `spec.cy.ts` to `app.cy.ts` and look at its sanity test.

   <details>
   <summary>Show Code</summary>
   <p>

   ```typescript
   describe('flight app', () => {
     beforeEach(() => {
       cy.visit('/');
     });

     it('visits the initial page and check th title', () => {
       cy.contains('Hello World!');
     });

     // next test goes here
   });
   ```

   </p>
   </details>

3. Now fire up your application and Cypress with `ng e2e`.

   **Note**: If you're using a **Nx workspace** you can just run `nx e2e flight-app-e2e`.

If everything is set up correctly, you should get 1 passing test. If the test passes good, else please contact your trainer before you continue.

Note, that you could also run `cypress run` (or `nx e2e flight-app-e2e` for Nx workspace) to run Cypress in `headless` mode.

Note, that you could also run `cypress open` (or `nx e2e flight-app-e2e --watch` for Nx workspace) to open the Cypress GUI.

For Cypress adjustments, you can also have a look at the `cypress.config.ts` and of course your `angular.json` in the root directory. In the latter, you can define your favorite browser (`electron` in my case):

```json
{
  "builder": "@cypress/schematic:cypress",
  "options": {
    "devServerTarget": "essentials:serve",
    "watch": true,
    "headless": false,
    "browser": "electron"
  },
  "configurations": {
    "production": {
      "devServerTarget": "essentials:serve:production"
    }
  }
}
```

### Create a performance test \*

We can create a simple performance test that checks if our app loads in less than a second.

1. Since you're probably not familiar with the Cypress syntax, you can just copy the following test into your `misc.cy.ts`:

   <details>
   <summary>Show Code</summary>
   <p>

   ```typescript
   it('should load inital page below 1 second', () => {
     cy.visit('/', {
       onBeforeLoad: (win) => {
         win.performance.mark('start-loading');
       },
       onLoad: (win) => {
         win.performance.mark('end-loading');
       }
     })
      .its('performance')
      .then((perf) => {
        perf.measure('pageLoad', 'start-loading', 'end-loading');
        const measure = perf.getEntriesByName('pageLoad')[0];
        const duration = Math.round(measure.duration);
        cy.log(`Page load duration: ${duration}`);
        expect(duration).to.be.most(1000);
      });
   });
   ```

   </p>
   </details>

2. Make sure this second test succeeds. If however you're machine is too slow you can raise the time cap.

## Create some tests for your app

Open the file `app.cy.ts` again and add some more misc tests.

### Check the document encoding

Use cy.document to retrieve document information.

```typescript
it('should have UTF-8 as charset', () => {
  cy.document().should('have.property', 'charset').and('eq', 'UTF-8');
});
```

Test your test by running cypress again.

### Make an implicit Subject Assertion

We check if the last sidebar list item contains the text "Basket".

```typescript
it('should do an implicit subject assertion', () => {
  cy.get('.sidebar-wrapper ul.nav li:last a').should('contain.text', 'Basket');
});
```

### Test via an explicit Subject Assertion

We check the second list item now. It should contain "Flights". This time we also check the link.

```typescript
it('should do an explicit subject assertion', () => {
  cy.get('.sidebar-wrapper ul.nav li:nth-child(2) a').should(($a) => {
    expect($a).to.contain.text('Flights');
    expect($a).to.have.attr('href', '/flight-booking/flight-search');
  });
});
```

### Count the listed nav links

Count the listed sidebar nav links.

```typescript
it('should count the nav entries', () => {
  cy.get('.sidebar-wrapper ul.nav li').its('length').should('be.gte', 3);
});
```

## Test the Flight Search

Create the file `flight-booking.cy.ts` in the folder `/cypress/e2e` and implement a Test that tests whether flights are found.

You might have to modify the assertion of the `app-flight-card` count.

<details>
<summary>Show code</summary>
<p>

```typescript
describe('flight booking feature', () => {
  beforeEach(() => {
    cy.visit('/flight-booking/flight-search');
  });

  it('should verify that flight search is showing cards', () => {
    cy.contains('a', 'Flights').click();
    cy.get('input[name=from]').clear().type('Graz');
    cy.get('input[name=to]').clear().type('Hamburg');
    cy.get('form .btn').should(($button) => {
      expect($button).to.not.have.attr('disabled', 'disabled');
    });

    cy.get('form .btn').first().click();
    cy.get('app-flight-card').its('length').should('be.gte', 3);
  });
});
```

</p>
</details>

### Mock the Flight Search

In `/cypress/fixtures`, add the file `flights.json` and add following data:

```json
[
  {
    "id": 1,
    "from": "Wien",
    "to": "Eisenstadt",
    "date": "2022-03-01",
    "delayed": false
  },
  {
    "id": 2,
    "from": "Wien",
    "to": "Eisenstadt",
    "date": "2022-03-02",
    "delayed": true
  },
  {
    "id": 3,
    "from": "Wien",
    "to": "Eisenstadt",
    "date": "2022-03-03",
    "delayed": false
  }
]
```

Write a Test that mocks the search requests and returns the fixtures instead.

<details>
<summary>Show Solution</summary>
<p>

```typescript
it('should search for flights from Wien to Eisenstadt by intercepting the network', () => {
  cy.fixture('flights').then((flights) => cy.intercept('GET', 'http://www.angular.at/api/flight**', flights));
  cy.contains('a', 'Flights').click();
  cy.get('input[name=from]').clear().type('Wien');
  cy.get('input[name=to]').clear().type('Eisenstadt');
  cy.get('form .btn').click();
  cy.get('flight-card').should('have.length', 3);
});
```

</p>
</details>

### CSS Test

Implement a Test that checks whether the expected `background-color` is shown in the UI.

The provided solution also showcases the usage of alias and checks for non-existing elements.

<details>
<summary>Show code</summary>
<p>

```typescript
it('should search for flights from Wien to Eisenstadt by intercepting the network', () => {
  cy.fixture('flights').then((flights) => cy.intercept('GET', 'http://www.angular.at/api/flight**', flights));
  cy.contains('a', 'Flights').click();
  cy.get('input[name=from]').clear().type('Wien');
  cy.get('input[name=to]').clear().type('Eisenstadt');
  cy.get('form .btn').click();

  cy.get('flight-card').first().as('flight-card');
  cy.get('@flight-card').find('> div').should('have.css', 'background-color', 'rgb(255, 255, 255)');
  cy.get('@flight-card').contains('button', 'Select').click();
  cy.get('@flight-card').find('> div').should('have.css', 'background-color', 'rgb(204, 197, 185)');
  cy.get('@flight-card').contains('button', 'Select').should('not.exist');
  cy.get('@flight-card').contains('button', 'Remove').should('exist');
});
```

</p>
</details>

### Test Disabled Search Button

Implement a Test that checks whether the Search Button is correctly deactivated if the property `from` is not set.

<details>
<summary>Show Solution</summary>
<p>

```typescript
it('should disable the search button when form is invalid', () => {
  cy.contains('a', 'Flights').click();
  cy.get('input[name=from]').clear();
  cy.get('input[name=to]').clear();
  cy.get('form .btn').should('be.disabled');
});
```

</p>
</details>

### Test Enabled Search Button

Implement a Test that checks whether the Search Button is correctly activated if the properties `from` and `to` are set.

<details>
<summary>Show Solution</summary>
<p>

```typescript
it('should enable the search button when form is valid', () => {
  cy.contains('a', 'Flights').click();
  cy.get('input[name=from]').clear().type('Wien');
  cy.get('input[name=to]').clear().type('Frankfurt');
  cy.get('form .btn').should('not.be.disabled');
});
```

</p>
</details>

## Bonus: Implementing your own tests \*\*

1. [Here](https://docs.cypress.io/guides/getting-started/writing-your-first-test) you find some information about writing tests. Have a look at it.

2. Create your own tests and see if they succeed.

3. If you write an interesting test make sure to present it to your team mates.
