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
  beforeEach(() => {
    cy.visit("/auth/signup");
  });

  it("should use all navigation button of /auth/signup", () => {
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

  it("should fill and test validity of the the form", () => {
    cy.focused().invoke("attr", "name").should("eq", "firstname");
    cy.focused()
      .then(($el) => {
        const elem = $el[0] as HTMLSelectElement;
        return elem.checkValidity();
      })
      .should("be.false");
    cy.focused()
      .type("coucou")
      .should("have.value", "coucou")
      .then(($el) => {
        const elem = $el[0] as HTMLSelectElement;
        return elem.checkValidity();
      })
      .should("be.true");
    cy.focused().type("hey{enter}");

    cy.focused().invoke("attr", "name").should("eq", "lastname");
    cy.focused().type("{enter}");
    cy.focused()
      .type("bl")
      .should("have.value", "bl")
      .then(($el) => {
        const elem = $el[0] as HTMLSelectElement;
        return elem.checkValidity();
      })
      .should("be.false");
    cy.focused()
      .type("ablabla")
      .should("have.value", "blablabla")
      .then(($el) => {
        const elem = $el[0] as HTMLSelectElement;
        return elem.checkValidity();
      })
      .should("be.true");
    cy.focused().type("{enter}");

    cy.focused().invoke("attr", "name").should("eq", "email");
    cy.focused()
      .type("kjhefkjh@kjhkjh/jh")
      .then(($el) => {
        const elem = $el[0] as HTMLSelectElement;
        return elem.checkValidity();
      })
      .should("be.false");
    cy.focused()
      .clear()
      .type("user@mail.fr")
      .then(($el) => {
        const elem = $el[0] as HTMLSelectElement;
        return elem.checkValidity();
      })
      .should("be.true");
    cy.focused().type("{enter}");

    cy.focused().invoke("attr", "name").should("eq", "username");
    cy.focused()
      .type("kjhkjh34")
      .then(($el) => {
        const elem = $el[0] as HTMLSelectElement;
        return elem.checkValidity();
      })
      .should("be.false");
    cy.focused()
      .clear()
      .type("myuser-name")
      .then(($el) => {
        const elem = $el[0] as HTMLSelectElement;
        return elem.checkValidity();
      })
      .should("be.true");
    cy.focused().type("{enter}");

    cy.focused().invoke("attr", "name").should("eq", "password");
    cy.focused()
      .type("that's a password")
      .then(($el) => {
        const elem = $el[0] as HTMLSelectElement;
        return elem.checkValidity();
      })
      .should("be.true");
  });
});

describe("The signin page", () => {
  beforeEach(() => {
    cy.visit("/auth/signin");
  });

  it("should use all navigation button of /auth/signin", () => {
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

  it("should fill and test validity of the the form", () => {
    cy.focused().invoke("attr", "name").should("eq", "username");
    cy.focused()
      .type("kjhkjh34")
      .then(($el) => {
        const elem = $el[0] as HTMLSelectElement;
        return elem.checkValidity();
      })
      .should("be.false");
    cy.focused()
      .clear()
      .type("myuser-name")
      .then(($el) => {
        const elem = $el[0] as HTMLSelectElement;
        return elem.checkValidity();
      })
      .should("be.true");
    cy.focused().type("{enter}");

    cy.focused().invoke("attr", "name").should("eq", "password");
    cy.focused().should("match", ":invalid");
    cy.focused()
      .type("that's a password")
      .then(($el) => {
        const elem = $el[0] as HTMLSelectElement;
        return elem.checkValidity();
      })
      .should("be.true");
  });
});

describe("The passwordreset page", () => {
  beforeEach(() => {
    cy.visit("/auth/passwordreset");
  });

  it("should use all navigation button of /auth/passwordreset", () => {
    cy.findByRole("link", { name: /sign in/i })
      .click()
      .url()
      .should("include", "/auth/signin")
      .go("back");
    cy.findByRole("link", { name: /home/i })
      .click()
      .url()
      .should("include", "/auth");
  });

  it("should fill and test validity of the the form", () => {
    cy.focused().invoke("attr", "name").should("eq", "email");
    cy.focused()
      .type("kjhkjh34")
      .then(($el) => {
        const elem = $el[0] as HTMLSelectElement;
        return elem.checkValidity();
      })
      .should("be.false");
    cy.focused()
      .clear()
      .type("adress@mail.fr")
      .then(($el) => {
        const elem = $el[0] as HTMLSelectElement;
        return elem.checkValidity();
      })
      .should("be.true");
  });
});
