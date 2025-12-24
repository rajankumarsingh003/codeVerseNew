



import React, { useState } from "react";
import Select from "react-select";
import { BsStars } from "react-icons/bs";
import { HiOutlineCode } from "react-icons/hi";
import Editor from "@monaco-editor/react";
import { IoCloseSharp, IoCopy } from "react-icons/io5";
import { PiExportBold } from "react-icons/pi";
import { ImNewTab } from "react-icons/im";
import { FiRefreshCcw } from "react-icons/fi";
import { FaImage } from "react-icons/fa6";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { MdLightMode } from "react-icons/md";

const Home = () => {
  // 🚀 Framework options (industry-level)
  const frameworkOptions = [
    { value: "html-css", label: "🌐 HTML + CSS" },
    { value: "html-tailwind", label: "🎨 HTML + Tailwind CSS" },
    { value: "html-bootstrap", label: "🧱 HTML + Bootstrap" },
    { value: "html-css-js", label: "⚡ HTML + CSS + JS" },
    { value: "react", label: "⚛️ React (with Tailwind)" },
    { value: "nextjs", label: "🚀 Next.js (App Router)" },
  ];

  const [outputScreen, setOutputScreen] = useState(false);
  const [tab, setTab] = useState(1);
  const [prompt, setPrompt] = useState("");
  const [frameWork, setFrameWork] = useState(frameworkOptions[0]);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [isNewTabOpen, setIsNewTabOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [useImage, setUseImage] = useState(false);

  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY);

  function extractCode(response) {
    const match = response.match(/```(?:\w+)?\n?([\s\S]*?)```/);
    return match ? match[1].trim() : response.trim();
  }

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result;
      setImagePreview(dataUrl);
      const base64 = dataUrl.split(",")[1];
      setImageBase64(base64);
      setUseImage(true);
    };
    reader.readAsDataURL(file);
  };

  async function getResponse() {
    if (!prompt.trim() && !useImage)
      return toast.error("Please describe your component or upload an image first");

    try {
      setLoading(true);
      // const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 

      if (useImage && imageBase64) {
        const contents = [
          {
            role: "user",
            parts: [
              {
                text: `Generate a responsive ${frameWork.label} UI that matches the image design.
If text prompt is given, use it for additional context: "${prompt}".
Return ONLY the full working code inside markdown fences.`,
              },
              {
                inlineData: {
                  mimeType: "image/png",
                  data: imageBase64,
                },
              },
            ],
          },
        ];

        const result = await model.generateContent({ contents });
        const response = await result.response;
        const text = response.text();
        setCode(extractCode(text));
      } else {
        const promptText = `
You are a senior frontend engineer.
Generate a production-ready ${frameWork.label} component for:
"${prompt}"

Guidelines:
- Use latest ${frameWork.label} best practices.
- Must be responsive, clean, and modern.
- Include subtle animations and hover effects.
- Code should be organized, readable, and ready for production.
- Return ONLY the code inside markdown code block.
        `;
        const result = await model.generateContent(promptText);
        const response = await result.response;
        const text = response.text();
        setCode(extractCode(text));
      }

      setOutputScreen(true);
      toast.success("✅ Code generated successfully!");
    } catch (err) {
      console.error(err);
      if (err?.message?.includes("API key not valid")) {
        toast.error("API key invalid — check VITE_GOOGLE_API_KEY in .env");
      } else {
        toast.error("Error while generating code");
      }
    } finally {
      setLoading(false);
    }
  }

  const copyCode = async () => {
    if (!code.trim()) return toast.error("No code to copy");
    await navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard");
  };

  const downloadFile = () => {
    if (!code.trim()) return toast.error("No code to download");
    const blob = new Blob([code], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Generated-Component.html";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("File downloaded");
  };

  const clearImage = () => {
    setImagePreview(null);
    setImageBase64(null);
    setUseImage(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-6 lg:px-16 bg-[#09090B] text-white">
      {/* LEFT PANEL */}
      <div className="w-full py-6 rounded-xl mt-5 p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-[#141319]">
        <h3 className="text-[25px] font-semibold sp-text">
          AI Component Generator
        </h3>
        <p className="mt-2 text-[16px] text-gray-300">
          Describe your component or upload a reference image.
        </p>

        <p className="text-[15px] font-[700] mt-4">Framework</p>
        <Select
          className="mt-2"
          options={frameworkOptions}
          value={frameWork}
          onChange={(selected) => setFrameWork(selected)}
          styles={{
            control: (base) => ({
              ...base,
              backgroundColor: "#111",
              borderColor: "#333",
              color: "#fff",
              borderRadius: "12px",
              boxShadow: "0 0 8px rgba(139, 92, 246, 0.2)",
              padding: "4px 6px",
            }),
            menu: (base) => ({
              ...base,
              backgroundColor: "#111",
              color: "#fff",
              borderRadius: "10px",
              boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
            }),
            option: (base, state) => ({
              ...base,
              backgroundColor: state.isFocused ? "#312e81" : "#111",
              color: state.isFocused ? "#4f46e5" : "#fff",
              borderRadius: "8px",
              padding: "10px",
              transition: "all 0.2s",
            }),
            singleValue: (base) => ({
              ...base,
              color: "#fff",
              fontWeight: 600,
            }),
          }}
        />

        <p className="text-[15px] font-[700] mt-5">Describe your component</p>
        <textarea
          onChange={(e) => setPrompt(e.target.value)}
          value={prompt}
          className="w-full min-h-[160px] rounded-xl mt-3 p-3 outline-none resize-none bg-[#09090B] text-white placeholder-gray-400"
          placeholder="Describe your component in detail (optional if you upload an image)..."
        ></textarea>

        {/* Image Upload */}
        <div className="flex items-center gap-3 mt-4">
          <label className="cursor-pointer w-12 h-12 flex items-center justify-center bg-purple-600 rounded-xl hover:bg-purple-700 transition-all duration-300">
            <FaImage className="text-white text-xl" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>

          {imagePreview ? (
            <div className="flex items-center gap-2">
              <img
                src={imagePreview}
                alt="preview"
                className="w-14 h-14 object-cover rounded-lg border border-gray-700"
              />
              <button
                onClick={clearImage}
                className="px-3 py-2 bg-zinc-800 rounded-lg text-sm hover:bg-zinc-700"
              >
                Remove
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              Upload an image — AI will generate matching code.
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mt-5">
          <p className="text-sm text-gray-400">Click generate to get your code</p>
          <button
            onClick={getResponse}
            disabled={loading}
            className="flex items-center p-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-700 px-5 gap-2 transition-transform duration-300 hover:scale-105 disabled:opacity-60"
          >
            {loading ? <ClipLoader color="white" size={18} /> : <BsStars />}
            Generate
          </button>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="relative mt-2 w-full h-[80vh] rounded-xl overflow-hidden bg-[#141319] text-white">
        {!outputScreen ? (
          <div className="w-full h-full flex items-center flex-col justify-center">
            <div className="p-5 w-[70px] h-[70px] rounded-full bg-gradient-to-r from-purple-500 to-purple-700 flex items-center justify-center">
              <HiOutlineCode />
            </div>
            <p className="text-[16px] mt-3 text-gray-400">
              Your component & code will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="bg-[#17171C] w-full h-[50px] flex items-center gap-3 px-3">
              <button
                onClick={() => setTab(1)}
                className={`w-1/2 py-2 rounded-lg ${
                  tab === 1
                    ? "bg-purple-600 text-white shadow-lg"
                    : "bg-zinc-800 text-gray-300 hover:bg-zinc-700"
                }`}
              >
                Code
              </button>
              <button
                onClick={() => setTab(2)}
                className={`w-1/2 py-2 rounded-lg ${
                  tab === 2
                    ? "bg-purple-600 text-white shadow-lg"
                    : "bg-zinc-800 text-gray-300 hover:bg-zinc-700"
                }`}
              >
                Preview
              </button>
            </div>

            {/* Toolbar */}
            <div className="bg-[#17171C] w-full h-[50px] flex items-center justify-between px-4">
              <p className="font-bold text-gray-200">Code Editor</p>
              <div className="flex items-center gap-2">
                {tab === 1 ? (
                  <>
                    <button
                      onClick={copyCode}
                      className="w-10 h-10 rounded-xl border border-zinc-800 flex items-center justify-center hover:bg-[#333]"
                    >
                      <IoCopy />
                    </button>
                    <button
                      onClick={downloadFile}
                      className="w-10 h-10 rounded-xl border border-zinc-800 flex items-center justify-center hover:bg-[#333]"
                    >
                      <PiExportBold />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsNewTabOpen(true)}
                      className="w-10 h-10 rounded-xl border border-zinc-800 flex items-center justify-center hover:bg-[#333]"
                    >
                      <ImNewTab />
                    </button>
                    <button
                      onClick={() => setRefreshKey((p) => p + 1)}
                      className="w-10 h-10 rounded-xl border border-zinc-800 flex items-center justify-center hover:bg-[#333]"
                    >
                      <FiRefreshCcw />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Editor / Preview */}
            <div className="h-full">
              {tab === 1 ? (
                <Editor value={code} height="100%" theme="vs-dark" language="html" />
              ) : (
                <iframe key={refreshKey} srcDoc={code} className="w-full h-full bg-white"></iframe>
              )}
            </div>
          </>
        )}
      </div>

      {/* Fullscreen Preview */}
      {isNewTabOpen && (
        <div className="absolute inset-0 w-screen h-screen overflow-auto bg-white">
          <div className="text-black w-full h-[60px] flex items-center justify-between px-5 bg-gray-100">
            <p className="font-bold">Preview</p>
            <button
              onClick={() => setIsNewTabOpen(false)}
              className="w-10 h-10 rounded-xl border border-zinc-300 flex items-center justify-center hover:bg-gray-200"
            >
              <IoCloseSharp />
            </button>
          </div>
          <iframe srcDoc={code} className="w-full h-[calc(100vh-60px)]"></iframe>
        </div>
      )}
    </div>
  );
};

export default Home;
