import Link from "next/link";
import LoginButton from "@/components/LoginButton";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <main className="flex-grow flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Face Recognition</span>
            <span className="block text-blue-600">Attendance System</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Streamline attendance tracking with advanced face recognition
            technology.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <LoginButton />
          </div>
        </div>
      </main>
    </div>
  );
}
