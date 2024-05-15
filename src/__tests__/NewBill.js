/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { localStorageMock } from '../__mocks__/localStorage.js'
import { ROUTES, ROUTES_PATH } from '../constants/routes.js'
import router from '../app/Router.js'
import mockStore from '../__mocks__/store.js'
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

  describe('When I navigate to the NewBill Page', () => {
    test('Then show the new bill page', async () => {
      // Simulate a logged in Employee
      localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: 'a@a' }))

      // Create root div for navigation
      const root = document.createElement('div')
      root.setAttribute('id', 'root')
      document.body.append(root)

      // Setup navigation system
      router()

      // Programmatic navigation to the NewBill Page
      window.onNavigate(ROUTES_PATH.NewBill)
    })
  })

  describe('When I am on NewBill Page and UI Control Process is executed', () => {
    test('Form submission should trigger submit and file change handlers', async () => {
      // Define function for navigation to new pages
      const navigateTo = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      // Simulating a logged in user (Employee)
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
      }))

      document.body.innerHTML = NewBillUI()

      const billsInitialization = new NewBill({
        document, onNavigate: navigateTo, store: mockStore, localStorage: window.localStorage,
      })

      // Simulate a file upload process
      const file = new File(['image'], 'image.png', { type: 'image/png' })
      const handleChangeFile = jest.fn((e) => billsInitialization.handleChangeFile(e))
      const newBill = screen.getByTestId('form-new-bill')
      const fileBill = screen.getByTestId('file')

      fileBill.addEventListener('change', handleChangeFile)
      userEvent.upload(fileBill, file)

      // Check if file upload function is called
      expect(fileBill.files[0].name).toBeDefined()
      expect(handleChangeFile).toBeCalled()

      // Simulate form submission
      const handleSubmit = jest.fn((e) => billsInitialization.handleSubmit(e))
      newBill.addEventListener('submit', handleSubmit)
      fireEvent.submit(newBill)

      // Check if submit function is called
      expect(handleSubmit).toHaveBeenCalled()
    })
  })
})
