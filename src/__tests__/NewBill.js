/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from '@testing-library/dom'
import { localStorageMock } from '../__mocks__/localStorage.js'
import { ROUTES, ROUTES_PATH } from '../constants/routes.js'
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"


describe('Given I am logged in as an employee', () => {

  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
  })

  describe('When I am on the NewBill Page to save a bill', () => {
    test('Then the bill should be saved correctly', () => {
      // Define a function to navigate to new page
      const navigateTo = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))

      document.body.innerHTML = NewBillUI()

      const billsInitialization = new NewBill({
        document, onNavigate: navigateTo, store: null, localStorage: window.localStorage,
      })

      const newBillForm = screen.getByTestId('form-new-bill')

      // Check if the form is rendered correctly
      expect(newBillForm).toBeTruthy()

      // Test form's submit event
      const handleSubmit = jest.fn((event) => billsInitialization.handleSubmit(event))
      newBillForm.addEventListener('submit', handleSubmit)
      fireEvent.submit(newBillForm)

      // Assert submit event is fired
      expect(handleSubmit).toHaveBeenCalled()
    })
  })
})
