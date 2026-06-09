import { useState } from "react";
import Dashboard from "./Dashboard";

function App() {
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div className={darkMode ? "theme-dark" : "theme-light"}>
      <Dashboard darkMode={darkMode} setDarkMode={setDarkMode} />
    </div>
  );
}

export default App;
