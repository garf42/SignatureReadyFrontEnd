import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { App } from "@/ui/App";

// The only file outside src/ui/, and the only file that does not port.
// In Foundry the shell owns this level: it supplies the OSDK provider, the
// /auth/callback route and the dev-server basename. Nothing else belongs here.
const host = document.getElementById("root");
if (!host) throw new Error("Missing #root");

createRoot(host).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
