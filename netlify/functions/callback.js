const crypto = require("crypto");  
  
exports.handler = async (event) => {  
  console.log("=== CALLBACK TRIGGERED ===");  
  console.log("RAW EVENT:", event);  
  console.log("BODY STRING:", event.body);  
  
  const signingSecret = process.env.SEATALK_SIGNING_SECRET || "";  
  const signature = event.headers["signature"] || "";  
  const rawBody = event.body || "";  
  
  // Verify signature if signing secret exists  
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
        headers: { "Content-Type": "text/plain" },  
        body: "Invalid signature"  
      };  
    }  
  }  
  
  let body = {};  
  try {  
    body = JSON.parse(rawBody);  
  } catch (err) {  
    console.log("JSON PARSE ERROR:", err);  
    return {  
      statusCode: 400,  
      headers: { "Content-Type": "text/plain" },  
      body: "Bad JSON"  
    };  
  }  
  
  console.log("PARSED BODY:", body);  
  
  // Handle verification  
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
  
  // Normal event  
  return {  
    statusCode: 200,  
    headers: { "Content-Type": "application/json; charset=utf-8" },  
    body: JSON.stringify({ status: "ok" })  
  };  
};
