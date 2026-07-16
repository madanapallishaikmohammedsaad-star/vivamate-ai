import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="flex-1 p-8">
          <h1 className="text-4xl font-bold">
            VivaMate AI Dashboard
          </h1>

          <p className="text-gray-600 mt-2">
            We are building the future of engineering education 🚀
          </p>
        </main>
      </div>
    </div>
  );
}
