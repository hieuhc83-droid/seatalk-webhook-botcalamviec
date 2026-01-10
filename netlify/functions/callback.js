exports.handler = async (event) => {  
  console.log("=== SEATALK CALLBACK TRIGGERED ===");  
  console.log("RAW EVENT:", event);  
  
  const rawBody = event.body || "";  
  let body = {};  
  
  try {  
    body = JSON.parse(rawBody);  
  } catch (e) {  
    return {  
      statusCode: 200,  
      headers: {  
        "Content-Type": "application/json; charset=utf-8"  
      },  
      body: JSON.stringify({ status: "invalid-json" })  
    };  
  }  
  
  console.log("PARSED BODY:", body);  
  
  // BLOCK GET (browser)  
  if (event.httpMethod === "GET") {  
    return {  
      statusCode: 200,  
      headers: {  
        "Content-Type": "application/json; charset=utf-8"  
      },  
      body: JSON.stringify({ status: "ok" })  
    };  
  }  
  
  // HANDLE VERIFY — MUST NOT VERIFY SIGNATURE HERE  
  if (body.event_type === "event_verification") {  
    console.log("=== SEATALK VERIFY EVENT RECEIVED ===");  
  
    const challenge = body?.event?.seatalk_challenge || "";  
  
    return {  
      statusCode: 200,  
      headers: {  
        "Content-Type": "application/json; charset=utf-8"  
      },  
      body: JSON.stringify({ seatalk_challenge: challenge })  
    };  
  }  
  
  // OTHER EVENTS (with signature)  
  return {  
    statusCode: 200,  
    headers: {  
      "Content-Type": "application/json; charset=utf-8"  
    },  
    body: JSON.stringify({ status: "ok" })  
  };  
};
