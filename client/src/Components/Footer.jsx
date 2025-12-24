




import React from "react";
import { FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="relative bg-[#0e0d11] border-t border-cyan-400/10 py-10 mt-16 overflow-hidden">
      
      {/* 🔹 Neon Top Divider */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 blur-sm"></div>

      {/* 🔹 Main Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">

        {/* Left / Center — Social Icons */}
        <div className="flex gap-6 md:gap-8 text-2xl justify-center md:justify-start">
          <a
            href="https://github.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-125 transition-transform duration-300 text-gray-400 hover:text-cyan-400 drop-shadow-[0_0_8px_#00c6ff]"
          >
            <FaGithub />
          </a>
          <a
            href="https://twitter.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-125 transition-transform duration-300 text-gray-400 hover:text-sky-400 drop-shadow-[0_0_8px_#00c6ff]"
          >
            <FaTwitter />
          </a>
          <a
            href="https://linkedin.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-125 transition-transform duration-300 text-gray-400 hover:text-blue-500 drop-shadow-[0_0_8px_#00c6ff]"
          >
            <FaLinkedin />
          </a>
        </div>

        {/* Right — Credits */}
        <div className="text-center md:text-right mt-5 md:mt-0 flex flex-col gap-1 text-gray-400">
          <p className="text-sm">
            Built with ❤️ by{" "}
            <span className="text-cyan-400 font-semibold hover:text-purple-400 transition-colors duration-300 cursor-pointer">
              Rajan Kumar Singh
            </span>
          </p>
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} — Powered by{" "}
            <span className="text-purple-400 font-semibold">R-Dev AI</span>
          </p>
        </div>
      </div>

      {/* 🔹 Bottom Glow Line */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent blur-md opacity-60"></div>
    </footer>
  );
};

export default Footer;


