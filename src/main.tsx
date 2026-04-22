import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import FounderDashboard from "./founder-dashboard/founder-dashboard.jsx";
import "./index.css";

const path = window.location.pathname.replace(/\/$/, "");
const Root = path === "/ops" ? FounderDashboard : App;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
