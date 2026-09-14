import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Moon, Sun, Bell, BellOff, Save, CheckCircle, ShieldCheck } from "lucide-react";

export default function Settings() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("vivamate_theme") === "dark");
  const [notifications, setNotifications] = useState(() => localStorage.getItem("vivamate_notifications") !== "false");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    localStorage.setItem("vivamate_theme", darkMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  function saveSettings() {
    localStorage.setItem("vivamate_notifications", String(notifications));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
        <SettingsIcon size={32} /> Settings
      </h1>
      <p className="text-gray-500 mb-8">Customize your VivaMate experience</p>

      <div className="max-w-2xl space-y-6">
        <div className="bg-white rounded-2xl shadow p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {darkMode ? <Moon className="text-indigo-600" size={24} /> : <Sun className="text-yellow-500" size={24} />}
            <div>
              <h3 className="font-bold text-lg">Theme</h3>
              <p className="text-gray-500 text-sm">{darkMode ? "Dark mode enabled" : "Light mode enabled"}</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Toggle theme"
            aria-pressed={darkMode}
            onClick={() => setDarkMode((value) => !value)}
            className={`w-14 h-7 rounded-full transition-colors relative ${darkMode ? "bg-blue-600" : "bg-gray-300"}`}
          >
            <span className={`block w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${darkMode ? "translate-x-8" : "translate-x-1"}`} />
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {notifications ? <Bell className="text-blue-600" size={24} /> : <BellOff className="text-gray-400" size={24} />}
            <div>
              <h3 className="font-bold text-lg">Notifications</h3>
              <p className="text-gray-500 text-sm">VTU updates and study reminders preference</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Toggle notifications preference"
            aria-pressed={notifications}
            onClick={() => setNotifications((value) => !value)}
            className={`w-14 h-7 rounded-full transition-colors relative ${notifications ? "bg-blue-600" : "bg-gray-300"}`}
          >
            <span className={`block w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${notifications ? "translate-x-8" : "translate-x-1"}`} />
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex gap-4">
          <ShieldCheck className="text-blue-600 shrink-0" size={26} />
          <div>
            <h3 className="font-bold text-lg text-blue-900">AI key security</h3>
            <p className="text-blue-800 text-sm mt-1">
              Your OpenRouter API key must be configured on the backend server. VivaMate no longer stores or accepts API keys in the browser.
            </p>
          </div>
        </div>

        <button
          type="button"
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
