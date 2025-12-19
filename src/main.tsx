
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./styles/globals.css";
  import { installFigmaMakeClassNormalizer } from "./utils/figmaMakeClassNormalizer";
  import "./utils/testSupabaseConnection"; // Makes window.testSupabase() available

  installFigmaMakeClassNormalizer();
  createRoot(document.getElementById("root")!).render(<App />);
  