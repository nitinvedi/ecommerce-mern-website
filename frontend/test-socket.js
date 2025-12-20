
import { io } from "socket.io-client";
// Node 18+ has native fetch

// Config
const API_URL = "http://localhost:5000/api/v1";
const SOCKET_URL = "http://localhost:5000";

// Test Creds (Will attempt to create temp users or use known ones if this fails, but for now assuming these distinct users for testing)
// Actually better to just register a fresh user to be sure.
const runTest = async () => {
  try {
    console.log("Starting Chat Socket Verification...");

    // 1. Create/Login User A (Customer)
    const userEmail = \`test_user_\${Date.now()}@example.com\`;
    const userPass = "password123";
    console.log(`Registering Customer: ${userEmail}`);
    
    let userRes = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Test User", email: userEmail, password: userPass })
    });
    
    let userData = await userRes.json();
    if (!userData.token) {
         // Login if exists
         console.log("User might exist, logging in...");
         userRes = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: userEmail, password: userPass })
        });
        userData = await userRes.json();
    }
    
    const userToken = userData.token;
    const userId = userData.user._id; 
    console.log(`Customer Logged In: ${userId}`);

    // 2. Login Admin (Using a known admin email or creating one? 
    // If we can't easily creating admin (requires secret?), we will try to use the user to send messaging to ITSELF or find an existing admin.
    // Actually, ChatController logic allows User->Admin or Admin->User.
    // If I send from User -> Admin, I can't verify reception unless I can login as Admin.
    // Let's try to verify User -> User (if chat supports it) or just User -> Admin and listen for 'new_customer_message' on the User socket? 
    // Wait, 'new_customer_message' is sent to Admin.
    // The user socket receives 'receive_message' (ack).
    
    // Let's try sending a message to Self for simplicity? 
    // Backend: io.to(`user:${receiver}`).emit...
    // If receiver = sender, I should get it.
    console.log("Testing Loopback Message (User -> User)...");
    
    const clientSocket = io(SOCKET_URL, {
        auth: { token: userToken }
    });

    await new Promise((resolve) => {
        clientSocket.on("connect", () => {
            console.log("Socket Connected");
            resolve();
        });
    });

    const testMessage = `Hello Self ${Date.now()}`;
    let received = false;

    clientSocket.on("receive_message", (data) => {
        if (data.message === testMessage) {
            console.log("✅ SUCCESS: Received message via socket!");
            console.log("Data:", data);
            received = true;
            clientSocket.disconnect();
            process.exit(0);
        }
    });

    // Send via API
    console.log(`Sending message via API to self (${userId})...`);
    await fetch(`${API_URL}/chat/send`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${userToken}`
        },
        body: JSON.stringify({
            receiver: userId, // Send to self
            message: testMessage
        })
    });
    
    console.log("Message sent via API. Waiting for socket...");

    // Timeout
    setTimeout(() => {
        if (!received) {
            console.error("❌ TIMEOUT: Did not receive socket event in 5 seconds.");
            process.exit(1);
        }
    }, 5000);

  } catch (err) {
    console.error("Test Failed:", err);
    process.exit(1);
  }
};

runTest();
