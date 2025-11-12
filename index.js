import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ServerApiVersion } from "mongodb";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: "http://localhost:5174", // frontend origin
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

// MongoDB setup
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const db = client.db("PlayPulseDB");
    const myColl = db.collection("EasyHomeDb");
    console.log("✅ MongoDB connected successfully");

    // -------------------- ROUTES --------------------

    // Root route
    app.get("/", (req, res) => {
      res.send("🚀 Welcome to EasyHome Backend API!");
    });

    // POST: Add service
    app.post("/services", async (req, res) => {
      try {
        const data = req.body;
        const result = await myColl.insertOne(data);
        res.status(201).json({
          success: true,
          message: "Service added successfully!",
          insertedId: result.insertedId,
        });
      } catch (error) {
        console.error("❌ Error adding service:", error);
        res.status(500).json({ message: "Error adding service" });
      }
    });

    // GET: Fetch all services (optional)
    app.get("/services", async (req, res) => {
      try {
        const services = await myColl.find().toArray();
        res.status(200).json(services);
      } catch (error) {
        console.error("❌ Error fetching services:", error);
        res.status(500).json({ message: "Error fetching services" });
      }
    });

  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
  }
}

run().catch(console.dir);

// -------------------- SERVER --------------------
app.listen(PORT, () => {
  console.log(`✅ Server running at: http://localhost:${PORT}`);
});