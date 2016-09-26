// YOUR CODE HERE:
var app = {};

var entityMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;'
};

var escapeHTML = function(string) {
  return String(string).replace(/[&<>"'\/]/g, function (s) {
    return entityMap[s];
  });
};

app.init = function(name) {
  var enterName = prompt('Please Enter Your Name') || 'anonymous';
  this.name = enterName;
  console.log('name = ' + enterName);
  this.roomname = 'lobby';
  $('#sendButton').click(function() {
    console.log('button clicked!');
  });
};

app.send = function() {
  var message;
  var roomName = document.getElementById('chatroomSelect').value;
  if (arguments[0] !== undefined) {
    message = arguments[0];
  } else {
    message = document.getElementById('messageText').value;
  }

  var messageObj = {
    username: this.name,
    text: message,
    roomname: roomName
  };
  $.ajax({
    // This is the url you should use to communicate with the parse API server.
    url: 'https://api.parse.com/1/classes/messages',
    type: 'POST',
    data: JSON.stringify(messageObj),
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message [' + messageObj.text + '] to [' + roomName + '] sent');
    },
    error: function (data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message', data);
    }
  });
};

app.fetch = function() {

  $.get('https://api.parse.com/1/classes/messages', function(data) {
    data.results.forEach(function(elem) {
      var $newNode = $('<div id="' + elem.createdAt + '" class="' + elem.roomname + ' ' + escapeHTML(elem.username) + '">' + escapeHTML(elem.username) + ': ' + escapeHTML(elem.text) + '</div>');
      //console.log($newNode);
      $('#chats').append($newNode);
    });
  });
};

app.init();