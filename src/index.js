import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { AppProvider } from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json";
import { BrowserRouter } from "react-router-dom";
import Firebase, { FirebaseContext } from "./firebase";
import "@shopify/polaris/dist/styles.css";
import "react-datepicker/dist/react-datepicker.css";
import "./style.css";

ReactDOM.render(
  <React.StrictMode>
    <AppProvider i18n={enTranslations}>
      <BrowserRouter>
        <FirebaseContext.Provider value={new Firebase()}>
          <App />
        </FirebaseContext.Provider>
      </BrowserRouter>
    </AppProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
