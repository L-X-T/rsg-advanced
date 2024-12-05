describe('flight app', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('visits the initial page and check th title', () => {
    cy.contains('Hello World!');
  });
});
