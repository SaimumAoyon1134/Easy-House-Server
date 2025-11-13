import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());


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
    const myCollBookings =db.collection("Bookings")
    console.log("MongoDB connected successfully");

 


    app.get("/", (req, res) => {
      res.send("🚀 Welcome to EasyHome Backend API!");
    });


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
        console.error("Error adding service:", error);
        res.status(500).json({ message: "Error adding service" });
      }
    });


    app.get("/services", async (req, res) => {
      try {
        const services = await myColl.find().toArray();
        res.status(200).json(services);
      } catch (error) {
        console.error(" Error fetching services:", error);
        res.status(500).json({ message: "Error fetching services" });
      }
    });


app.patch("/services/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const result = await myColl.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedData }
    );

    if (result.matchedCount === 0)
      return res.status(404).json({ message: "Service not found" });

    res.json({ message: "Service updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update service" });
  }
});


app.delete("/services/:id", async (req, res) => {
    console.log("first")
  try {
    const { id } = req.params;
    const result = await myColl.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) return res.status(404).json({ message: "Service not found" });

    res.json({ message: "Service deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete service" });
  }
});
app.post("/bookings", async (req, res) => {
  try {
    const booking = req.body;
    const result = await myCollBookings.insertOne(booking);
    res.status(201).json({ success: true, insertedId: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create booking" });
  }
});

app.get("/bookings", async (req, res) => {
  try {
    const userEmail = req.query.userEmail;
    if (!userEmail) return res.status(400).json({ message: "User email is required" });

    const userBookings = await myCollBookings.find({ userEmail }).toArray();
    res.status(200).json(userBookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
});

app.delete("/bookings/:id", async (req, res) => {
    
  const { id } = req.params;
  await myCollBookings.deleteOne({ _id: new ObjectId(id) });
  res.json({ success: true });
});


  } catch (error) {
    console.error(" MongoDB connection failed:", error);
  }
}


run().catch(console.dir);


app.listen(PORT, () => {
  console.log(`✅ Server running at: http://localhost:${PORT}`);
});