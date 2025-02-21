import React from "react";
import { Provider } from "react-redux";
import { render } from "@testing-library/react";
import configureStore from "redux-mock-store";
import DeleteButton from ".";
import { mockUser } from "../../../../mocks/mockUser";

const mockStore = configureStore([]);

describe("Surveys Delete Button", () => {
  let element: HTMLElement;
  beforeEach(() => {
    const store = mockStore({
      user: {
        userInfo: mockUser,
      },
    });

    store.dispatch = jest.fn();

    element = render(
      <Provider store={store}>
        <DeleteButton siteId={0} surveyId={0} diveDate="10/2/2020" />
      </Provider>
    ).container;
  });

  it("should render with given state from Redux store", () => {
    expect(element).toMatchSnapshot();
  });
});
