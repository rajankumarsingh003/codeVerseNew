


import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  UserButton,
  useUser,
  SignedIn,
  SignedOut,
  RedirectToSignIn,
} from "@clerk/clerk-react";
import ChatModal from "./chatModel";
import HistoryModal from "./HistoryModal";
import JarvisVoice from "./Jarvis.jsx";
import logo from "../assets/g2.png";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const username = user?.email?.split("@")[0] || "Guest";

  const [chatOpen, setChatOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [pendingVoiceQuestion, setPendingVoiceQuestion] = useState(null);
  const chatRef = useRef(null);

  const handleWake = useCallback(() => setChatOpen(true), []);
  const handleVoiceQuestion = useCallback(
    (q) => {
      console.log("🎙️ Jarvis recognized question:", q);
      if (!chatOpen) {
        setPendingVoiceQuestion(q);
        setChatOpen(true);
      } else {
        chatRef.current?.askByVoice(q);
      }
    },
    [chatOpen]
  );

  useEffect(() => {
    if (chatOpen && pendingVoiceQuestion && chatRef.current?.askByVoice) {
      chatRef.current.askByVoice(pendingVoiceQuestion);
      setPendingVoiceQuestion(null);
    }
  }, [chatOpen, pendingVoiceQuestion]);

  return (
    <>
      {/* 🔹 Navbar - Fixed at Top */}
      <div
        className="fixed top-0 left-0 w-full z-50 flex flex-col md:flex-row 
        items-center justify-between px-6 md:px-[100px] h-auto md:h-[95px] 
        border-b border-gray-800 bg-[#141319]/95 backdrop-blur-md 
        shadow-[0_0_10px_#00c6ff40] py-4 md:py-0"
      >
        {/* 🔹 Logo Section */}
        <div className="logo flex items-center group mb-4 md:mb-0">
          <img
            src={logo}
            alt="R-Dev Logo"
            className="h-14 md:h-20 w-auto transition-all duration-500 ease-in-out 
            group-hover:drop-shadow-[0_0_20px_#00c6ff] mix-blend-screen brightness-200 contrast-125"
          />
          <span className="ml-3 text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text tracking-wide"></span>
        </div>

        {/* 🔹 Icons / Buttons Section */}
        <div className="icons flex flex-wrap md:flex-nowrap items-center gap-3 md:gap-[20px] w-full md:w-auto justify-center md:justify-end">
          <SignedIn>
            {/* 🧠 Code Insight Button */}
            <div
              className="relative cursor-pointer text-white font-semibold text-sm md:text-lg px-3 md:px-5 py-2 rounded-xl 
              bg-[rgba(255,255,255,0.05)] backdrop-blur-md border border-cyan-400/30 
              shadow-[0_0_10px_#00c6ff50] hover:shadow-[0_0_25px_#00c6ff80] 
              transition-all duration-500 text-center"
              onClick={() => navigate("/debugger")}
            >
              Code Insight
            </div>

            {/* 🤖 Ask CV Button */}
            <div
              className="cursor-pointer font-bold text-white text-sm md:text-lg px-4 md:px-6 py-2 rounded-xl
              bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 bg-[length:200%_200%]
              animate-gradientMove shadow-[0_0_15px_#00c6ff80] hover:scale-105 
              transition-transform duration-500 text-center"
              onClick={() => setChatOpen(!chatOpen)}
            >
              Ask CV
            </div>

            {/* ☰ History Button */}
            <div className="relative group">
              <div
                className="cursor-pointer text-white font-bold text-sm md:text-lg px-3 md:px-4 py-2 rounded-lg 
                transition-all duration-300 hover:bg-gray-700 flex items-center gap-2 justify-center"
                onClick={() => setHistoryOpen(!historyOpen)}
              >
                <span className="text-lg">☰</span>
              </div>
              <span className="absolute left-1/2 -bottom-10 -translate-x-1/2 text-xs md:text-sm bg-gray-800 text-white px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg border border-cyan-400">
                View Chat History
              </span>
            </div>

            {/* 👤 User Button */}
            <UserButton afterSignOutUrl="/" className="ml-2" />
          </SignedIn>

          <SignedOut>
            <RedirectToSignIn />
          </SignedOut>
        </div>
      </div>

      {/* 🔹 Add Padding on Top to Avoid Content Overlap */}
      <div className="pt-[110px] md:pt-[100px]"></div>

      {/* 🔹 Jarvis Voice Assistant */}
      <JarvisVoice onWake={handleWake} onQuestion={handleVoiceQuestion} />

      {/* 🔹 Chat Modal */}
      {chatOpen && (
        <ChatModal
          username={username}
          onClose={() => setChatOpen(false)}
          ref={chatRef}
        />
      )}

      {/* 🔹 History Modal */}
      {historyOpen && (
        <HistoryModal
          username={username}
          onClose={() => setHistoryOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;




