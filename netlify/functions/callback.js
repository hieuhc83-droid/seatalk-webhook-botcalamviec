exports.handler = async (event) => {  
  console.log("=== CALLBACK TRIGGERED ===");       // debug 1  
  console.log("RAW EVENT:", event);                // debug 2  
  console.log("BODY STRING:", event.body);         // debug 3  
  
  try {  
    const body = JSON.parse(event.body || "{}");  
    console.log("PARSED BODY:", body);             // debug 4  
  
    if (body.event_type === "event_verification") {  
      console.log("=== VERIFICATION RECEIVED ===");  // debug 5  
      const token = body?.event?.seatalk_challenge || "";  
      return {  
        statusCode: 200,  
        headers: { "Content-Type": "application/json" },  
        body: JSON.stringify({ seatalk_challenge: token })  
      };  
    }  
  
    console.log("=== NORMAL EVENT RECEIVED ===");   // debug 6  
    return {  
      statusCode: 200,  
      body: JSON.stringify({ status: "ok" })  
    };  
  
  } catch (err) {  
    console.log("=== ERROR PARSING ===", err);      // debug 7  
    return {  
      statusCode: 500,  
      body: "Server error"  
    };  
  }  
};
