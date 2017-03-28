'use strict';

/**
 * @ngdoc overview
 * @name csMobileWeb2App
 * @description
 * # csMobileWeb2App
 *
 * Main module of the application.
 */

angular.module('csMobileWeb2App', [
  'ngCookies',
  'ngResource',
  'ngRoute',
  'ngSanitize',
  'ngTouch',
  'MyTime.Services',
  'MyTime.Directives',
  'MyTime.SourcePolicy',
  'MyTime.SystemConfig',
  'MyTime.DeviceConfig',
  'MyTime.PostMessage',
  'MyTime.UserAttrs',
  'MyTime.CustomMessages',
  'MyTime.StropheModule',
  'MyTime.AwsModule',
  'MyTime.MqModule'
])

  // Configure Router
  .config([
    '$routeProvider',
    'FAQ_SERVER_SEARCH',
    function ($routeProvider, FAQ_SERVER_SEARCH) {
      $routeProvider
        .when('/', {
          templateUrl: 'views/menu.html',
          controller: 'MenuCtrl',
          resolve: {
            hasCurrentUser: ['AuthService', 'MqService', '$location', '$q', function (AuthService, MqService, $location, $q) {

              var defer = $q.defer();

              if (!AuthService.hasUser() || !MqService.hasConnection()) {

                defer.reject('InvalidUser');
              }
              else {

                defer.resolve();
              }

              return defer.promise;
            }],
            resolveBadges: ['BadgeService', '$q', function (BadgeService, $q) {

              var defer = $q.defer();

              BadgeService.getBadgesFromServer().then(
                function (result) {

                  defer.resolve(result);
                },
                function (reject) {

                  defer.reject(false);
                }
              );

              return defer.promise;

            }]
          }
        })
        .when('/login', {
          templateUrl: 'views/login.html',
          controller: 'LoginCtrl'
        })
        .when('/conversation/', {
          templateUrl: 'views/conversation.html',
          controller: 'ConversationCtrl',
          resolve: {
            checkNotificationPreferences: ['AuthService', 'MqService', 'NotificationPreferencesService', '$q', 'SystemConfigService', '$location', 'AppState','AppStateValues', 'StateRouteAdapter', 'MessageService',
              function (AuthService, MqService, NotificationPreferencesService, $q, SystemConfigService, $location, AppState, AppStateValues, StateRouteAdapter, MessageService) {

                // Check for valid user
                var defer = $q.defer();
                if (!AuthService.hasUser() || !MqService.hasConnection()) {
                  defer.reject('InvalidUser');
                  return defer.promise;
                }

                defer = null;

                // User preferences enabled?
                if (SystemConfigService.get('userPrefsEnabled')) {

                  defer = $q.defer();

                  // Go get the users preferences
                  NotificationPreferencesService.getPreferences().then(
                      function (result) {

                        // Has the user previously set their preferences
                        if (NotificationPreferencesService.hasPreferences()) {

                          // The user has set the their notification prefs before and we do not need to redirect to NotificationPreferencesCtrl
                          NotificationPreferencesService.showNotificationPreferences = false;
                        }

                        // User has no notification prefs and we should show the notification preferences screen
                        else if (!NotificationPreferencesService.hasPreferences() && NotificationPreferencesService.showNotificationPreferences == true) {

                          // redirect to the preferences screen
                          $location.url('/notification-preferences-opt-in');
                          return;
                        }
                        else {

                          // Reset the 'show notification preferences screen' var in the NotificationPreferencesService because we
                          // want the user to see this every time they navigate to a chat until they save.
                          NotificationPreferencesService.showNotificationPreferences = true;
                        }

                        // All of these should result in a successful handling of the response
                        defer.resolve();
                      },
                      function (reject) {
                        defer.reject();
                      }
                  );

                  return defer.promise;
                }
            }]
          }
        })
        .when('/notification-preferences-opt-in', {
            templateUrl: 'views/notification-prefs-opt-in.html',
            controller: 'NotificationPrefsOptInCtrl'
          })
        .when('/history', {
          templateUrl: 'views/history.html',
          controller: 'HistoryCtrl',
          resolve: {
            hasCurrentUser: ['AuthService', 'MqService', '$location', '$q', function (AuthService, MqService, $location, $q) {

              var defer = $q.defer();
              if (!AuthService.hasUser() || !MqService.hasConnection()) {
                defer.reject('InvalidUser');
              }
              else {

                defer.resolve();
              }

              return defer.promise;
            }],
            isEnabled: ['SystemConfigService', '$q', function(SystemConfigService, $q) {

              var defer = $q.defer();

              if (!SystemConfigService.get('activityLogEnabled')) {

                defer.reject('InvalidRoute');
              }
              else {
                defer.resolve();
              }

              return defer.promise;
            }]
          }
        })
        .when('/notifications', {
          templateUrl: 'views/notifications.html',
          controller: 'NotificationsCtrl',
          resolve: {
            hasCurrentUser: ['AuthService', 'MqService', '$location', '$q', function (AuthService, MqService,  $location, $q) {

              var defer = $q.defer();
              if (!AuthService.hasUser() || !MqService.hasConnection()) {
                defer.reject('InvalidUser');
              }
              else {

                defer.resolve();
              }

              return defer.promise;
            }],
            isEnabled: ['SystemConfigService', '$q', function(SystemConfigService, $q) {

              var defer = $q.defer();

              if (!SystemConfigService.get('notificationsEnabled')) {

                defer.reject('InvalidRoute');
              }
              else {
                defer.resolve();
              }

              return defer.promise;
            }]
          }
        })
        .when('/notifications/:notificationGuid', {
          templateUrl: 'views/notifications-blast.html',
          controller: 'BlastNotificationCtrl',
          resolve: {
            isEnabled: ['SystemConfigService', '$q', function(SystemConfigService, $q) {

              var defer = $q.defer();

              if (!SystemConfigService.get('notificationsEnabled')) {

                defer.reject('InvalidRoute');
              }
              else {
                defer.resolve();
              }

              return defer.promise;
            }],
            hasCurrentUser: ['AuthService', 'MqService', '$location', '$q', function (AuthService, MqService, $location, $q) {

              var defer = $q.defer();
              if (!AuthService.hasUser() || !MqService.hasConnection()) {
                defer.reject('InvalidUser');
              }
              else {

                defer.resolve();
              }

              return defer.promise;
            }],
            resolveNotification: ['NotificationService', '$route', '$q', function (NotificationService, $route, $q) {

              var defer = $q.defer();

              NotificationService.getNotification($route.current.params.notificationGuid).then(
                function (result) {

                  defer.resolve(result);

                },
                function (reject) {

                  defer.reject(reject);

                }
              );

              return defer.promise;
            }]
          }
        })
        .when('/faq-small', {
          templateUrl: 'views/faq-small.html',
          controller: 'FaqSmallCtrl',
          resolve:{
            isEnabled: ['SystemConfigService', '$q', function(SystemConfigService, $q) {

              var defer = $q.defer();

              if (!SystemConfigService.get('faqEnabled')) {

                defer.reject('InvalidRoute');
              }
              else {
                defer.resolve();
              }

              return defer.promise;
            }],
            hasCurrentUser: ['AuthService', 'MqService', '$location', '$q', function (AuthService, MqService, $location, $q) {

              var defer = $q.defer();
              if (!AuthService.hasUser() || !MqService.hasConnection()) {
                defer.reject('InvalidUser');
              }
              else {

                defer.resolve();
              }

              return defer.promise;
            }],
            resolveFaqArticles: ['SystemConfigService', 'FaqService', '$q', function (SystemConfigService, FaqService, $q) {

              var defer = $q.defer();

              // This will get history items from the server.  Store them
              // in the service.  And then pass them to the controller
              FaqService.getAllFaqArticlesFromServer().then(
                // Success
                function (result) {

                  defer.resolve(result);
                },

                // Error
                function (reject) {

                  // Handle error
                  defer.reject(false);
                }
              )

              return defer.promise;
            }]
          }
        })
        .when('/faq-large', {
            templateUrl: 'views/faq-large.html',
            controller: 'FaqLargeCtrl',
            resolve: {
              isEnabled: ['SystemConfigService', '$q', function(SystemConfigService, $q) {

                var defer = $q.defer();

                if (!SystemConfigService.get('faqEnabled')) {

                  defer.reject('InvalidRoute');
                }
                else {
                  defer.resolve();
                }

                return defer.promise;
              }],
              hasCurrentUser: ['AuthService', 'MqService', '$location', '$q', function (AuthService, MqService, $location, $q) {

                var defer = $q.defer();
                if (!AuthService.hasUser() || !MqService.hasConnection()) {
                  defer.reject('InvalidUser');
                }
                else {

                  defer.resolve();
                }

                return defer.promise;
              }],
              resolveFaqLabels: ['SystemConfigService', 'FaqService', '$q', function (SystemConfigService, FaqService, $q) {

                var defer = $q.defer();

                // This will get history items from the server.  Store them
                // in the service.  And then pass them to the controller
                FaqService.getFaqLabelsFromServer().then(
                    // Success
                    function (result) {

                      defer.resolve(result);
                    },

                    // Error
                    function (reject) {

                      // Handle error
                      defer.reject(false);
                    }
                )

                return defer.promise;
              }]
            }
          })
        .when('/faq-small/:articleGuid', {
          templateUrl: 'views/faq-article-text.html',
          controller: 'FaqArticleTextCtrl',
          resolve: {
            isEnabled: ['SystemConfigService', '$q', function(SystemConfigService, $q) {

              var defer = $q.defer();

              if (!SystemConfigService.get('faqEnabled')) {

                defer.reject('InvalidRoute');
              }
              else {
                defer.resolve();
              }

              return defer.promise;
            }],
            hasCurrentUser: ['AuthService', 'MqService', '$location', '$q', function (AuthService, MqService, $location, $q) {

              var defer = $q.defer();
              if (!AuthService.hasUser() || !MqService.hasConnection()) {
                defer.reject('InvalidUser');
              }
              else {

                defer.resolve();
              }

              return defer.promise;
            }]
          }
        })
        .when('/faqs/:labelGuid', {
          templateUrl: 'views/faq-articles.html',
          controller: 'FaqArticlesCtrl',
          resolve: {
            isEnabled: ['SystemConfigService', '$q', function(SystemConfigService, $q) {

              var defer = $q.defer();

              if (!SystemConfigService.get('faqEnabled')) {

                defer.reject('InvalidRoute');
              }
              else {
                defer.resolve();
              }

              return defer.promise;
            }],
            hasCurrentUser: ['AuthService', 'MqService', '$location', '$q', function (AuthService, MqService, $location, $q) {

              var defer = $q.defer();
              if (!AuthService.hasUser() || !MqService.hasConnection()) {
                defer.reject('InvalidUser');
              }
              else {

                defer.resolve();
              }

              return defer.promise;
            }],
            resolveFaqArticles: ['FaqService', '$route', '$q', function (FaqService, $route, $q) {

              var defer = $q.defer();

              // This will get history items from the server.  Store them
              // in the service.  And then pass them to the controller
              FaqService.getFaqArticlesFromServer($route.current.params.labelGuid).then(
                function (result) {

                  defer.resolve(result);
                },

                // Error
                function (reject) {

                  // Handle error
                  defer.reject(false);
                }
              )

              return defer.promise;
            }]
          }
        })
        .when('/faqs/:labelGuid/:articleGuid', {
          templateUrl: 'views/faq-article-text.html',
          controller: 'FaqArticleTextCtrl',
          resolve: {
            isEnabled: ['SystemConfigService', '$q', function(SystemConfigService, $q) {

              var defer = $q.defer();

              if (!SystemConfigService.get('faqEnabled')) {

                defer.reject('InvalidRoute');
              }
              else {
                defer.resolve();
              }

              return defer.promise;
            }],
            hasCurrentUser: ['AuthService', 'MqService', '$location', '$q', function (AuthService, MqService, $location, $q) {

              var defer = $q.defer();
              if (!AuthService.hasUser() || !MqService.hasConnection()) {
                defer.reject('InvalidUser');
              }
              else {

                defer.resolve();
              }

              return defer.promise;
            }]
          }
        })
        .when('/articles/:articleId', {
            templateUrl: 'views/article.html',
            controller: 'ArticleCtrl',
            resolve: {
              isEnabled: ['SystemConfigService', '$q', function(SystemConfigService, $q) {

                var defer = $q.defer();

                if (!SystemConfigService.get('articleEnabled')) {

                  defer.reject('InvalidRoute');
                }
                else {
                  defer.resolve();
                }

                return defer.promise;
              }],
              hasCurrentUser: ['AuthService', 'MqService', '$location', '$q', function (AuthService, MqService, $location, $q) {

                var defer = $q.defer();
                if (!AuthService.hasUser() || !MqService.hasConnection()) {
                  defer.reject('InvalidUser');
                }
                else {

                  defer.resolve();
                }

                return defer.promise;
              }]
            }
          })
        .when('/survey', {
            templateUrl: 'views/survey.html',
            controller: 'SurveyCtrl',
            resolve: {
              isEnabled: ['SystemConfigService', '$q', function(SystemConfigService, $q) {

                var defer = $q.defer();

                if (!SystemConfigService.get('articleEnabled')) {

                  defer.reject('InvalidRoute');
                }
                else {
                  defer.resolve();
                }

                return defer.promise;
              }],
              hasCurrentUser: ['AuthService', 'MqService', '$location', '$q', function (AuthService, MqService, $location, $q) {

                var defer = $q.defer();
                if (!AuthService.hasUser() || !MqService.hasConnection()) {
                  defer.reject('InvalidUser');
                }
                else {

                  defer.resolve();
                }

                return defer.promise;
              }]
            }
          })
        .otherwise({
          redirectTo: '/login'
        });
  }])

  // Register Post Message listeners
  .run([
    'PostMessage',
    'AppStateValues',
    'SystemConfigService',
    function (PostMessage, AppStateValues, SystemConfigService) {

      // Set listener for postMessage 'MyTimeConfig'
      PostMessage.receive('MyTimeDeviceConfig', 'DeviceConfigService', 'setAll', {}, true);

      // Set listener for postMessage 'MyTimeState'
      PostMessage.receive('MyTimeState', 'AppState', 'setStateAndRoute', AppStateValues.ASV_LOGIN, true);

      // Set listener for postMessage 'MyTimeResumeConversation'
      PostMessage.receive('MyTimeResumeConversation', 'AppState', 'setStateAndRoute', {}, true);

      // Set Listener for auto login message
      PostMessage.receive('MyTimeAutoLogin', 'AutoLoginService', 'setUser', {}, true);

      // Send Load message.
      PostMessage.send('MyTimeLoaded', "loaded", PostMessage.parent(), SystemConfigService.get('parentDomain'));

      // Set Listener for auto login message
      PostMessage.receive('MyTimeLogout', 'AutoLoginService', 'logout', {}, true);

    }])

  // Handle Browser Ntofication logic
  .run(['BrowserNotificationService', '$rootScope', function (BrowserNotificationService, $rootScope) {

    // Set the name of the hidden property and the change event for visibility
    var hidden, visibilityChange;
    if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
      hidden = "hidden";
      visibilityChange = "visibilitychange";
    } else if (typeof document.mozHidden !== "undefined") {
      hidden = "mozHidden";
      visibilityChange = "mozvisibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
      hidden = "msHidden";
      visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
      hidden = "webkitHidden";
      visibilityChange = "webkitvisibilitychange";
    }

    var messagelistener = null;

    function handleVisibilityChange(e, data) {

      if (document[hidden]) {
        messagelistener = $rootScope.$on('message-service:new:message', function (e, data) {
          angular.forEach(data, function (v, i) {
            BrowserNotificationService.sendNotification(v.messageText);
          })
        })
      } else {
        if (messagelistener !== null) {
          messagelistener();
          messagelistener = null;
        }
      }
    }

    // Warn if the browser doesn't support Page Visibility API
    if (typeof document[hidden] === "undefined") {
      alert("This application requires a browser, such as Google Chrome or Firefox, that supports the Page Visibility API.");
    } else {
      // Handle page visibility change
      $(document).on(visibilityChange, function(e, data) {
        handleVisibilityChange(e, data)
      });
    }
  }])

  // Register Strophe Message/Event Handlers
  .run([
    'MqService',
    '$rootScope',
    '$timeout',
    '$location',
    'SystemConfigService',
    'AuthService',
    '$window',
      'MessageService',
    function (MqService, $rootScope, $timeout, $location, SystemConfigService, AuthService, $window, MessageService) {

      var idle, inactive;

      // Register message handler
      $rootScope.$on('strophe:connected', function (e) {});

      // Handle
      $rootScope.$on('strophe:disconnected', function (e) {

        // csStropheService.setConnection(false);
      });

      // Register Conversation Handlers
      $rootScope.$on('message-service:conversation:active', function (e) {

        // csStropheService.addHandler('conversationMessageHandler', MessageService.getMessages, null, 'message', 'chat');
        // csStropheService.addHandler('agentTypingMessageHandler', csStropheService.agentTyping, null, 'message', 'chat');
        /*MqService.addHandler('message', 'testAgentMessageHandler', function (payload) {

          console.log('Agent Message Received');
          console.log(payload);
          console.log(payload.topic);
          console.log(payload.data);

        });*/


        idle = $timeout(function() {
          MqService.sendIdle(AuthService.user(), MessageService.getConversationGuid());
        }, SystemConfigService.get('userIdleTime'));

        inactive = $timeout(function() {
          MqService.sendExtendedAway(AuthService.user(), MessageService.getConversationGuid());
        }, SystemConfigService.get('userInactiveTime'));


      });

      // Register Back button listener
      $rootScope.$on('user:navigate:back', function (e) {

        if ($location.path() === '/conversation/') {

          $timeout.cancel(idle);
          $timeout.cancel(inactive);
          MqService.sendLeaveScreen(AuthService.user(), MessageService.getConversationGuid());
          // MqService.removeHandler('message', 'testAgentMessageHandler');

          // csStropheService.removeHandler('conversationMessageHandler');
          // csStropheService.removeHandler('agentTypingMessageHandler');
        }

      });

      // Register Back button listener
      $rootScope.$on('user:presence:unavailable', function (e) {

        $timeout.cancel(idle);
        $timeout.cancel(inactive);

        MqService.sendLeaveScreen(AuthService.user(), MessageService.getConversationGuid());

        if (MqService.hasConnection()) {
          // MqService.removeHandler('message', 'testAgentMessageHandler');
          // csStropheService.removeHandler('conversationMessageHandler');
          // csStropheService.removeHandler('agentTypingMessageHandler');

        }

      });

      // Register end chat listener
      $rootScope.$on('user:conversation:resolved', function (e) {

        $timeout.cancel(idle);
        $timeout.cancel(inactive);

        MqService.sendEndChat(AuthService.user(), MessageService.getConversationGuid());

      });

      // register window blur handler
      $(window).on('blur', function(e) {
        if ($location.path() === '/conversation/') {
          // console.log('blur to other domain');
          // csStropheService.sendAppInBackground(AuthService.user());
        }
      });

      // register window. focus
      $('body').on('focus click', '#user-input', function(e) {
        if ($location.path() === '/conversation/') {


          // console.log('focus from other domain');
          MqService.sendAvailable(AuthService.user(), MessageService.getConversationGuid());


          $timeout.cancel(idle);
          $timeout.cancel(inactive);

          idle = $timeout(function() {
            MqService.sendIdle(AuthService.user(), MessageService.getConversationGuid());
            $('#user-input-field').blur();
          }, SystemConfigService.get('userIdleTime'));

          inactive = $timeout(function() {
            MqService.sendExtendedAway(AuthService.user(), MessageService.getConversationGuid());
            $('#user-input-field').blur();
          }, SystemConfigService.get('userInactiveTime'));
        }
      });

      $('body').on('keypress', '#user-input', function(e) {

        $timeout.cancel(idle);
        $timeout.cancel(inactive);

        idle = $timeout(function() {
          MqService.sendIdle(AuthService.user(), MessageService.getConversationGuid());
          $('#user-input-field').blur();
        }, SystemConfigService.get('userIdleTime'));

        inactive = $timeout(function() {
          MqService.sendExtendedAway(AuthService.user(), MessageService.getConversationGuid());
          $('#user-input-field').blur();
        }, SystemConfigService.get('userInactiveTime'));
      })
    }])

  // Register onclose listeners, funcs, etc
  .run([
    'MqService',
    'DeviceConfigService',
    '$window',
    'AuthService',
    '$location',
    '$rootScope',
    'AppState',
    'AppStateValues',
    'PostMessage',
    'SystemConfigService',
      'MessageService',
      '$timeout',
    function (MqService, DeviceConfigService, $window, AuthService, $location, $rootScope, AppState, AppStateValues, PostMessage, SystemConfigService, MessageService, $timeout) {

      // Disconnect from XMPP server on window close and refresh
      // I believe this sets presence to unavailable automatically
      // when a disconnect is signaled
      MqService.addHandler('close', 'onClose', function (payload) {
        if (AuthService.hasUser()) {
          AuthService.forceLogout();
        }

        PostMessage.send('MyTimeClose', null, PostMessage.parent(), SystemConfigService.get('parentDomain'));
      });


      window.onbeforeunload = window.onpagehide = function () {

        if (MqService.hasConnection()) {
          MqService.sendLeaveScreen(AuthService.user(), MessageService.getConversationGuid());
          // MqService.disconnect();
        }

        if (AuthService.hasUser()) {
          AuthService.forceLogout();
        }

        $timeout(function () {
          PostMessage.send('MyTimeClose', null, PostMessage.parent(), SystemConfigService.get('parentDomain'));
        }, 2000)
      };

  }])

  // Find a better way to redirect MAYBE???
  .run([
    '$rootScope',
    'AppState',
    'AppStateValues',
    'AuthService',
    'StateRouteAdapter',
    '$location',
    function($rootScope, AppState, AppStateValues, AuthService, StateRouteAdapter, $location) {

      $rootScope.$on('$routeChangeError', function (e, next, current, reject) {

        e.preventDefault();

        switch(reject) {

          case 'InvalidUser':

            $location.url(StateRouteAdapter(AppStateValues.ASV_LOGIN));
            break;

          case 'InvalidRoute':

            AppState.setStateAndRoute(AppStateValues.ASV_ERROR);
            break;
        }
      });

    }]);