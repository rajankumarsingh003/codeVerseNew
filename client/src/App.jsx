


import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import NoPage from "./Pages/NoPage";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import { SignIn, SignUp, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import Debugger from "./Pages/Debugger.jsx";

const App = () => {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Navbar />

        <div className="flex-grow">
          <Routes>

            {/* ✅ Home (Protected) */}
            <Route
              path="/"
              element={
                <SignedIn>
                  <Home />
                </SignedIn>
              }
            />

            {/* ❌ If not logged in → redirect to sign-in */}
            <Route
              path="/"
              element={
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              }
            />

            {/* ✅ Clerk Auth Pages */}
            <Route
              path="/sign-in/*"
              element={<SignIn routing="path" path="/sign-in" />}
            />
            <Route
              path="/sign-up/*"
              element={<SignUp routing="path" path="/sign-up" />}
            />

            {/* ✅ Debugger (Protected) */}
            <Route
              path="/debugger"
              element={
                <SignedIn>
                  <Debugger />
                </SignedIn>
              }
            />

            {/* ❌ 404 Page */}
            <Route path="*" element={<NoPage />} />

          </Routes>
        </div>

        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
