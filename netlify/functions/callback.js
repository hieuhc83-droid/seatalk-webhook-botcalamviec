const crypto = require("crypto");  
  
exports.handler = async (event) => {  
  
  console.log("=== CALLBACK TRIGGERED ===");  
  
  // --- 0. BLOCK GET REQUESTS (VERY IMPORTANT)  
  if (event.httpMethod === "GET") {  
    return {  
      statusCode: 200,  
      headers: {  
        "Content-Type": "application/json; charset=utf-8",  
        "X-Content-Type-Options": "nosniff"  
      },  
      body: JSON.stringify({ status: "ok" })  
    };  
  }  
  
  console.log("RAW EVENT:", event);  
  console.log("BODY STRING:", event.body);  
  
  const signingSecret = process.env.SEATALK_SIGNING_SECRET || "";  
  const signature = event.headers["signature"] || "";  
  const rawBody = event.body || "";  
  
  // --- 1. Verify signature ---  
  if (signingSecret) {  
    const expected = crypto  
      .createHash("sha256")  
      .update(rawBody + signingSecret)  
      .digest("hex");  
  
    console.log("EXPECTED SIG:", expected);  
    console.log("RECEIVED SIG:", signature);  
  
    if (signature !== expected) {  
      console.log("SIGNATURE MISMATCH");  
      return {  
        statusCode: 403,  
        headers: { "Content-Type": "text/plain" },  
        body: "Invalid signature"  
      };  
    }  
  }  
  
  // --- 2. Parse JSON body ---  
  let body = {};  
  try {  
    body = JSON.parse(rawBody);  
  } catch (err) {  
    return {  
      statusCode: 400,  
      headers: { "Content-Type": "text/plain" },  
      body: "Bad JSON"  
    };  
  }  
  
  console.log("PARSED BODY:", body);  
  
  // --- 3. Handle verification ---  
  if (body.event_type === "event_verification") {  
    console.log("=== VERIFICATION RECEIVED ===");  
  
    const challenge = body?.event?.seatalk_challenge || "";  
  
    return {  
      statusCode: 200,  
      headers: {  
        "Content-Type": "application/json; charset=utf-8",  
        "X-Content-Type-Options": "nosniff"  
      },  
      body: JSON.stringify({ seatalk_challenge: challenge })  
    };  
  }  
  
  // --- 4. Other events ---  
  return {  
    statusCode: 200,  
    headers: { "Content-Type": "application/json; charset=utf-8" },  
    body: JSON.stringify({ status: "ok" })  
  };  
};
