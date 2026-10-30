const openChatButton = document.getElementById("open-chat");

const API_URL = "https://script.google.com/macros/s/AKfycbyxQvItSMvTZa2iK2AU7Cz9DvigL1YAWKGj12NFfxqS6AuQ8S-MDuARKB4g52Qli0Y6jQ/exec";

openChatButton.addEventListener("click", () => {
  let chat = document.getElementById("chat-widget");

  if (chat) {
    chat.classList.toggle("chat-hidden");
    return;
  }

  chat = document.createElement("section");
  chat.id = "chat-widget";
  chat.className = "chat-widget";

  chat.innerHTML = `
    <div class="chat-header">
      <div>
        <strong>Fysio Centrum Kralingen</strong>
        <p>AI Assistant · Demo</p>
      </div>
      <button id="close-chat" type="button" aria-label="Close chat">×</button>
    </div>

    <div id="chat-messages" class="chat-messages" aria-live="polite">
      <div class="message assistant-message">
        Hello! Welcome to Fysio Centrum Kralingen. I can answer questions about our services and opening hours, or help you submit an appointment request. How can I help?
      </div>
    </div>

    <form id="chat-form" class="chat-form">
      <input
        id="chat-input"
        type="text"
        placeholder="Type your question..."
        autocomplete="off"
        aria-label="Your message"
        required
      >
      <button type="submit" aria-label="Send message">➤</button>
    </form>
  `;

  document.body.appendChild(chat);

  document.getElementById("close-chat").addEventListener("click", () => {
    chat.classList.add("chat-hidden");
  });

  const form = document.getElementById("chat-form");
  const input = document.getElementById("chat-input");
  const messages = document.getElementById("chat-messages");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const question = input.value.trim();
    if (!question) return;

    addMessage(question, "user-message");
    input.value = "";

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    const loading = addMessage("Thinking...", "assistant-message");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify({ message: question })
      });

      const data = await response.json();
      loading.remove();

      if (!response.ok || data.error || !data.reply) {
        throw new Error("Gemini request failed");
      }

      addMessage(data.reply, "assistant-message");
    } catch (error) {
      loading.remove();
      addMessage(
        getDemoAnswer(question),
        "assistant-message"
      );
    } finally {
      submitButton.disabled = false;
      input.focus();
    }
  });

  function addMessage(text, className) {
    const message = document.createElement("div");
    message.className = `message ${className}`;
    message.textContent = text;
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
    return message;
  }

  function getDemoAnswer(question) {
    const q = question.toLowerCase();

    if (q.includes("hour") || q.includes("open") || q.includes("opening")) {
      return "We are open Monday to Friday, 09:00–18:00, and Saturday, 09:00–13:00. We are closed on Sundays.";
    }

    if (q.includes("service") || q.includes("treat") || q.includes("offer")) {
      return "We offer general physiotherapy, sports injury rehabilitation, back and neck pain treatment, and mobility and recovery exercises.";
    }

    if (q.includes("appointment") || q.includes("book") || q.includes("schedule")) {
      return "I can help you prepare an appointment request. This demo does not confirm bookings. Contact the clinic directly to confirm availability.";
    }

    if (q.includes("referral") || q.includes("doctor")) {
      return "In many cases, a referral is not needed. Requirements can vary, so please confirm your situation with the clinic or your insurer.";
    }

    if (q.includes("insurance") || q.includes("cost") || q.includes("price")) {
      return "Coverage depends on your insurance policy and treatment. Please check directly with your insurer and the clinic. I don't have confirmed pricing information.";
    }

    if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
      return "Hello! I can answer questions about opening hours, services, insurance, and appointment requests. What would you like to know?";
    }

    return "I don't have confirmed information about that yet. Please contact the clinic directly so the team can help you.";
  }
});