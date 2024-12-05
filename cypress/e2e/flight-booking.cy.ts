describe('flight booking feature', () => {
  beforeEach(() => {
    cy.visit('');
  });

  it('should verify that flight search is showing cards', () => {
    cy.contains('a', 'Flights').click();
    cy.get('input[name=from]').clear().type('Hamburg');
    cy.get('input[name=to]').clear().type('Graz');
    cy.get('form .btn').should(($button) => {
      expect($button).to.not.have.attr('disabled', 'disabled');
    });

    cy.get('form .btn').first().click();
    cy.get('app-flight-card').its('length').should('be.gte', 3);
  });

  it('should search for flights from Wien to Eisenstadt by intercepting the network', () => {
    cy.fixture('flights').then((flights) => cy.intercept('GET', 'http://www.angular.at/api/flight**', flights));
    cy.contains('a', 'Flights').click();
    cy.get('input[name=from]').clear().type('Wien');
    cy.get('input[name=to]').clear().type('Eisenstadt');
    cy.get('form .btn').first().click();
    cy.get('app-flight-card').should('have.length', 3);

    cy.get('app-flight-card').first().as('flight-card');
    cy.get('@flight-card').find('> div').should('have.css', 'background-color', 'rgb(255, 255, 255)');
    cy.get('@flight-card').contains('button', 'Select').click();
    cy.get('@flight-card').find('> div').should('have.css', 'background-color', 'rgb(204, 197, 185)');
    cy.get('@flight-card').contains('button', 'Select').should('not.exist');
    cy.get('@flight-card').contains('button', 'Deselect').should('exist');
  });
});
