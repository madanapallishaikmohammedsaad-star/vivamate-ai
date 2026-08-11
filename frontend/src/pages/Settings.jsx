import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Moon, Sun, Bell, BellOff, Key, Save, CheckCircle } from "lucide-react";

export default function Settings() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("vivamate_theme") === "dark");
  const [notifications, setNotifications] = useState(true);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("vivamate_api_key") || "");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    localStorage.setItem("vivamate_theme", darkMode ? "dark" : "light");
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  function saveSettings() {
    if (apiKey.trim()) {
      localStorage.setItem("vivamate_api_key", apiKey.trim());
    }
    localStorage.setItem("vivamate_notifications", notifications);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
        <SettingsIcon size={32} /> Settings
      </h1>
      <p className="text-gray-500 mb-8">Customize your VivaMate experience</p>

      <div className="max-w-2xl space-y-6">

        {/* Theme */}
        <div className="bg-white rounded-2xl shadow p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {darkMode ? <Moon className="text-indigo-600" size={24} /> : <Sun className="text-yellow-500" size={24} />}
            <div>
              <h3 className="font-bold text-lg">Theme</h3>
              <p className="text-gray-500 text-sm">{darkMode ? "Dark mode enabled" : "Light mode enabled"}</p>
            </div>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-14 h-7 rounded-full transition-colors relative ${darkMode ? "bg-blue-600" : "bg-gray-300"}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${darkMode ? "translate-x-8" : "translate-x-1"}`} />
          </button>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl shadow p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {notifications ? <Bell className="text-blue-600" size={24} /> : <BellOff className="text-gray-400" size={24} />}
            <div>
              <h3 className="font-bold text-lg">Notifications</h3>
              <p className="text-gray-500 text-sm">VTU updates and study reminders</p>
            </div>
          </div>
          <button
            onClick={() => setNotifications(!notifications)}
            className={`w-14 h-7 rounded-full transition-colors relative ${notifications ? "bg-blue-600" : "bg-gray-300"}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${notifications ? "translate-x-8" : "translate-x-1"}`} />
          </button>
        </div>

        {/* API Key */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center gap-4 mb-4">
            <Key className="text-purple-600" size={24} />
            <div>
              <h3 className="font-bold text-lg">OpenRouter API Key</h3>
              <p className="text-gray-500 text-sm">Required for AI features. Get a free key at openrouter.ai</p>
            </div>
          </div>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-or-v1-..."
            className="w-full border rounded-xl p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Save */}
        <button
          onClick={saveSettings}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition"
        >
          {saved ? <CheckCircle size={18} /> : <Save size={18} />}
          {saved ? "Saved!" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
