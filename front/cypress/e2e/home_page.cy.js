describe("The unsigned Home Page", () => {
  it("successfully loads", () => {
    cy.visit("/");
    cy.url().should("include", "/auth");
  });

  it("should use all navigation button of /auth homepage", () => {
    cy.visit("/");
    cy.findByRole("link", { name: /home/i })
      .click()
      .url()
      .should("include", "/auth");
    cy.findByRole("link", { name: /sign in/i })
      .click()
      .url()
      .should("include", "/auth/signin")
      .go("back");
    cy.findByRole("link", { name: "start shopping" })
      .click()
      .url()
      .should("include", "/auth/signup");
  });
});

describe("The signup page", () => {
  it("should use all navigation button of /auth/signup", () => {
    cy.visit("/auth/signup");
    cy.findByRole("link", { name: /home/i })
      .click()
      .url()
      .should("include", "/auth");
    cy.findByRole("link", { name: /sign in/i })
      .click()
      .url()
      .should("include", "/auth/signin")
      .go("back");
  });
});

describe("The signin page", () => {
  it("should use all navigation button of /auth/signin", () => {
    cy.visit("/auth/signin");
    cy.findByRole("link", { name: /sign in/i })
      .click()
      .url()
      .should("include", "/auth/signin");
    cy.findByRole("link", { name: /home/i })
      .click()
      .url()
      .should("include", "/auth")
      .go("back");
    cy.findByRole("link", { name: /forgot password \?/i })
      .click()
      .url()
      .should("include", "/auth/passwordreset")
      .go("back");
    cy.findByRole("link", { name: /no user account \? sign up/i })
      .click()
      .url()
      .should("include", "/auth/signup");
  });
});
