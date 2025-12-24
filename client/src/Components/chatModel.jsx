



import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import axios from "axios";
import { FaMicrophone, FaCopy, FaTrash } from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";

const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const ChatModal = forwardRef(
  ({ username, onClose, initialVoiceQuestion = "" }, ref) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState(initialVoiceQuestion);
    const [loading, setLoading] = useState(false);

    const recognitionRef = useRef(null);
    const voiceTimeout = useRef(null);
    const chatEndRef = useRef(null);

    /* =======================
       TEXT TO SPEECH
    ======================= */
    const speak = (text) => {
      if (!text || !window.speechSynthesis) return;
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "en-US";
      utter.rate = 0.95;
      utter.pitch = 1.05;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    };

    /* =======================
       HELPERS
    ======================= */
    const scrollToBottom = () => {
      setTimeout(
        () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        50
      );
    };

    const appendMessage = (sender, text) => {
      setMessages((prev) => [...prev, { sender, text }]);
      scrollToBottom();
    };

    /* =======================
       SEND MESSAGE
    ======================= */
    const handleSend = async (text, fromVoice = false) => {
      if (!text.trim()) return;

      appendMessage("user", text);
      setInput("");
      setLoading(true);

      try {
        const res = await axios.post(`${API}/api/ai/generate`, {
          question: text,
          username,
        });

        const aiText =
          res?.data?.response || "Sorry, I couldn’t understand that.";
        appendMessage("ai", aiText);
        if (fromVoice) speak(aiText);
      } catch (err) {
        console.error("❌ Axios error:", err);
        appendMessage("ai", "❌ Server error. Please check backend.");
      } finally {
        setLoading(false);
      }
    };

    /* =======================
       VOICE INPUT
    ======================= */
    const startVoiceInput = () => {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition)
        return alert("Speech recognition not supported.");

      if (recognitionRef.current) recognitionRef.current.stop();

      const rec = new SpeechRecognition();
      rec.lang = "en-US";
      rec.continuous = true;
      rec.interimResults = true;

      rec.onresult = (e) => {
        let transcript = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          transcript += e.results[i][0].transcript;
        }
        setInput(transcript.trim());

        clearTimeout(voiceTimeout.current);
        voiceTimeout.current = setTimeout(
          () => handleSend(transcript.trim(), true),
          1000
        );
      };

      rec.onerror = (e) =>
        console.warn("SpeechRecognition error:", e.error);
      rec.onend = () => (recognitionRef.current = null);

      recognitionRef.current = rec;
      rec.start();
    };

    /* =======================
       EXPOSE TO PARENT
    ======================= */
    useImperativeHandle(ref, () => ({
      askByVoice: (q) => handleSend(q, true),
    }));

    useEffect(() => {
      if (initialVoiceQuestion) handleSend(initialVoiceQuestion);
    }, [initialVoiceQuestion]);

    const resetChat = () => setMessages([]);

    /* =======================
       UI (OLD CSS RESTORED)
    ======================= */
    return (
      <div className="fixed inset-4 md:inset-10 bg-gradient-to-br from-[#1e1e2f] to-[#2c2c45] p-5 shadow-2xl z-50 border border-gray-700 rounded-3xl flex flex-col max-w-3xl mx-auto h-[85vh]">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-extrabold tracking-wide text-white">
            <span className="text-cyan-400">Ask </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-red-500 to-orange-400">
              CodeVerse
            </span>
          </h2>
          <div className="flex gap-3 items-center">
            <button
              onClick={resetChat}
              className="text-cyan-400 hover:text-cyan-200 text-2xl"
              title="Reset Chat"
            >
              <FiRefreshCw />
            </button>
            <button
              onClick={onClose}
              className="text-red-500 font-bold text-xl hover:text-red-400"
            >
              X
            </button>
          </div>
        </div>

        {/* CHAT */}
        <div className="flex-grow overflow-y-auto p-4 bg-gradient-to-b from-[#2c2c3e] to-[#1a1a28] rounded-2xl flex flex-col gap-3">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] p-3 rounded-xl text-lg shadow-md relative ${
                  msg.sender === "user"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-700 text-white"
                }`}
              >
                {msg.text}
                <div className="flex gap-2 absolute bottom-1 right-2">
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(msg.text)
                    }
                    className="text-xs text-gray-300 hover:text-white"
                  >
                    <FaCopy />
                  </button>
                  <button
                    onClick={() =>
                      setMessages((prev) =>
                        prev.filter((_, i) => i !== idx)
                      )
                    }
                    className="text-xs text-gray-300 hover:text-white"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <p className="text-gray-300 animate-pulse">
              AI is typing...
            </p>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* INPUT */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex flex-col gap-3 mt-3"
        >
          <textarea
            className="w-full h-28 p-4 rounded-xl bg-[#2b2b3d] text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-cyan-500 resize-none text-lg"
            placeholder="Ask anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(input);
              }
            }}
          />

          <div className="flex gap-3 flex-wrap">
            <button
              type="button"
              onClick={startVoiceInput}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 hover:scale-105 transition"
            >
              <FaMicrophone /> Speak
            </button>

            <button
              type="submit"
              className="flex-grow px-5 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:scale-105 transition"
            >
              Send
            </button>

            <button
              type="button"
              onClick={() =>
                speak(
                  messages.map((m) => m.text).join("\n") ||
                    "No messages yet"
                )
              }
              className="px-5 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-green-500 via-lime-500 to-emerald-600 hover:scale-105 transition"
            >
              🔊 Listen
            </button>
          </div>
        </form>
      </div>
    );
  }
);

export default ChatModal;
