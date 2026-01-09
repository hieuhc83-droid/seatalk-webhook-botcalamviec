// Netlify Function - NO NEED node-fetch, use global fetch  
const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;  
const BOT_TOKEN = process.env.SEATALK_BOT_TOKEN;  
  
// =====================================================  
// MAIN HANDLER  
// =====================================================  
exports.handler = async (event) => {  
  try {  
    const bodyString = event.body || "";  
    const body = JSON.parse(bodyString);  
    const type = body.event_type;  
  
    // (1) VERIFY CALLBACK URL  
    if (type === "event_verification") {  
      return respond({  
        seatalk_challenge: body.event.seatalk_challenge  
      });  
    }  
  
    // (2) USER MESSAGE  
    if (type === "message_from_bot_subscriber") {  
      return await handleUserMessage(body);  
    }  
  
    // (3) USER CLICK BUTTON  
    if (type === "interactive_message_click") {  
      return await handleButton(body);  
    }  
  
    return respond("OK");  
  
  } catch (err) {  
    console.log("ERROR:", err);  
    return respond("SERVER_ERROR");  
  }  
};  
  
// =====================================================  
// HANDLE USER MESSAGE  
// =====================================================  
async function handleUserMessage(body) {  
  const chatId = body.event.chat_id;  
  const rawText = body.event.text || "";   // SAFE  
  const text = rawText.trim().toLowerCase(); // SAFE  
  
  // CASE 1 — USER NHẬP MÃ NV (NV001…)  
  if (/^nv\d+/i.test(rawText.trim())) {  
    await saveChatId(rawText.trim(), chatId);  
    return sendMessage(chatId, "Đã ghi nhận mã nhân viên của bạn ✔");  
  }  
  
  // CASE 2 — MENU  
  if (text === "menu") {  
    return sendMainMenu(chatId);  
  }  
  
  return sendMessage(chatId, "Nhấn 'menu' để bắt đầu.");  
}  
  
// =====================================================  
// HANDLE BUTTON CLICK  
// =====================================================  
async function handleButton(body) {  
  const chatId = body.event.chat_id;  
  const action = body.event.action_id;  
  const value = body.event.value;  
  
  if (action === "BTN_REGISTER_OFF") {  
    return showCalendar(chatId);  
  }  
  
  if (action === "DAY_SELECTED") {  
    const day = JSON.parse(value);  
    return handleDay(chatId, day);  
  }  
  
  if (action === "CONFIRM_OFF") {  
    return requestOff(chatId, value);  
  }  
  
  return sendMessage(chatId, "Tính năng đang cập nhật...");  
}  
  
// =====================================================  
// MAIN MENU  
// =====================================================  
async function sendMainMenu(chatId) {  
  return sendInteractive(chatId, {  
    text: "📌 MENU CHÍNH",  
    buttons: [  
      {  
        text: "📅 Đăng ký OFF",  
        action_id: "BTN_REGISTER_OFF",  
        value: ""  
      }  
    ]  
  });  
}  
  
// =====================================================  
// DEMO CALENDAR  
// =====================================================  
async function showCalendar(chatId) {  
  const days = [  
    { date: "2024-03-11", label: "11🟩", type: "green" },  
    { date: "2024-03-12", label: "12🟨", type: "yellow" },  
    { date: "2024-03-13", label: "13🟥⚠", type: "red" }  
  ];  
  
  const buttons = days.map(d => ({  
    text: d.label,  
    action_id: "DAY_SELECTED",  
    value: JSON.stringify(d)  
  }));  
  
  return sendInteractive(chatId, {  
    text: "📅 Chọn ngày OFF:",  
    buttons  
  });  
}  
  
// =====================================================  
// HANDLE DAY SELECTED  
// =====================================================  
async function handleDay(chatId, day) {  
  if (day.type === "green") {  
    return sendInteractive(chatId, {  
      text: `🟩 Bạn muốn OFF ngày ${day.date}?`,  
      buttons: [  
        { text: "✔ Xác nhận", action_id: "CONFIRM_OFF", value: day.date },  
        { text: "↩ Ngày khác", action_id: "BTN_REGISTER_OFF", value: "" }  
      ]  
    });  
  }  
  
  if (day.type === "yellow") {  
    return sendInteractive(chatId, {  
      text: `🟨 Ngày ${day.date} đã có người OFF.`,  
      buttons: [  
        { text: "✔ Vẫn đăng ký", action_id: "CONFIRM_OFF", value: day.date },  
        { text: "↩ Ngày khác", action_id: "BTN_REGISTER_OFF", value: "" }  
      ]  
    });  
  }  
  
  if (day.type === "red") {  
    return sendMessage(chatId,  
      `🟥⚠ Ngày ${day.date} bị hạn chế OFF.\nVui lòng nhập lý do.`  
    );  
  }  
}  
  
// =====================================================  
// SAVE OFF REQUEST → GOOGLE SHEET  
// =====================================================  
async function requestOff(chatId, date) {  
  await fetch(APPS_SCRIPT_URL, {  
    method: "POST",  
    headers: { "Content-Type": "application/json" },  
    body: JSON.stringify({  
      action: "register_off",  
      EmployeeID: chatId,  
      Date: date,  
      ReasonVisible: true  
    })  
  });  
  
  return sendMessage(chatId, `✔ Đăng ký OFF ngày ${date} thành công!`);  
}  
  
// =====================================================  
// SAVE CHAT ID  
// =====================================================  
async function saveChatId(EmployeeID, ChatID) {  
  await fetch(APPS_SCRIPT_URL, {  
    method: "POST",  
    headers: { "Content-Type": "application/json" },  
    body: JSON.stringify({  
      action: "save_chatid",  
      EmployeeID,  
      ChatID  
    })  
  });  
}  
  
// =====================================================  
// SEND TEXT MESSAGE  
// =====================================================  
async function sendMessage(chatId, text) {  
  await fetch("https://open.seatalk.io/api/v2/bot/send_message", {  
    method: "POST",  
    headers: {  
      Authorization: "Bearer " + BOT_TOKEN,  
      "Content-Type": "application/json"  
    },  
    body: JSON.stringify({ chat_id: chatId, text })  
  });  
  
  return respond("OK");  
}  
  
// =====================================================  
// SEND BUTTON MESSAGE  
// =====================================================  
async function sendInteractive(chatId, data) {  
  await fetch("https://open.seatalk.io/api/v2/bot/send_message", {  
    method: "POST",  
    headers: {  
      Authorization: "Bearer " + BOT_TOKEN,  
      "Content-Type": "application/json"  
    },  
    body: JSON.stringify({  
      chat_id: chatId,  
      text: data.text,  
      actions: data.buttons  
    })  
  });  
  
  return respond("OK");  
}  
  
// =====================================================  
function respond(msg) {  
  return {  
    statusCode: 200,  
    headers: { "Content-Type": "application/json" },  
    body: typeof msg === "string" ? msg : JSON.stringify(msg)  
  };  
}
