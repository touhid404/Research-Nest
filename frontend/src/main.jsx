import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AuthProvider from "./provider/AuthProvider.jsx";
import { RouterProvider } from "react-router";
import { router } from "./router/router";
import ThemeProvider from "./provider/ThemeProvider.jsx";
import { Toaster } from 'react-hot-toast';
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Toaster position="bottom-left" />
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);
