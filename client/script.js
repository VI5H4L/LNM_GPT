import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;

function loader(element) {
  element.textContent = "";

  loadInterval = setInterval(() => {
    element.textContent += ".";

    if (element.textContent === "....")
      element.textContent = "";
  }, 300);
}

function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexaDecimalString = randomNumber.toString(16);
  return `id-${timestamp}-${hexaDecimalString}`;
}

function chatStripe(isAi, value, uniqueID) {
  return (
    `
    <div class="wrapper ${isAi && "ai"}">
      <div class= "chat">
        <div class= "profile">
          <img src="${isAi ? bot : user}" alt="${isAi ? "bot" : "user"}"
          </img>
        </div>
        <div class="message" id=${uniqueID}>${value}</div>
      </div> 
    </div>
    `
  )
}

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  //user
  chatContainer.innerHTML += chatStripe(false, data.get("prompt"));

  form.reset();

  //bot
  const uniqueID = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, "", uniqueID);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueID);

  loader(messageDiv);

  //fetch data
  // const response = await fetch("http://localhost:5000", {
  //   method: "POST",
  //   headers: {
  //     "content-Type": "application/json"
  //   },
  //   body: JSON.stringify({
  //     prompt: data.get("prompt")
  //   })
  // })
  const response = await fetch("https://lnm-gpt-20mq.onrender.com/", {
    method: "POST",
    headers: {
      "content-Type": "application/json"
    },
    body: JSON.stringify({
      prompt: data.get("prompt")
    })
  })

  clearInterval(loadInterval);
  messageDiv.innerHTML = "";

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();

    console.log(parsedData);

    typeText(messageDiv, parsedData);
  } else {
    const err = await response.text();
    messageDiv.innerHTML = "Something Went Wrong!";
    alert(err);
  }
}

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) handleSubmit(e);
});