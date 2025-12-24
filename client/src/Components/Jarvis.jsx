



import React, { useEffect, useRef, useState } from "react";

const JarvisVoice = ({ onWake, onQuestion }) => {
  const [status, setStatus] = useState("idle");
  const [active, setActive] = useState(false);
  const [listeningEnabled, setListeningEnabled] = useState(true);

  const recRef = useRef(null);
  const running = useRef(false);
  const speaking = useRef(false);
  const currentUtter = useRef(null);
  const restartTimer = useRef(null);
  const voicesLoaded = useRef(false);
  const wakeWord = "jarvis";

  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

  const startRecognition = async () => {
    if (!recRef.current || running.current || speaking.current || !listeningEnabled) return;
    try {
      recRef.current.start();
      running.current = true;
      console.log("🎙️ Recognition started");
    } catch (e) {
      console.warn("Recognition start failed:", e.message);
    }
  };

  const stopRecognition = () => {
    if (recRef.current && running.current) {
      try {
        recRef.current.stop();
        running.current = false;
        console.log("🛑 Recognition stopped");
      } catch {}
    }
  };

  const speak = async (text) => {
    if (!text || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    if (!voicesLoaded.current) {
      await new Promise((resolve) => {
        const interval = setInterval(() => {
          const v = window.speechSynthesis.getVoices();
          if (v.length > 0) {
            voicesLoaded.current = true;
            clearInterval(interval);
            resolve();
          }
        }, 100);
      });
    }

    speaking.current = true;
    const utter = new SpeechSynthesisUtterance(text);
    currentUtter.current = utter;
    utter.lang = "en-US";
    utter.rate = 0.95;
    utter.pitch = 1.05;

    const voices = window.speechSynthesis.getVoices();
    const maleVoice =
      voices.find((v) =>
        v.name.toLowerCase().includes("david") ||
        v.name.toLowerCase().includes("mark") ||
        v.name.toLowerCase().includes("male")
      ) || voices[0];
    if (maleVoice) utter.voice = maleVoice;

    utter.onstart = () => {
      speaking.current = true;
      stopRecognition();
      setStatus("speaking");
    };

    utter.onend = async () => {
      speaking.current = false;
      currentUtter.current = null;
      setStatus("idle");
      await sleep(400);
      startRecognition();
    };

    window.speechSynthesis.speak(utter);
  };

  const stopSpeaking = () => {
    if (speaking.current) {
      window.speechSynthesis.cancel();
      speaking.current = false;
      currentUtter.current = null;
      setStatus("idle");
      startRecognition();
    }
  };

  const processCommand = (text) => {
    if (!text) return;

    if (text.includes("stop")) {
      stopSpeaking();
      return;
    }

    if (!active && text.includes(wakeWord)) {
      setActive(true);
      speak("Yes, I’m listening.");
      onWake?.();
      return;
    }

    if (active && !text.includes(wakeWord)) {
      onQuestion?.(text, true);
      speak("Got it.");
      setTimeout(() => setActive(false), 1500);
    }
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Speech recognition not supported!");

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = "en-US";

    rec.onstart = () => {
      running.current = true;
      setStatus("listening");
    };
    rec.onend = () => {
      running.current = false;
      if (!speaking.current && listeningEnabled) {
        clearTimeout(restartTimer.current);
        restartTimer.current = setTimeout(startRecognition, 700);
      }
    };
    rec.onerror = (e) => {
      running.current = false;
      if (["aborted", "network", "no-speech"].includes(e.error) && listeningEnabled) {
        clearTimeout(restartTimer.current);
        restartTimer.current = setTimeout(startRecognition, 800);
      }
    };
    rec.onresult = (event) => {
      const text = Array.from(event.results).map((r) => r[0].transcript).join("").toLowerCase().trim();
      processCommand(text);
    };

    recRef.current = rec;

    window.speechSynthesis.onvoiceschanged = () => {
      voicesLoaded.current = true;
      startRecognition();
    };

    if (listeningEnabled) startRecognition();

    return () => {
      clearTimeout(restartTimer.current);
      stopRecognition();
      stopSpeaking();
    };
  }, [onWake, onQuestion, listeningEnabled]);

  const handleManualStart = () => {
    if (!active) {
      setActive(true);
      speak("Yes, I’m listening.");
    }
  };

  const toggleListening = () => {
    setListeningEnabled((prev) => {
      const newState = !prev;
      if (!newState) {
        stopRecognition();
        setStatus("disabled");
        speak("Jarvis deactivated.");
      } else {
        speak("Jarvis is back online.");
        setTimeout(() => startRecognition(), 800);
      }
      return newState;
    });
  };

  return (
    <div className="fixed bottom-4 right-4 flex flex-col items-end gap-2 z-50">

      {/* 🔴 / 🟢 Smaller On-Off Button for all screens */}
      <button
        onClick={toggleListening}
        className={`w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center text-white font-bold shadow-md transition-all duration-300 
          ${listeningEnabled ? "bg-red-600 hover:bg-red-500" : "bg-green-600 hover:bg-green-500"}`}
        title={listeningEnabled ? "Turn Off Jarvis" : "Turn On Jarvis"}
      >
        {listeningEnabled ? "🔴" : "🟢"}
      </button>

      {/* Status Card */}
      <div
        onClick={handleManualStart}
        className={`cursor-pointer px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2.5 rounded-lg text-white font-medium shadow-md transition-all duration-300 
          ${active ? "bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_15px_rgba(0,174,255,0.7)]" : "bg-[#222] shadow-[0_0_8px_rgba(0,0,0,0.4)]"}
          flex items-center gap-2 text-[10px] sm:text-xs md:text-sm`}
      >
        {status === "disabled"
          ? "🛑 Jarvis Off"
          : status === "speaking"
          ? "🗣️ Speaking..."
          : status === "listening"
          ? "🎙️ Listening..."
          : "🧠 Activate Jarvis"}
      </div>
    </div>
  );
};

export default JarvisVoice;


