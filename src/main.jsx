import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux"; 
import store from "@/store";
import App from "./App.jsx";
import { ThemeProvider } from "./components/common";
import { ToastProvider } from "./components/common";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
