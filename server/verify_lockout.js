// const http = require("http");

// const PORTS = [8080, 5000];
// const BASE_PATH = "/api/auth";

// // const TEST_USER = {
// //   name: "Lockout Test",
// //   email: `lockout_${Date.now()}@test.com`,
// //   password: "password123",
// //   role: "Student",
// // };

// // const WRONG_PASSWORD = "wrongpassword";

// function makeRequest(port, path, method, body) {
//   return new Promise((resolve, reject) => {
//     const options = {
//       hostname: "localhost",
//       port: port,
//       path: `${BASE_PATH}${path}`,
//       method: method,
//       headers: {
//         "Content-Type": "application/json",
//       },
//     };

//     const req = http.request(options, (res) => {
//       let data = "";
//       res.on("data", (chunk) => {
//         data += chunk;
//       });
//       res.on("end", () => {
//         try {
//           resolve({
//             status: res.statusCode,
//             body: data ? JSON.parse(data) : {},
//           });
//         } catch (e) {
//           resolve({ status: res.statusCode, body: data });
//         }
//       });
//     });

//     req.on("error", (e) => {
//       reject(e);
//     });

//     if (body) {
//       req.write(JSON.stringify(body));
//     }
//     req.end();
//   });
// }

// function wait(ms) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

// async function runTest() {
//   console.log("--- Account Lockout Verification Script ---");

//   // Find active port
//   let activePort = null;
//   for (const port of PORTS) {
//     try {
//       await makeRequest(port, "/login", "POST", {}); // Just to check connection
//       activePort = port;
//       console.log(`Connected to server on port ${port}`);
//       break;
//     } catch (e) {
//       // ignore
//     }
//   }

//   if (!activePort) {
//     console.error("Error: Could not connect to server on port 8080 or 5000.");
//     console.error(
//       "Please make sure the server is running (npm start or npm run dev).",
//     );
//     return;
//   }

//   try {
//     // 1. Register
//     console.log(`\n[1] Registering user: ${TEST_USER.email}`);
//     const regRes = await makeRequest(
//       activePort,
//       "/register",
//       "POST",
//       TEST_USER,
//     );
//     if (regRes.status !== 201) {
//       console.error("Registration failed:", regRes.status, regRes.body);
//       console.log("Is the database connected?");
//       return;
//     }
//     console.log("User registered successfully.");

//     // 2. Attempt login with wrong password 3 times
//     for (let i = 1; i <= 3; i++) {
//       await wait(100);
//       console.log(`\n[2.${i}] Attempting login with wrong password...`);
//       const res = await makeRequest(activePort, "/login", "POST", {
//         email: TEST_USER.email,
//         password: WRONG_PASSWORD,
//       });
//       console.log(
//         `Response: Status ${res.status}, Message: "${res.body.message}"`,
//       );

//       if (res.status === 403) {
//         console.log("--> Got 403 early. Account might be locked already.");
//       }
//     }

//     // 3. Attempt login 4th time - SHOULD BE LOCKED
//     console.log(
//       `\n[3] Attempting login with wrong password (Attempt 4) - EXPECTING LOCKOUT...`,
//     );
//     const lockRes = await makeRequest(activePort, "/login", "POST", {
//       email: TEST_USER.email,
//       password: WRONG_PASSWORD,
//     });
//     console.log(
//       `Response: Status ${lockRes.status}, Message: "${lockRes.body.message}"`,
//     );

//     // 4. Attempt login with CORRECT password - SHOULD BE LOCKED
//     console.log(
//       `\n[4] Attempting login with CORRECT password - EXPECTING LOCKOUT...`,
//     );
//     const correctRes = await makeRequest(activePort, "/login", "POST", {
//       email: TEST_USER.email,
//       password: TEST_USER.password,
//     });
//     console.log(
//       `Response: Status ${correctRes.status}, Message: "${correctRes.body.message}"`,
//     );

//     if (lockRes.status === 403 || correctRes.status === 403) {
//       console.log("\nSUCCESS: Lockout triggered successfully.");
//     } else {
//       console.log("\nFAILURE: Lockout did not trigger.");
//       console.log(
//         "Please restart your server to apply the User schema changes.",
//       );
//     }
//   } catch (err) {
//     console.error("Test failed with error:", err.message);
//   }
// }

// runTest();
