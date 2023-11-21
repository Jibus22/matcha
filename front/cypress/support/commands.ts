/// <reference types="cypress" />
import "@testing-library/cypress/add-commands";
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
declare global {
  namespace Cypress {
    interface Chainable {
      login(username: string, password: string): Chainable<void>;
      // drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
      // dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
      // visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
    }
  }
}

Cypress.Commands.add("login", (username, password) => {
  cy.session(
    username,
    () => {
      cy.visit("/auth/signin");
      cy.focused().type(`${username}{enter}`);
      cy.focused().type(`${password}{enter}`);
      cy.url().should("include", "/register");
    },
    {
      validate: () => {
        cy.getAllSessionStorage().then((result) => {
          expect(result).to.deep.equal({
            "http://localhost:5173": {
              session_id: "false_session_id_0123456789",
            },
          });
        });
      },
    }
  );
});
