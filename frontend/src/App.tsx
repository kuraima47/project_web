import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router/AppRoutes";
import { Menu } from "./components/Menu";

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-gray-100">
        <Menu />
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-2xl w-full mx-auto bg-white">
            <AppRoutes />
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}


export default App;
