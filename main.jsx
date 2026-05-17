import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import MoneyTracker from "./money-tracker.jsx";

// polyfill window.storage → localStorage (สำหรับ dev)
if (!window.storage) {
  window.storage = {
    get: key => Promise.resolve({ value: localStorage.getItem(key) }),
    set: (key, val) => Promise.resolve(localStorage.setItem(key, val)),
  };
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MoneyTracker />
  </StrictMode>
);
