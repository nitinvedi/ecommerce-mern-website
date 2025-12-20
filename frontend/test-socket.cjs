
const { io } = require("socket.io-client");

// Config
const API_URL = "http://localhost:5000/api/v1";
const SOCKET_URL = "http://localhost:5000";

// Run Test
const runTest = async () => {
  try {
    console.log("Starting Chat Socket Verification (CJS)...");

    const userEmail = \`test_user_\${Date.now()}@example.com\`;
    const userPass = "password123";
    
    // Register
    console.log(`Registering Customer: ${userEmail}`);
    let userRes = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Test User", email: userEmail, password: userPass })
    });
    
    let userData = await userRes.json();
    if (!userData.token) {
        console.log("Login instead...");
        userRes = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: userEmail, password: userPass })
        });
        userData = await userRes.json();
    }
    
    const userToken = userData.token;
    const userId = userData.user._id; 
    console.log(`User ID: ${userId}`);

    // Connect Socket
    console.log("Connecting Socket...");
    const clientSocket = io(SOCKET_URL, {
        auth: { token: userToken }
    });

    await new Promise((resolve) => {
        clientSocket.on("connect", () => {
            console.log("✅ Socket Connected");
            resolve();
        });
        clientSocket.on("connect_error", (err) => {
             console.log("Socket Error:", err.message);
        });
    });

    // Listen
    const testMessage = `Hello Self ${Date.now()}`;
    let received = false;

    clientSocket.on("receive_message", (data) => {
        console.log("Received event:", data);
        if (data.message === testMessage) {
            console.log("✅ SUCCESS: Loopback message received instantly!");
            received = true;
            clientSocket.disconnect();
            process.exit(0);
        }
    });

    // Send
    console.log("Sending message...");
    await fetch(`${API_URL}/chat/send`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${userToken}`
        },
        body: JSON.stringify({
            receiver: userId, 
            message: testMessage
        })
    });
    
    // Wait
    setTimeout(() => {
        if (!received) {
            console.error("❌ TIMEOUT: Socket did not receive message.");
            process.exit(1);
        }
    }, 5000);

  } catch (err) {
    console.error("Script Error:", err);
    process.exit(1);
  }
};

runTest();
