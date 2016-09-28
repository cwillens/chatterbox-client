// YOUR CODE HERE:
var App = function() {
  var app = {};

  app.init = function(name) {
    
    this.friendsList = [];
    this.roomList = [];
    this.name = (window.location.search.slice(window.location.search.indexOf('=') + 1));
    this.roomname = document.getElementById('chatroomSelect').value;
    this.lastMessageTime = -1;
    var context = this;
    $('#lobbyButton').click(function() {
      context.roomname = 'lobby';
      $('.chatroomSelecter').val(context.roomname);
      context.fetch();
    });

    $('.chatroomSelecter').change(function() {
      context.roomname = document.getElementById('chatroomSelect').value;
      //add a button to the tabs panel
      if (document.getElementById(context.roomname + 'Button') === null) {
        var $newNode = $('<button type="button" id="' + context.roomname + 'Button" class="tab">' + context.roomname + '</button>');
        $newNode.click(function() {
          context.roomname = $newNode.text();
          $('.chatroomSelecter').val(context.roomname);
          context.fetch();
        });
        $('#tabs').append($newNode);
        context.fetch();
      }
    });
    $('#refreshButton').click(function() {
      context.fetch();
    });
    $('#sendButton').click(function() {
      context.send();
    });
    //populate chatroom selector
    $.get('https://api.parse.com/1/classes/messages?order=-createdAt', function(data) {
      data.results.forEach(function(elem) {
        if (context.roomList.indexOf(elem.roomname) === -1) {
          context.roomList.push(elem.roomname);
          
        }
      });
      context.roomList.forEach(function(elem) {
        var $newNode = $('<option value="' + escapeHTML(elem) + '">' + escapeHTML(elem) + '</option>');
        $('.chatroomSelecter').append($newNode);
      });
    });
    //add a new chatroom
    $('#newRoomButton').click(function() {
      var newRoom = document.getElementById('newRoomText').value;
      context.roomList.push(newRoom);
      var $newNode = $('<option value="' + escapeHTML(newRoom) + '">' + escapeHTML(newRoom) + '</option>');
      $('.chatroomSelecter').append($newNode);
    });

    context.fetch();
  };

  app.send = function() {
    var message;
    var context = this;
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
        context.fetch();
      },
      error: function (data) {
        console.error('chatterbox: Failed to send message', data);
      }
    });
  };

  app.fetch = function() {
    //first remove all messages
  
    $('section').remove();

    var context = this;
    //this.roomname = document.getElementById('chatroomSelect').value;

    $.get('https://api.parse.com/1/classes/messages?order=-createdAt&' + encodeURI('where={"roomname":"' + context.roomname + '"}'), function(data) {
      context.renderMessages(data.results);
    });

    //check for unread messages
    context.checkNewMessages();
  };

  app.renderMessages = function(messages) {
    var gotFirst = false;
    var context = this;
    messages.forEach(function(elem) {
      if (!gotFirst) {
        context.lastMessageTime = elem.createdAt;
        gotFirst = true;
      }
      if (context.friendsList.indexOf(elem.username) !== -1 ) {
        var $newNode1 = $('<div class="username ' + escapeHTML(elem.username) + '">' + escapeHTML(elem.username) + ': </div>');
        var $newNode2 = $('<div id="' + escapeHTML(elem.createdAt) + '" class="message friend ' + escapeHTML(elem.username) + ' ' + escapeHTML(elem.roomname) + '">' + escapeHTML(elem.text) + '</div>');
      } else {
        var $newNode1 = $('<div class="username ' + escapeHTML(elem.username) + '">' + escapeHTML(elem.username) + ': </div>');
        var $newNode2 = $('<div id="' + escapeHTML(elem.createdAt) + '" class="message ' + escapeHTML(elem.username) + ' ' + escapeHTML(elem.roomname) + '">' + escapeHTML(elem.text) + '</div>');
      }
    
      $newNode1.click(function() {
        if (context.friendsList.indexOf(elem.username) === -1) {
          context.friendsList.push(elem.username);
          $newNode2.addClass('friend');
          //add friend class to all other of friend's messages
          $('.' + escapeHTML(elem.username) + '.message').addClass('friend');
        }
   
      });

      var $newNode = $('<section></section>').append($newNode1).append($newNode2);
      $('#chats').append($newNode);
    
    });
  };

  app.checkNewMessages = function() {
    var context = this;
    if (window.unreadInterval) {
      clearInterval(window.unreadInterval);
    }

    window.unreadInterval = setInterval(function() {
      window.count = 0;
      context.getUnreadMessages();
    }, 1000);
  };

  var entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '%': ''
  };

  var escapeHTML = function(string) {

    //return encodeURIComponent(string);
    
    return String(string).replace(/[&<>"'\/%]/g, function (s) {
      return entityMap[s];
    });
  };

  app.getUnreadMessages = function() {
    var context = this;
    $.ajax({
      url: 'https://api.parse.com/1/classes/messages?order=-createdAt&' + encodeURI('where={"roomname":"' + context.roomname + '"}'),
      async: false,
      success: function(data) {
        for (var i = 0; i < data.results.length; i++) {
          if (data.results[i].createdAt === context.lastMessageTime) {
            break;
          } else {
            window.count += 1;
          }
        }
      }
    });
    $('#refreshButton').text('Refresh Messages (' + window.count + ' unread)');

  };

  return app;
  
};

var app = App();
app.init();