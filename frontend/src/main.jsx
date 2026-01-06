import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AuthProvider from "./provider/AuthProvider.jsx";
import { RouterProvider } from "react-router";
import { router } from "./router/router";
import ThemeProvider from "./provider/ThemeProvider.jsx";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ToastProvider from "./components/common/ToastProvider.jsx";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider />
      <ThemeProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
);
