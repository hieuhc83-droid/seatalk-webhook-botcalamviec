exports.handler = async (event) => {  
  try {  
    const body = JSON.parse(event.body || "{}");  
  
    // --- 1) HANDLE SEATALK VERIFICATION ---  
    if (body.event_type === "event_verification") {  
      const token = body?.event?.seatalk_challenge || "";  
  
      return {  
        statusCode: 200,  
        headers: { "Content-Type": "application/json" },  
        body: JSON.stringify({ seatalk_challenge: token })  
      };  
    }  
  
    // --- 2) HANDLE NORMAL EVENTS ---  
    console.log("Received event:", body);  
  
    return {  
      statusCode: 200,  
      body: JSON.stringify({ status: "ok" })  
    };  
  
  } catch (err) {  
    console.log("ERROR:", err);  
    return {  
      statusCode: 500,  
      body: "Server error"  
    };  
  }  
};
