import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster, toast } from "sonner";
import axios from "axios";

import "./index.css";
import App from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary";

/* =====================================================
   🔥 GLOBAL AXIOS ERROR HANDLER (RUNS ONCE)
===================================================== */
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      "Something went wrong. Please try again.";

    // 🔕 SILENT REQUEST (background jobs)
    if (error.config?.silent) {
      return Promise.reject(error);
    }

    // 🔐 AUTH ERRORS
    if (status === 401) {
      toast.error("Session expired. Please login again.");
      localStorage.clear();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // ❌ NORMAL USER-FACING ERRORS
    toast.error(message);

    return Promise.reject(error);
  }
);


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
        <Toaster richColors position="bottom-right" />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);
