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
});
