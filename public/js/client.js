let socket = new WebSocket(WS_URL);
const body = document.querySelector("body");
const logo = document.getElementById("logo");
const messageDiv = document.getElementById("message");
const counter = document.getElementById("counter");
counter.innerText = 'Aguardando sorteio...'

socket.addEventListener("message", handleServerMessage);

function handleServerMessage(event) {
  const data = JSON.parse(event.data);
  console.log("Mensagem recebida do servidor:", data);

  switch (data.action) {
    case ACTIONS.COUNTDOWN:
      logo.classList.toggle("spin-animation", true);
      logo.classList.toggle("stop-spin", false);
      setCountDown(data.current, data.end);
      break;
    case ACTIONS.RESULT:
      switch (data.status) {
        case STATUS.WIN:
          setClientState("win", data.code);
          break;
        case STATUS.LOSE:
          setClientState("lose");
          break
      }
      break;
  }
}

function setCountDown(count, end) {
  if (count === end) {
    logo.classList.toggle("spin-animation", false);
    logo.classList.toggle("stop-spin", true);
    counter.innerText = 'Sorteio finalizado'
    return
  }
  counter.innerText = count
}

function setClientState(state, code = "") {
  // Início da animação
  body.className = "main";
  messageDiv.classList.toggle("hide-message", true);
  logo.classList.toggle("stop-spin", false);
  logo.classList.toggle("spin-animation", true);
  counter.innerHTML = 'Aguardando sorteio...';

  if (state === "win") {
    body.classList.add("win");
    messageDiv.innerHTML = `😜 <br> You win! Confimation code is ${code}`;
    vibratePhone(1000);
  } else if (state === "lose") {
    body.classList.add("lose");
    messageDiv.innerHTML = `😥 <br> You lose! `;
  }
}

function vibratePhone(timeMs) {
  if (navigator.vibrate) {
    navigator.vibrate(timeMs);
  }
}
