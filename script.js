async function sendMessage() {
  const userInputElem = document.getElementById('user-input');
  const userInput = userInputElem.value.trim();
  const messages = document.getElementById('messages');
  const chatWindow = document.getElementById('chat-window');

  if (userInput === '') return;

  // Display user input
  const userMessage = document.createElement('div');
  userMessage.className = 'user-message';
  userMessage.textContent = `You: ${userInput}`;
  messages.appendChild(userMessage);

  // Show typing indicator
  const typingIndicator = document.createElement('div');
  typingIndicator.className = 'bot-message typing';
  typingIndicator.textContent = 'Searching...';
  messages.appendChild(typingIndicator);

  chatWindow.scrollTop = chatWindow.scrollHeight;

  try {
    const response = await fetch('http://localhost:3000/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: userInput }),
    });

    messages.removeChild(typingIndicator);

    const botMessage = document.createElement('div');
    botMessage.className = 'bot-message';

    if (response.ok) {
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        let resultsHTML = `<div>Here IS What I <br> Found ${data.totalResults} results (showing top ${data.results.length}):</div><ul>`;

        data.results.forEach(item => {
          resultsHTML += '<li>';
          Object.entries(item).forEach(([key, value]) => {
            resultsHTML += `<strong>${key}:</strong> ${value} `;
          });
          resultsHTML += '</li>';
        });

        resultsHTML += '</ul>';
        botMessage.innerHTML = resultsHTML;
      } else {
        botMessage.textContent = 'Bot: No results found for your search.';
      }
    } else {
      const errorData = await response.json();
      botMessage.textContent = `Bot: ${errorData.error || 'Sorry, I could not find any results for your query.'}`;
    }

    messages.appendChild(botMessage);

  } catch (error) {
    console.error('Error:', error);

    const botMessage = document.createElement('div');
    botMessage.className = 'bot-message';
    botMessage.textContent = 'Bot: Sorry, there was an error processing your request. Please try again later.';
    messages.appendChild(botMessage);
  }

  chatWindow.scrollTop = chatWindow.scrollHeight;
  userInputElem.value = '';
}

// Only these two listeners are needed
document.getElementById('send-btn').addEventListener('click', sendMessage);
document.getElementById('user-input').addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    sendMessage();
  }
});
