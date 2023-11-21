describe("Registration flow", () => {
  beforeEach(function () {
    cy.fixture("user").then((user) => {
      this.user = user;
    });
  });

  it("should signup and login", function () {
    cy.visit("/auth/signup");
    cy.focused().type(`${this.user.firstname}{enter}`);
    cy.focused().type(`${this.user.lastname}{enter}`);
    cy.focused().type(`${this.user.email}{enter}`);
    cy.focused().type(`${this.user.username}{enter}`);
    cy.focused().type(`${this.user.password}{enter}`);
    cy.url().should("contain", "/auth/signin");
    cy.focused().type(`${this.user.username}{enter}`);
    cy.focused().type(`${this.user.password}{enter}`);
    cy.url().should("include", "/register");
  });

  // it("should signin", function () {
  //   const { username, password } = this.user;
  //   cy.login(username, password);
  // cy.visit("/auth/signin");
  // cy.focused().type(`${this.user.username}{enter}`);
  // cy.focused().type(`${this.user.password}{enter}`);
  // });
});
