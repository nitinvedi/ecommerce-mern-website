
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

async function checkRepairs() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI not found");
    return;
  }
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const dbName = process.env.DB_NAME || "repairEcommerce";
    console.log(`Using Database: ${dbName}`);
    const db = client.db(dbName); 
    // If not, might need db name. But typical Mongo URI includes it.

    const repairs = await db.collection("repairs").find({}).toArray();
    console.log(`Total Repairs: ${repairs.length}`);
    if (repairs.length > 0) {
        console.log("First repair sample:", JSON.stringify(repairs[0], null, 2));
    }
    
    // Check first 5 users
    const users = await db.collection("users").find({}).limit(5).toArray();
    console.log(`Total Users in DB: ${await db.collection("users").countDocuments()}`);
    
    // Seed a repair if none exist
    const repCount = await db.collection("repairs").countDocuments();
    console.log(`Total Repairs: ${repCount}`);

    // Find a technician
    const technician = await db.collection("users").findOne({ role: "technician" });
    if (!technician) {
        console.log("No technician found. Creating one for test...");
        // Skipping creation logic for brevity, just log warning
    } else {
        console.log(`Found Technician: ${technician.email} (${technician._id})`);
        
        // Find a pending repair
        const repair = await db.collection("repairs").findOne({ status: "Pending" });
        if (repair) {
            console.log(`Assigning Repair ${repair.trackingId} to technician...`);
            await db.collection("repairs").updateOne(
                { _id: repair._id },
                { $set: { technician: technician._id } }
            );
            console.log("Assigned!");
            
            // Verify query logic (simulation)
            const assigned = await db.collection("repairs").find({ technician: technician._id }).toArray();
            console.log(`Repairs found for technician via DB Query: ${assigned.length}`);
        }
    }

  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

checkRepairs();
