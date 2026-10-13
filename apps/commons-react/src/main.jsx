import React from "react";
import { createRoot } from "react-dom/client";
import "../../../web/style.css";
import "./react.css";
import { App } from "./App.jsx";

const element = document.getElementById("root");
if (!element) throw new Error("Commons React root is missing");
createRoot(element).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
