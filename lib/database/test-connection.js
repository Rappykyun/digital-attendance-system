import clientPromise from "./connection";

async function testConnection() {
  try {
    const client = await clientPromise;
    const db = client.db();

    // Test the connection
    await db.command({ ping: 1 });
    console.log("✅ Connected successfully to MongoDB");

    return true;
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    return false;
  }
}

export default testConnection;
