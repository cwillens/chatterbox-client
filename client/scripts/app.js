// YOUR CODE HERE:
var App = function() {
  var app = {};

  app.init = function(name) {
    console.log('initializing');
    this.friendsList = [];
    this.roomList = [];
    this.name = (window.location.search.slice(window.location.search.indexOf('=') + 1));
    this.roomname = document.getElementById('chatroomSelect').value;
    this.lastMessageTime = -1;
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

    $.get('https://api.parse.com/1/classes/messages?order=-createdAt', function(data) {
      data.results.forEach(function(elem) {
        if (context.roomList.indexOf(elem.roomname) === -1) {
          context.roomList.push(elem.roomname);
          
        }
      });
      console.log('roomlist = ' + context.roomList);
      context.roomList.forEach(function(elem) {
        console.log('making option for ' + elem);
        var $newNode = $('<option value="' + escapeHTML(elem) + '">' + escapeHTML(elem) + '</option>');
        $('.chatroomSelecter').append($newNode);
      });
    });
    $('#newRoomButton').click(function() {
      var newRoom = document.getElementById('newRoomText').value;
      context.roomList.push(newRoom);
      var $newNode = $('<option value="' + escapeHTML(newRoom) + '">' + escapeHTML(newRoom) + '</option>');
      $('.chatroomSelecter').append($newNode);
    });
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
        console.log('chatterbox: Message [' + messageObj.text + '] to [' + messageObj.roomname + '] sent');
        //context.fetch();
      },
      error: function (data) {
        // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to send message', data);
      }
    });
  };

  app.fetch = function() {
    //first remove all messages
    console.log('friends list = ' + this.friendsList);
    $('section').remove();
    console.log('this.roomname in fetch = ' + this.roomname);
    var context = this;
    //this.roomname = document.getElementById('chatroomSelect').value;

    $.get('https://api.parse.com/1/classes/messages?order=-createdAt&' + encodeURI('where={"roomname":"' + context.roomname + '"}'), function(data) {
      var gotFirst = false;
      data.results.forEach(function(elem) {
        if (!gotFirst) {
          context.lastMessageTime = elem.createdAt;
          gotFirst = true;
        }
        if (elem.roomname === context.roomname) {
          console.log('elem.roomname = ' + elem.roomname + ' context.roomname = ' + context.roomname);
          //var $newNode = $('<div id="' + elem.createdAt + '" class="' + elem.roomname + ' ' + escapeHTML(elem.username) + '">' + escapeHTML(elem.username) + ': ' + escapeHTML(elem.text) + '</div>');
          if (context.friendsList.indexOf(elem.username) !== -1 ) {
            //var $newNode = $('<section><div class="username ' + escapeHTML(elem.username) + '">' + escapeHTML(elem.username) + ': </div><div id="' + escapeHTML(elem.createdAt) + '" class="message friend ' + escapeHTML(elem.username) + ' ' + escapeHTML(elem.roomname) + '">' + escapeHTML(elem.text) + '</div></section>');
            var $newNode1 = $('<div class="username ' + escapeHTML(elem.username) + '">' + escapeHTML(elem.username) + ': </div>');
            var $newNode2 = $('<div id="' + escapeHTML(elem.createdAt) + '" class="message friend ' + escapeHTML(elem.username) + ' ' + escapeHTML(elem.roomname) + '">' + escapeHTML(elem.text) + '</div>');
          } else {
            //var $newNode = $('<section><div class="username ' + escapeHTML(elem.username) + '">' + escapeHTML(elem.username) + ': </div><div id="' + escapeHTML(elem.createdAt) + '" class="message ' + escapeHTML(elem.username) + ' ' + escapeHTML(elem.roomname) + '">' + escapeHTML(elem.text) + '</div></section>');
            var $newNode1 = $('<div class="username ' + escapeHTML(elem.username) + '">' + escapeHTML(elem.username) + ': </div>');
            var $newNode2 = $('<div id="' + escapeHTML(elem.createdAt) + '" class="message ' + escapeHTML(elem.username) + ' ' + escapeHTML(elem.roomname) + '">' + escapeHTML(elem.text) + '</div>');
          }
          //console.log($newNode);
          $newNode1.click(function() {
            //$('.message.' + elem.username).css({'font-weight': '800'});
            if (context.friendsList.indexOf(elem.username) === -1) {
              context.friendsList.push(elem.username);
              $newNode2.addClass('friend');
              //add friend class to all other of friend's messages
              $('.' + escapeHTML(elem.username) + '.message').addClass('friend');
            }
            console.log('added ' + elem.username + ' to friends list');
          });

          var $newNode = $('<section></section>').append($newNode1).append($newNode2);
          $('#chats').append($newNode);
        }
      });
    });
    if (window.unreadInterval) {
      clearInterval(window.unreadInterval);
    }

    window.unreadInterval = setInterval(function() {
      window.count = 0;
      console.log(context.getUnreadMessages());
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
    return window.count;
  };
    /*
    var context = this;
    //var count = 0;
    window.count = 0;
    console.log('lastMessageTime = ' + context.lastMessageTime);
    $.get('https://api.parse.com/1/classes/messages?order=-createdAt&' + encodeURI('where={"roomname":"' + context.roomname + '"}'), function(data) {
      //var count = 0;
      for (var i = 0; i < data.results.length; i++) {
        if (data.results[i].createdAt === context.lastMessageTime) {
          break;
        } else {
          window.count += 1;
        }
      }
    });
    return setTimeout(function() {
      return window.count;
    }, 1000);
  };
  */
  return app;
  
};

var app = App();
app.init();