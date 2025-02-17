/// <reference types="cypress" />

import { URLS } from "./constants";

// These tests just ensure that none of the pages have been inadvertently broken by any code changes
describe("smoke tests", () => {
  it("renders home page", () => {
    cy.visit(URLS.HOME);
    cy.shouldRenderPageWithId("__AXIS_HOME_PAGE__");
  });

  if (Cypress.env("VITE_TESTNET") === "true") {
    it("renders faucet page", () => {
      cy.visit(URLS.FAUCET);
      cy.shouldRenderPageWithId("__AXIS_FAUCET_PAGE__");
    });
    it("renders deploy page", () => {
      cy.visit(URLS.DEPLOY);
      cy.shouldRenderPageWithId("__AXIS_DEPLOY_PAGE__");
    });
  }
});
