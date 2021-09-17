// ***********************************************
// This example commands.js shows you how to
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

Cypress.Commands.add("checkPage", (url) => {
    cy.url()
        .should('eq', url)
})

Cypress.Commands.add("checkText", (element, value) => {
    cy.get(element)
        .should('have.text', value)
})

Cypress.Commands.add("checkValue", (element, value) => {
    cy.get(element)
        .should('contain', value)
})

Cypress.Commands.add("clickElement", (element) => {
    cy.get(element)
        .click()
})

Cypress.Commands.add("enterValue", (element, value) => {
    cy.get(element)
        .type(value)
        .should('have.value', value)
})