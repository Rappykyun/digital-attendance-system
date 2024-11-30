import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function MarkAttendance() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  if (session?.user?.email === process.env.ADMIN_EMAIL) {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-green-800 mb-6">Mark Your Attendance</h1>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-green-700 mb-2">Session Details</h2>
            <p className="text-gray-600">Morning Session - {new Date().toLocaleDateString()}</p>
          </div>

          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Section
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                value={session?.user?.section || ""}
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comments (Optional)
              </label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                rows="3"
                placeholder="Any additional comments..."
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 transition-colors"
            >
              Confirm Attendance
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 