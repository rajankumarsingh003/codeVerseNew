


import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

import { ClerkProvider } from "@clerk/clerk-react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { ThemeProvider } from "./context/ThemeContext";

// ✅ Clerk Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("❌ Missing VITE_CLERK_PUBLISHABLE_KEY in .env file");
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <ThemeProvider>
        <App />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
        />
      </ThemeProvider>
    </ClerkProvider>
  </React.StrictMode>
);
