// Notes

// I did not have enough time to implement the interception of the costs_summary response everywhere. I did include an example of a possible implementation in the 'should include the option to select 128GB capacity with a red color' test.

// I did not have enough time to implement the comparison of selected prices and prices in the overviews everywhere. I did include an example of a possible implementation in the 'should include the option to select a monthly price'/'should show the selected phone capacity and its selected monthly price' test. Writing values to the fixture would have to be adjusted so that it can add to the fixture instead of overwriting it.

// I did not see a yellow color option, so I went with red instead

// Improvements to be made

// Define fixture in beforeEach so that it doesn't have to be called individually multiple times
// Add more commands for actions that are repeated multiple times
// Change "contain" checks to "have.text" or similar

// Challenges

// 1
// API returns error 404 after clicking on Naar contactgegevens button
// I added the test cases manually (using browser tools) without running Cypress. These test cases would need to be checked after the API returns the expected response. I also used multiple "contain" checks here which could then be replaced.

// 2
// The categories in the costs_summary response are not always returned in the same order. To solve this I decided to look first for the categories object which holds the category_name that I'm looking for, after which I look for the items object which holds the key that I'm looking for. There is probably a native Cypress function which does this as well, but I would have to look into this more.

// 3
// Some elements that I want to check do not have dedicated date-test tags. I look at the class here instead, but since this is a bit more flaky, I would ask a developer to add a data-test on a deeper level instead.

describe('Phone page', function () {
    before(function () {
        // baseUrl is set in cypress.json
        cy.visit('/')
        cy.clickElement('.cookiewall__decline')
        cy.clickElement('[data-test=vfz-vodafone-pdp-converged-modal-button--false]')
    })
    describe('selection options', function () {
        it('should include the option to select 128GB capacity with a red color', function () {
            // Intercept the cost summary POST so we can check the capacity in the response later
            cy.intercept("POST", "**/costs_summary**")
                .as("summary")
            cy.clickElement('[data-test=vfz-vodafone-pdp-capacity-selector-128GB]')
            cy.wait('@summary').then(xhr => {
                // Check if selected phone/capacity is listed in the monthly category
                const categoryMonthly = xhr.response.body.data[0].categories.find(category => category.category_name === "Totaal per maand")
                const itemMonthly = categoryMonthly.items.find(item => item.key === "DEVICE_RECURRING_CHARGE")
                expect(itemMonthly.description).to.eql("Apple iPhone 11 128GB")
                // Check if selected phone/capacity is listed in the oneTime category
                const categoryOneTime = xhr.response.body.data[0].categories.find(category => category.category_name === "Totaal eenmalig")
                const itemOneTime = categoryOneTime.items.find(item => item.key === "DEVICE_ONE_TIME_PRICE")
                expect(itemOneTime.description).to.eql("Apple iPhone 11 128GB")
            });
            cy.clickElement('[data-test=vfz-vodafone-pdp-color-selector--1]')
        })
        it('should include the option to indicate that the customer has Ziggo internet', function () {
            cy.clickElement('[data-test=vfz-vodafone-pdp-radio-input-btn__ziggo-thuis-yes]')
        })
        it('should include the option to select a Red Together subscription', function () {
            cy.clickElement('[data-test="vfz-vodafone-pdp-subscription-listing-name--Red Together"]')
        })
        it('should include the option to select a 1 year contract duration', function () {
            cy.clickElement('[data-test=vfz-vodafone-pdp-subscription-duration--12]')
        })
        it('should include the option to select a monthly price', function () {
            // To do: add option to move slider
            // Write selected monthly cost to fixture so that it can be used in tests for the following pages as well
            cy.get('[data-test=vfz-device-payment-selector__price-recurring]').invoke('text').then((monthlyPrice) => {
                cy.writeFile('cypress/fixtures/costs.json', { "monthlyPrice": monthlyPrice.trim() })
            })
        })
    })
    describe('order overview', function () {
        it('should show the selected phone capacity and its selected monthly price', function () {
            cy.checkText('[data-test=vfz-vodafone-pdp-receipt__monthly-costs-device] > [data-test=vfz-vodafone-pdp-receipt__costs-row] > .vfz-vodafone-pdp-receipt__bullet-item', 'Apple iPhone 11 128GB')
            // Compare the selected monthly price and the monthly price listed in the summary using the data from the fixture
            cy.get('[data-test=vfz-vodafone-pdp-receipt__device-price-recurring]').invoke('text').then((orderPrice) => {
                cy.fixture('costs.json').then((costs) => {
                    expect(orderPrice).to.eql('€' + ' ' + costs.monthlyPrice)
                })
            })
        })
        it('should show the selected subscription, its duration and its monthly price', function () {
            cy.checkText('[data-test=vfz-vodafone-pdp-receipt__item-description]', 'Red Together 1 jaar')
            // Add price check
        })
        it('should show the Ziggo internet discount', function () {
            cy.checkText('[data-test=vfz-vodafone-pdp__discount-item]', 'Ziggo korting')
            cy.checkText('.vfz-vodafone-pdp-receipt--item-price-blue', '- € 5,00')
        })
        // Add totaal per maand check
        // Add toestelkosten check        
    })
    describe('button volgende stap', function () {
        it('should redirect the customer to the shopping cart page after selecting the option for a new subscription', function () {
            cy.clickElement('[data-test=vfz-order-button]')
            cy.clickElement('[data-test=vfz-order-checkout-redirect]')
            cy.checkPage('https://www.vodafone.nl/bestellen/winkelwagen')
        })
    })
})

