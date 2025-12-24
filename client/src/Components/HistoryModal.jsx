



import React, { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const HistoryModal = ({ username, onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  // =======================
  // FETCH HISTORY
  // =======================
  const fetchHistory = async () => {
    if (!username) return;

    setLoading(true);
    try {
      const res = await axios.get(
        `${API}/api/history/${encodeURIComponent(username)}`
      );
      setHistory(res.data);
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [username]);

  // =======================
  // CLEAR HISTORY
  // =======================
  const clearHistory = async () => {
    if (!window.confirm("Are you sure you want to clear all history?")) return;

    setClearing(true);
    try {
      await axios.delete(
        `${API}/api/history/${encodeURIComponent(username)}`
      );
      setHistory([]);
    } catch (err) {
      console.error("Error clearing history:", err);
      alert("Failed to clear history.");
    } finally {
      setClearing(false);
    }
  };

  // =======================
  // UI (OLD CSS)
  // =======================
  return (
    <div className="fixed top-10 right-10 w-96 md:w-1/2 h-[80vh] bg-[#141319] p-6 shadow-2xl z-50 border border-gray-700 rounded-2xl flex flex-col overflow-hidden">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Chat History</h2>
        <div className="flex gap-2">
          <button
            onClick={clearHistory}
            disabled={clearing}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white px-3 py-1 rounded-lg text-sm"
          >
            {clearing ? "Clearing..." : "Clear History"}
          </button>
          <button
            onClick={onClose}
            className="text-red-500 font-bold text-lg hover:text-red-400"
          >
            X
          </button>
        </div>
      </div>

      {/* HISTORY LIST */}
      <div className="flex-grow overflow-y-auto bg-gray-900 p-4 rounded-lg text-white space-y-4">
        {loading ? (
          <p className="text-gray-400">Loading history...</p>
        ) : history.length === 0 ? (
          <p className="text-gray-400">No chat history yet.</p>
        ) : (
          history.map((item) => (
            <div
              key={item._id}
              className="border-b border-gray-700 pb-3"
            >
              <p className="font-semibold text-blue-400 mb-1">
                Q: {item.question}
              </p>
              <p className="text-gray-300">
                A: {item.response}
              </p>
              {item.createdAt && (
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryModal;
