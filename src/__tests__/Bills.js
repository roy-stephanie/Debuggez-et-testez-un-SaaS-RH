/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'
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
})
