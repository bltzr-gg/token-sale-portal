"use client";

import React from "react";
import logo from "../assets/images/logo.png";
import ConnectButton from "./connect-button";

const Navbar: React.FC = () => {
  return (
    <>
      <nav className="bg-background/25 fixed z-30  w-full gap-3 py-5 backdrop-blur-lg md:px-6 lg:p-8 lg:py-6">
        <div className="container mx-auto flex items-center justify-between px-3">
          <a
            className="flex items-center gap-3 text-white hover:text-gray-300"
            href="/"
          >
            <img
              src={logo}
              className="hover:text-primary hover:drop-shadow-primary w-[106px] transition-colors"
              aria-label="Real World Gaming Logo"
            />
          </a>
          <ConnectButton />
        </div>
      </nav>
    </>
  );
};

export default Navbar;
