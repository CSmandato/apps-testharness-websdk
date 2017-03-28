'use strict';





angular.module('MyTime.CustomMessages', ['MyTime.PostMessage', 'MyTime.SystemConfig']);

angular.module('MyTime.CustomMessages')
  .run(['PostMessage', 'SystemConfigService', '$rootScope', function(PostMessage, SystemConfigService, $rootScope) {


    // Register a listener for an sdk event
    // A navigation event occurred
    $rootScope.$on('route:change', function (e, data) {

      // Create a data object
      var messageData = {
        route: data.route
      };

      // messageData = data.route !== 'menu' ? messageData : null;

      // Use the PostMessage service to create an event, attach data and send to host site
      PostMessage.send('MyTimeNavigate', messageData, PostMessage.parent(), SystemConfigService.get('parentDomain'));
    });

    // User sent a chat meesage
    $rootScope.$on('conversation:new:message', function (e, data) {

        var copy = angular.copy(data);

        for(var prop in copy) {
            if (Object.prototype.toString.call(copy.prop) == '[object Function]') {
                delete copy.prop;
            }
        }

      var messageData = {
        type: copy || 'message'
      };


      PostMessage.send('MyTimeCommunicate', angular.toJson(messageData), PostMessage.parent(), SystemConfigService.get('parentDomain'));
    });

    // User started a new conversation
    $rootScope.$on('conversation:open', function (e, data) {

      var messageData = {
        type: data
      };

      PostMessage.send('MyTimeConversation', messageData, PostMessage.parent(), SystemConfigService.get('parentDomain'));
    });

    $rootScope.$on('notification:open', function (e, data) {

      PostMessage.send('MyTimeConversation', data, PostMessage.parent(), SystemConfigService.get('parentDomain'));
    })
  }]);