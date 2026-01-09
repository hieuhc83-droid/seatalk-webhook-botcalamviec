const crypto = require("crypto");  
  
exports.handler = async (event) => {  
  
  console.log("=== CALLBACK TRIGGERED ===");  
  
  const signingSecret = process.env.SEATALK_SIGNING_SECRET || "";  
  
  const signature = event.headers["signature"] || "";  
  
  const rawBody = event.body || "";  
  
  console.log("RAW EVENT:", event);  
  console.log("BODY STRING:", rawBody);  
  
  // --- (1) VERIFY SIGNATURE (VERY IMPORTANT)  
  if (signingSecret) {  
    const expected = crypto  
      .createHash("sha256")  
      .update(rawBody + signingSecret)  
      .digest("hex");  
  
    console.log("EXPECTED SIG:", expected);  
    console.log("RECEIVED SIG:", signature);  
  
    if (signature !== expected) {  
      console.log("SIGNATURE MISMATCH!");  
      return {  
        statusCode: 403,  
        body: "Invalid signature"  
      };  
    }  
  }  
  
  // --- (2) PARSE BODY  
  let body = {};  
  try {  
    body = JSON.parse(rawBody);  
  } catch (err) {  
    console.log("ERROR PARSING:", err);  
    return {  
      statusCode: 400,  
      body: "Bad JSON"  
    };  
  }  
  
  console.log("PARSED BODY:", body);  
  
  // --- (3) HANDLE event_verification  
  if (body.event_type === "event_verification") {  
    console.log("=== VERIFICATION RECEIVED ===");  
  
    const challenge = body?.event?.seatalk_challenge;  
  
    return {  
      statusCode: 200,  
      headers: { "Content-Type": "application/json" },  
      body: JSON.stringify({ seatalk_challenge: challenge })  
    };  
  }  
  
  // --- (4) OTHER EVENTS  
  console.log("=== NORMAL EVENT RECEIVED ===");  
  
  return {  
    statusCode: 200,  
    headers: { "Content-Type": "application/json" },  
    body: JSON.stringify({ status: "ok" })  
  };  
};
