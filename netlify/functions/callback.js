const crypto = require("crypto");  
  
exports.handler = async (event, context) => {  
  try {  
    const SIGNING_SECRET = process.env.SEATALK_SIGNING_SECRET || "";  
    const signature = event.headers["signature"] || "";  
    const bodyString = event.body || "";  
    const body = JSON.parse(bodyString);  
  
    // (1) Xử lý xác minh URL - KHÔNG CẦN SIGNATURE  
    if (body.event_type === "event_verification") {  
      const challenge = body.event.seatalk_challenge;  
      return {  
        statusCode: 200,  
        headers: { "Content-Type": "application/json" },  
        body: JSON.stringify({ seatalk_challenge: challenge }),  
      };  
    }  
  
    // (2) Nếu muốn verify signature của event thật:  
    if (SIGNING_SECRET) {  
      const expected = crypto  
        .createHash("sha256")  
        .update(bodyString + SIGNING_SECRET)  
        .digest("hex");  
  
      if (expected !== signature) {  
        console.log("Signature mismatch");  
        return { statusCode: 403, body: "Invalid signature" };  
      }  
    }  
  
    console.log("Received event:", body);  
  
    return { statusCode: 200, body: "" };  
  } catch (err) {  
    console.error(err);  
    return { statusCode: 500, body: "Server Error" };  
  }  
};