describe('order page', function () {
    describe('shopping cart', function () {
        it('should show the selected phone and its capacity/color', function () {
            cy.checkValue('[data-testid=cart-PHONE-apple-iphone-11-ef-128gb-red]', 'Apple iPhone 11 128GB Red')
            // Add price check
        })
        it('should show the selected subscription and its duration', function () {
            cy.checkValue('[data-testid=cart-REGULAR_SUBSCRIPTION-red65-red-together-1jr]', 'Red Together 1 jaar')
            // Add price check
        })
        it('should show the Ziggo internet discount', function () {
            cy.checkValue('[data-testid="12345"]', 'Korting & dubbele data omdat je Ziggo hebt​')
            // Add price check
        })
    })
    describe('button Naar gegevens', function () {
        it('should redirect the customer to the details page', function () {
            cy.clickElement('[data-testid=page-submitButton]')
            cy.checkPage('https://www.vodafone.nl/bestellen/persoonlijke-gegevens/gegevens')
        })
    })
})

describe('details page', function () {
    describe('personal details', function () {
        it('should include the option to select Meneer', function () {
            cy.contains('Meneer')
                .click()
        })
        it('should allow the user to enter their name and birth date', function () {
            cy.fixture('personDetails.json').then((details) => {
                cy.enterValue('#gegevens-initials', details.initials)
                cy.enterValue('#gegevens-lastName', details.lastName)
                cy.enterValue('#gegevens-birthdate-date', details.birthDate)
            })
        })
        it('should load the contact information form after clicking on button Naar contactgegevens', function () {
            cy.contains('Naar contactgegevens')
                .click()
            cy.checkPage('https://www.vodafone.nl/bestellen/persoonlijke-gegevens/contact')
        })
    })
    describe('contact details', function () {
        it('should allow the user to enter their phone number and email address', function () {
            cy.fixture('personDetails.json').then((details) => {
                cy.enterValue('#contact-phone1', details.phoneNumber)
                cy.enterValue('#contact-email', details.emailAddress)
            })
        })
        it('should load the address information form after clicking on button Naar adresgegevens', function () {
            cy.contains('Naar adresgegevens')
                .click()
            cy.checkPage('https://www.vodafone.nl/bestellen/persoonlijke-gegevens/adres')
        })
    })
    describe('address details', function () {
        it('should allow the user to enter their address details', function () {
            cy.fixture('personDetails.json').then((details) => {
                cy.enterValue('[data-testid=postcode]', details.postalCode)
                cy.enterValue('[data-testid=houseNumber]', details.houseNumber)
            })
        })
        it('should show the complete address after entering postcode and huisnummer', function () {
            cy.fixture('personDetails.json').then((details) => {
                cy.checkValue('.EspAddressFinder__ResultBox-sc-14eebe6-0', details.street + " " + details.houseNumber + "," + details.postalCode + " " + details.city + "," + details.country)
            })
        })
        it('should load the identification information form after clicking on button Naar legitimatie', function () {
            cy.contains('Naar legitimatie')
                .click()
            cy.checkPage('https://www.vodafone.nl/bestellen/persoonlijke-gegevens/identificatie')
        })
    })
    describe('identification details', function () {
        it('should allow the user to select an ID as identification type', function () {
            // To do: update after 404 is solved. Not sure how the dropdown works.
            cy.get('#type')
                .click()
        })
        it('should allow the user to enter a document number and expiration date', function () {
            cy.fixture('personDetails.json').then((details) => {
                cy.enterValue('#legitimatie-documentNumber', details.documentNumber)
                cy.enterValue('[data-testid=expiryDate]', details.expirationDate)
            })
        })
        it('should load the payment information form after clicking on button Naar betalingsgegevens', function () {
            cy.contains('Naar betalingsgegevens')
                .click()
            cy.checkPage('https://www.vodafone.nl/bestellen/persoonlijke-gegevens/betaling')
        })
    })
    describe('payment details', function () {
        it('should allow the user to enter a bank account number', function () {
            cy.fixture('personDetails.json').then((details) => {
                cy.enterValue('#betaling-iban', details.bankAccountNumber)
            })
        })
    })
    describe('button Naar lening', function () {
        it('should redirect the customer to the loan page', function () {
            cy.clickElement('[data-testid=page-submitButton]')
            cy.checkPage('https://www.vodafone.nl/bestellen/gegevens-lening')
        })
    })
})

