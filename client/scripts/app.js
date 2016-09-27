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

  //return encodeURIComponent(string);
  
  return String(string).replace(/[&<>"'\/]/g, function (s) {
    return entityMap[s];
  });
};

app.init = function(name) {
  console.log('initializing');
  this.name = (window.location.search.slice(window.location.search.indexOf('=') + 1));
  this.roomname = document.getElementById('chatroomSelect').value;
  $('.chatroomSelecter').change(function() {
    this.roomname = document.getElementById('chatroomSelect').value;
    app.fetch();
  });
  var context = this;
  $('#refreshButton').click(function() {
    app.fetch();
  });
};

app.send = function() {
  var message;
  if (arguments[0] !== undefined) {
    message = arguments[0];
  } else {
    message = document.getElementById('messageText').value;
  }

  var messageObj = {
    username: this.name,
    text: message,
    roomname: this.roomname
  };
  $.ajax({
    // This is the url you should use to communicate with the parse API server.
    url: 'https://api.parse.com/1/classes/messages',
    type: 'POST',
    data: JSON.stringify(messageObj),
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message [' + messageObj.text + '] to [' + messageObj.roomname + '] sent');
    },
    error: function (data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message', data);
    }
  });
};

app.fetch = function() {
  //first remove all messages
  $('section').remove();

  var context = this;
  this.roomname = document.getElementById('chatroomSelect').value;

  $.get('https://api.parse.com/1/classes/messages?order=-createdAt', function(data) {
    data.results.forEach(function(elem) {
      if (elem.roomname === context.roomname) {
        console.log('elem.roomname = ' + elem.roomname + ' this.roomname = ' + context.roomname);
        //var $newNode = $('<div id="' + elem.createdAt + '" class="' + elem.roomname + ' ' + escapeHTML(elem.username) + '">' + escapeHTML(elem.username) + ': ' + escapeHTML(elem.text) + '</div>');
        var $newNode = $('<section><div class="username ' + escapeHTML(elem.username) + '">' + escapeHTML(elem.username) + ': </div><div id="' + escapeHTML(elem.createdAt) + '" class="message ' + escapeHTML(elem.username) + ' ' + escapeHTML(elem.roomname) + '">' + escapeHTML(elem.text) + '</div></section>');
        //console.log($newNode);
        $('#chats').append($newNode);
      }
    });
  });
};

app.init();