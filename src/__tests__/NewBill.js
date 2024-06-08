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
import store from "../__mocks__/store.js";

const onNavigate = jest.fn();

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

  describe("When I submit a new bill", () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="root">
          <form data-testid="form-new-bill">
            <input data-testid="datepicker" value="2021-10-22" />
            <select data-testid="expense-type">
              <option value="Transports">Transports</option>
            </select>
            <input data-testid="expense-name" value="Taxi ride" />
            <input data-testid="amount" value="20" />
            <input data-testid="vat" value="4" />
            <input data-testid="pct" value="20" />
            <textarea data-testid="commentary">Business trip</textarea>
            <input data-testid="file" />
            <button type="submit">Submit</button>
          </form>
        </div>
      `;

      localStorage.setItem("user", JSON.stringify({ email: "test@example.com" }));
    });

    test("Then it should call handleSubmit and navigate to Bills page", () => {
      // Create a new instance of NewBill
      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: localStorageMock
      });

      // Mock the updateBill method
      newBill.updateBill = jest.fn();

      // Spy on the handleSubmit method
      const handleSubmitSpy = jest.spyOn(newBill, 'handleSubmit');

      // Attach the event listener to the form manually
      const form = screen.getByTestId("form-new-bill");
      form.addEventListener("submit", newBill.handleSubmit);

      // Simulate form submission
      fireEvent.submit(form);

      // Verify if handleSubmit was called
      expect(handleSubmitSpy).toHaveBeenCalled();

      // Verify if updateBill was called
      expect(newBill.updateBill).toHaveBeenCalled();

      // Verify if onNavigate was called with the correct path
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["Bills"]);
    });
  });
})
