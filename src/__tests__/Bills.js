/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import Bills from '../containers/Bills.js'
import {bills} from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from '../constants/routes.js'
import {localStorageMock} from "../__mocks__/localStorage.js";
import router from "../app/Router.js";

// Describes the scenario where the user is an employee
describe('Given I am logged in as an employee', () => {
  // Describes the scenario where the user is on Bills Page
  describe('When I am on Bills Page', () => {
    // The test where the bill icon in vertical layout should be highlighted
    test('Then bill icon in vertical layout should be highlighted', async () => {
      // Setting 'Employee' in localStorage of window
      Object.defineProperty(window, 'localStorage', {value: localStorageMock})
      window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))

      // Creating root canvas for navigation
      const root = document.createElement('div')
      root.setAttribute('id', 'root')
      document.body.append(root)

      // Initializing router
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))

      // Fetches the window icon
      const windowIcon = screen.getByTestId('icon-window')

      // Assert the icon has 'active-icon' class
      expect(windowIcon).toHaveClass('active-icon')
    })
    // The test where the bills should be ordered from earliest to latest
    test('Then bills should be ordered from earliest to latest', () => {
      // render Bills UI
      document.body.innerHTML = BillsUI({data: bills})

      // Fetch all dates
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)

      // Define antiChrono function for sorting in reverse chronological order
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)

      // Assert: The dates should be correctly sorted
      expect(dates).toEqual(datesSorted)
    })
  })

  // Scenario when navigating to NewBill page
  describe('Given I navigate to NewBill', () => {
    // The test where the navigation to NewBill happens correctly
    test('navigate to NewBill', () => {
      // Create a button in the DOM
      document.body.innerHTML = `<button data-testid="btn-new-bill"></button>`

      // Mock the onNavigate function
      const onNavigate = jest.fn((pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      })

      // Initialize Bills
      const bills = new Bills({ document, localStorage, onNavigate })

      // Get new bill button and simulate click
      const newBillButton = document.querySelector(`button[data-testid="btn-new-bill"]`)
      newBillButton.click()

      // Assert onNavigate has been called with correct path
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['NewBill'])
    })
  })

  // Describes the scenario when the user clicks on New Expense Note (bill)
  describe('When I click on New Expense Note', () => {
    // The test where the new bill form appears correctly
    test('Then a new bill form appears', async () => {
      // Define the onNavigate function
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      // Set user type to 'Employee'
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))

      // Initialize Bills class
      const billsInitialization = new Bills({
        document, onNavigate, store: null, localStorage: window.localStorage,
      })

      // Render the UI
      document.body.innerHTML = BillsUI({ data: billsInitialization })

      // Mock event listener
      const handleClickNewBill = jest.fn(billsInitialization.handleClickNewBill.bind(bills))
      const newBillBtn = screen.getByTestId('btn-new-bill')
      newBillBtn.addEventListener('click', handleClickNewBill)

      // Trigger click event
      userEvent.click(newBillBtn)
      // Assert event listener has been called
      expect(handleClickNewBill).toHaveBeenCalled()

      // Wait for form to be in the document
      await waitFor(() => screen.getByTestId('form-new-bill'))

      // Assert form is in the document
      expect(screen.getByTestId('form-new-bill')).toBeTruthy()
    })
  })

  // Describes the scenario when the user clicks on the eye of a bill
  describe('When I click on the eye of a bill', () => {
    // The test where a modal appears correctly
    test('Then a modal appears', async () => {
      // Define the function to navigate to the given pathname
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      // Set user type to 'Employee'
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))

      // Initialize Bills instance
      const billsInitialization = new Bills({
        document, onNavigate, store: null, localStorage: window.localStorage,
      })

      // Render the Bills page
      document.body.innerHTML = BillsUI({ data: bills })

      // Mock handleClickIconEye function
      const handleClickIconEye = jest.fn(e => billsInitialization.handleClickIconEye(e))

      // Fetch all eye icons in the document
      const eyeIcons = screen.getAllByTestId('icon-eye')

      // Fetch modal element
      const modal = document.getElementById('modaleFile')

      // Mock jQuery's modal function
      $.fn.modal = jest.fn(() => modal.classList.add('show'))

      // Whenever an eye icon is clicked, it should trigger the handleClickIconEye function
      eyeIcons.forEach((icon) => {
        icon.addEventListener('click', handleClickIconEye.bind(null, icon))
        userEvent.click(icon)
        expect(handleClickIconEye).toHaveBeenCalled()
      })

      // After an eye icon is clicked, the modal should be showing up in the screen
      expect(modal).toHaveClass('show')
    })
  })

  // Describes the scenario when user navigates to Bills page
  describe('When I navigate to Bills', () => {
    let onNavigate, bills

    // Before each of the test case, perform these set of actions
    beforeEach(() => {
      // Define the function to be triggered when the user navigates to a new page
      onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))

      bills = new Bills({ document, onNavigate, store: null, localStorage: window.localStorage })

      // Render the Bills page
      document.body.innerHTML = BillsUI({ data: bills })
    })

    // Check whether the Bills page shows up correctly
    test('Then the page shows up', async () => {
      await waitFor(() => expect(screen.getByText('Mes notes de frais')).toBeTruthy())
    })
  })
})
