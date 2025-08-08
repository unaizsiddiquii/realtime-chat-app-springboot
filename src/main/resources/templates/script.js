
    let stompClient = null;
    let myUsername = '';

    function safeText(s) { return (s || '').toString(); }

    function connect() {
      myUsername = document.getElementById('username').value.trim();
      if (!myUsername) { alert('Enter username'); return; }

      const socket = new SockJS('/chat');
      stompClient = Stomp.over(socket);

      stompClient.connect({}, function(frame) {
        console.log('Connected', frame);
        // subscribe topic
        stompClient.subscribe('/topic/messages', function(payload) {
          try {
            const msg = JSON.parse(payload.body);
            appendMessage(msg);
          } catch(e) { console.error(e); }
        });

        // load history
        fetch('/messages?limit=100')
          .then(r => r.json())
          .then(arr => { arr.forEach(appendMessage); })
          .catch(e => console.error('history load failed', e));
      }, function(err) {
        console.error('STOMP error', err);
      });
    }

    function appendMessage(message) {
      // message: { sender, content, timestamp }
      const area = document.getElementById('messageArea');
      const div = document.createElement('div');
      const isMe = (message.sender === myUsername);
      div.className = 'bubble ' + (isMe ? 'sent' : 'recv');

      const time = message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : '';
      div.innerHTML = `<strong>${escapeHtml(message.sender || 'anon')}</strong><div>${escapeHtml(message.content)}</div><div class="meta">${time}</div>`;
      area.appendChild(div);
      area.scrollTop = area.scrollHeight;
    }

    // simple escaping (avoid XSS)
    function escapeHtml(str) {
      return safeText(str)
        .replaceAll('&','&amp;')
        .replaceAll('<','&lt;')
        .replaceAll('>','&gt;')
        .replaceAll('"','&quot;');
    }

    document.getElementById('sendBtn').addEventListener('click', () => {
      sendMessage();
    });

    document.getElementById('messageInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendMessage();
    });

    function sendMessage() {
      if (!stompClient || !stompClient.connected) {
        // try connect first time then send
        connect();
        setTimeout(sendMessage, 300); // short wait — acceptable for dev
        return;
      }
      const sender = document.getElementById('username').value.trim();
      const content = document.getElementById('messageInput').value.trim();
      if (!sender || !content) return;
      const chatMessage = { sender: sender, content: content };
      stompClient.send("/app/sendMessage", {}, JSON.stringify(chatMessage));
      document.getElementById('messageInput').value = '';
    }

    // Auto-connect on load (optional)
    window.addEventListener('load', () => {
      // do nothing; wait for username and user action
      // If you want auto-connect: call connect();
    });