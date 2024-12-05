describe('flight app', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('visits the initial page and check th title', () => {
    cy.contains('Hello World!');
  });

  it('should load inital page below 1 second', () => {
    cy.visit('/', {
      onBeforeLoad: (win) => {
        win.performance.mark('start-loading');
      },
      onLoad: (win) => {
        win.performance.mark('end-loading');
      },
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

  it('should have UTF-8 as charset', () => {
    cy.document().should('have.property', 'charset').and('eq', 'UTF-8');
  });

  it('should do an implicit subject assertion', () => {
    cy.get('.sidebar-wrapper ul.nav li:first-child a').should('contain.text', 'Home');
    cy.get('.sidebar-wrapper ul.nav li:last-child a').should('contain.text', 'Passengers');
  });

  it('should do an explicit subject assertion', () => {
    cy.get('.sidebar-wrapper ul.nav li:nth-child(3) a').should(($a) => {
      expect($a).to.contain('Flights');
      expect($a).to.have.attr('href', '/flight-booking/flight-search');
    });
  });

  it('should count the nav entries', () => {
    cy.get('.sidebar-wrapper ul.nav li').its('length').should('be.gte', 3);
  });
});
