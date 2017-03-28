'use strict';


/**
 * Register Module
 */
angular.module('MyTime.PostMessage', ['MyTime.SystemConfig'])
  .constant('ALLOW_X_DOMAIN', true)


/**
 * Register Services
 */
angular.module('MyTime.PostMessage')


  // Post Message Service
  .service('PostMessage', ['ALLOW_X_DOMAIN', 'SystemConfigService', '$rootScope', '$injector', 'PostMessageData', function (ALLOW_X_DOMAIN, SystemConfigService, $rootScope, $injector, PostMessageData) {


    return {

      parent: function () {

        return window.opener != null ? window.opener : window.parent;
      },

      receive: function (message, service, fn, args, useData) {

        // Origin
        // Set this up so it automatically only responds to messages from it's window
        // var fromOrigin = window.location.origin; // May not work for IE

        // var host = window.location.protocol + '//' + window.location.hostname;
        // var port = window.location.port ? ':' + window.location.port : '';
        // var fromOrigin = host + port;

        // Respond to Messages from anywhere
        // var fromOrigin = '*';

        // Respond to messages from parent window on dofferent domain
        // var fromOrigin = window.opener.location.origin // May not work in IE
        // var host = window.opener.location.protocol + '//' + window.opener.location.hostname;
        // var port = window.opener.location.port ? ':' + window.opener.location.port : '';
        // var fromOrigin = host + port;

        // check which method we need to use for adding event listeners (Everybody else : IE)
        var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";

        // assign that method to a var so we can use it over and over if we want
        var eventer = window[eventMethod];

        // The message event name we have to listen for...once again (Everybody else : IE)
        var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";

        // Listen to message from child window
        eventer(messageEvent, function (e) {

          var event = e || window.event;

          // If the event didn't originate from this origin (ignore query string)
          if (event.origin !== SystemConfigService.get('parentDomain')) {

            // ignore it
            return;
          }

          // if the message matches the one we passed in
          if (event.data) {

            // Inject the service for the function we want to call
            var newService = $injector.get(service);

            // If we passed an object and that object has a property 'eventName'
            if (event.data.hasOwnProperty('message') && event.data.message === message) {

              // If the message contains data and we want to use
              // that data in our passed in function
              if (event.data.data && useData) {

                // Set args to data
                args = event.data.data;

                // Store the post message data for later processing
                PostMessageData.setPostMessageData(event.data.message, args);
              }

              // If the args are an array
              if (Object.prototype.toString.call(args) === '[object Array]') {

                // execute the passed in function with the passed in array of args
                $rootScope.$apply(newService[fn](args))
              }
              else {

                // execute the passing function with the passed in argument;
                $rootScope.$apply(newService[fn](args))

              }
            }
            return;
          }


          // if the message is a string and it matches the one we passed in
          if (Object.prototype.toString.call(e.message) === '[object String]') {

            // execute the passed in function with the passed in array of args
            $rootScope.$apply(newService[fn](args))
          }
          else {

            // execute the passing function with the passed in argument;
            $rootScope.$apply(newService[fn](args))
          }
        });
      },

      send: function(message, data, ref, origin) {

        var postMessage = {
          message: message,
          data: data
        };

        ref.postMessage(postMessage, origin);
      }
    }
  }])

  // Post Message Data Service
  .service('PostMessageData', [function () {


    // Storage Var
    var postMessageData = {};


    function _setPostMessageData(message, data) {
      postMessageData[message] = data;
    }

    function _getPostMessageData(message) {

      return postMessageData[message];
    }

    function _clearPostMessageData() {
      postMessageData = null;
    }

    return {

      // Store data
      setPostMessageData: function (message, data) {

        // Call private implementation
        _setPostMessageData(message, data);
      },

      // Get data
      getPostMessageData: function (message) {

        // Call private implementation
        return _getPostMessageData(message);
      },

      // Clear data
      clearPostMessageData: function () {

        // Call private implementation
        _clearPostMessageData();
      }
    }
  }]);