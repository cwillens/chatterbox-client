// YOUR CODE HERE:
var App = function() {
  var app = {};

  app.init = function(name) {
    console.log('initializing');
    this.name = (window.location.search.slice(window.location.search.indexOf('=') + 1));
    this.roomname = document.getElementById('chatroomSelect').value;
    var context = this;
    $('.chatroomSelecter').change(function() {
      context.roomname = document.getElementById('chatroomSelect').value;
      console.log('chatroom changed to ' + context.roomname);
      context.fetch();
    });
    $('#refreshButton').click(function() {
      context.fetch();
    });
    $('#sendButton').click(function() {
      context.send();
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
    console.log('this.roomname in fetch = ' + this.roomname);
    var context = this;
    //this.roomname = document.getElementById('chatroomSelect').value;

    $.get('https://api.parse.com/1/classes/messages?order=-createdAt', function(data) {
      data.results.forEach(function(elem) {
        if (elem.roomname === context.roomname) {
          console.log('elem.roomname = ' + elem.roomname + ' context.roomname = ' + context.roomname);
          //var $newNode = $('<div id="' + elem.createdAt + '" class="' + elem.roomname + ' ' + escapeHTML(elem.username) + '">' + escapeHTML(elem.username) + ': ' + escapeHTML(elem.text) + '</div>');
          var $newNode = $('<section><div class="username ' + escapeHTML(elem.username) + '">' + escapeHTML(elem.username) + ': </div><div id="' + escapeHTML(elem.createdAt) + '" class="message ' + escapeHTML(elem.username) + ' ' + escapeHTML(elem.roomname) + '">' + escapeHTML(elem.text) + '</div></section>');
          //console.log($newNode);
          $newNode.click(function() {
            $('.message.' + elem.username).css({'font-weight': '800'});
          });


          $('#chats').append($newNode);
        }
      });
    });
  };

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

  return app;
};

var ourApp = App();
ourApp.init();