describe('Loan page', function () {
    describe('input form', function () {
        it('should allow the user to select a family composition and income information', function () {
            // To do: update after 404 is solved. Not sure how the dropdown works.
            cy.get('#familyType')
                .click()
            cy.fixture('personDetails.json').then((details) => {
                cy.enterValue('#ilt-form-income', details.monthlyIncome)
                cy.enterValue('#housingCosts', details.monthlyExpenses)
            })
        })
        it('should approve the loan after entering suitable income information', function () {
            cy.checkText('.FormStatus___StyledDiv-sc-1nyoag6-2 igguPX', 'De (voorlopige) check is goedgekeurd. Je kunt verder met afsluiten.')
        })
    })
    describe('button Naar nummerbehoud', function () {
        it('should redirect the customer to the phone number retention page', function () {
            cy.clickElement('[data-testid=page-submitButton]')
            cy.checkPage('https://www.vodafone.nl/bestellen/nummerbehoud')
        })
    })
})

describe('Number retention page', function () {
    it('should redirect the customer to the overview page if no number retention is selected', function () {
        cy.clickElement('[data-testid=page-submitButton]')
        cy.checkPage('https://www.vodafone.nl/bestellen/nummerbehoud')
    })
})

describe('Overview page', function () {
    describe('products', function () {
        it('should show the selected phone and subscription', function () {
            cy.checkValue('[data-testid=itemHeaderVodafone]', 'Apple iPhone 11 128GB Red met Red Together 1 jaar')
            cy.clickElement('[data-testid=itemHeaderVodafone]')
            cy.checkValue('[data-testid=cart-PHONE-apple-iphone-11-ef-128gb-red]', 'Apple iPhone 11 128GB Red')
            cy.checkValue('[data-testid=cart-REGULAR_SUBSCRIPTION-red65-red-together-1jr]', 'Red Together 1 jaar')
            cy.checkValue('[data-testid=12345]', 'Korting & dubbele data omdat u Ziggo heeft')
        })
    })
    describe('personal details', function () {
        it('should show the entered personal details', function () {
            cy.fixture('personDetails.json').then((details) => {
                cy.checkValue('[data-testid=name]', details.initials + " " + details.lastName)
                cy.checkText('[data-testid=birthday]', details.birthDate)
                cy.checkText('[data-testid=phone]', details.phoneNumber)
                cy.checkText('[data-testid=email]', details.emailAddress)
                cy.checkText('[data-testid=iban]', details.bankAccountNumber)
            })
        })
    })
    describe('address details', function () {
        it('should show the entered personal details', function () {
            cy.fixture('personDetails.json').then((details) => {
                cy.get('[data-testid=addressSticker]')
                    .should('have.text', details.street + " " + details.houseNumber)
                    .and('have.text', details.postalCode + " " + details.city)
                    .and('have.text', details.country)
            })
        })
    })
})