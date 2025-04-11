// const venom = require("venom-bot");
import venom from "venom-bot";

venom
  .create({
    session: "whatsapp-session",
    multidevice: true,
    headless: "new",
  })
  .then((client) => start(client))
  .catch((error) => console.log(error));

function start(client) {
  console.log("Bot Whatsapp aktif...");

  function sendWhatsAppMessage() {
    client
      .sendText("6281243662758@c.us", "Halo! Servis Anda telah diperbarui!")
      .then((result) => console.log("Pesan terkirim:", result))
      .catch((error) => console.log("Error:", error));
  }

  sendWhatsAppMessage();
}
