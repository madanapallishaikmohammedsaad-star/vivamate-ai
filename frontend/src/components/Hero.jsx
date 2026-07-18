import { Sparkles, BookOpen } from "lucide-react";
import hero from "../assets/hero.png";

export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-10 text-white relative overflow-hidden">
      <div className="max-w-2xl">
        <span className="bg-white/20 px-4 py-2 rounded-full text-sm">
          🚀 VivaMate AI v1.0
        </span>

        <h1 className="text-5xl font-bold mt-6 leading-tight">
          Study Smarter <br />
          with Artificial Intelligence
        </h1>

        <p className="mt-6 text-lg text-blue-100">
          Generate answers, practice viva, browse VTU syllabus,
          solve previous papers and prepare for exams—all in one
          intelligent platform.
        </p>

        <div className="flex gap-5 mt-8">
          <button className="flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:scale-105 transition">
            <Sparkles size={20} />
            Generate Answer
          </button>

          <button className="flex items-center gap-2 border border-white px-6 py-3 rounded-xl hover:bg-white hover:text-blue-600 transition">
            <BookOpen size={20} />
            Explore Subjects
          </button>
        </div>
      </div>

      <img
        src={hero}
        alt="Hero"
        className="absolute right-10 bottom-0 h-[320px] hidden lg:block"
      />
    </section>
  );
}
