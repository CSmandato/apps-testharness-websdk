'use strict';

/**
 * @ngdoc function
 * @name csMobileWeb2App.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the csMobileWeb2App
 */
angular.module('csMobileWeb2App')
  .controller('LoginCtrl', [
    '$scope',
    '$location',
    'AuthService',
    'AppStateValues',
    'AppState',
    'StateRouteAdapter',
    'PostMessageData',
    'SystemConfigService',
    'AutoLoginService',
    'DeviceConfigService',
    'UserAttrsService',
    '$rootScope',
    'csStropheService',
      'MessageService',
      'MqService',
    function ($scope,
              $location,
              AuthService,
              AppStateValues,
              AppState,
              StateRouteAdapter,
              PostMessageData,
              SystemConfigService,
              AutoLoginService,
              DeviceConfigService,
              UserAttrsService,
              $rootScope,
              csStropheService,
              MessageService,
              MqService) {

      $scope.user = {
        firstName: '',
        addrEmail: ''
      };

      // Implicit vars defined for included directives
      // included in generic-header directive implicitly
      $scope.headerText = 'Login';

      $scope.btnEnable = {
        close: true,
        toggle: true
      };

      // Are we on a mobile device?
      $scope.mobile = DeviceConfigService.get('mobile');

      // Is everything loaded
      $scope.ready = false;

      // Login in progress flag
      $scope.loginInProgress = false;

      // Error message object
      $scope.error = {
        msg: ''
      };


      // PUBLIC API
      /**
       * Public implementation of the login function.
       *
       * Provides a place to validate any input data before passing to the
       * actual implementation of login.
       *
       * @param userLoginObj User data gathered from the login form
       */
      $scope.login = function (userLoginObj) {

        var result = UserAttrsService.validate(userLoginObj);

        if(result !== true) {
          $scope.error.msg = result.message;
          return;
        }

        $scope.error.msg = '';

        // Flag for login in progress
        $scope.loginInProgress = true;

        // create authentication login object
        var userAttrs = UserAttrsService.userAttrs(userLoginObj);

        // Set a user and start connection
        AuthService.login(userAttrs).then(
          function (result) {

            // Connect to the XMPP server
            // csStropheService.connect(result.jid + '/chat', 'mytime');
             MqService.init(result.userGuid, SystemConfigService.get('companyGuid'));

          },
            function (reject) {

              // Flag for login in progress
              $scope.loginInProgress = false;

              // Set error message
              $scope.error.msg = 'Login failed';

            }
        ).finally(function () {

        })
      };

      // MESSAGES
      $scope.$on('$routeChangeSuccess', function (e) {
        $scope.$emit('route:change', {route: 'login'});
      });

      $scope.$on('$routeChangeError', function (e) {
      });

      $scope.$on('mqservice:connecting', function (e) {});

      $rootScope.$on('mqservice:connected', function (e) {


        if (AppState.getState() === AppStateValues.ASV_LOGIN || AppState.getState() === 1) {

          $location.url(StateRouteAdapter(AppStateValues.ASV_MENU));
          return;
        }

        // Set history in browser to menu if we ane not already set there.
        // Do this so that hitting the back button from a direct launch to history/notfications/self-service
        // doesn't take us to the login screen.
        if (AppState.getState() != AppStateValues.ASV_MENU) {

          history.pushState(null, null, 'index.html#' + StateRouteAdapter(AppStateValues.ASV_MENU));
          history.pushState(null, null, 'index.html#' + StateRouteAdapter(AppState.getState()));
        }

        // Are we resuming a conversation
        if (AppState.getState() == AppStateValues.ASV_CONVERSATION) {

          // We are so we should have passed in a conversationGuid(cid) with our postMessage
          // MessageService.setConversationGuid(PostMessageData.getPostMessageData('MyTimeResumeConversation').cid);
        }

        // redirect and make sure our state is set
        AppState.setStateAndRoute(AppState.getState());

        $scope.$apply();

      });

      // WATCHERS
      $scope.$watch(function () {return AutoLoginService.user; }, function (n, o) {
        if (!n) return;
        $scope.login(n);
      });


    }])
  .controller('MenuCtrl', [
    '$scope',
    'MenuItem',
    'AppState',
    'AppStateValues',
    'IconProvider',
    '$location',
    'StateRouteAdapter',
    'resolveBadges',
    'SystemConfigService',
    'BadgeService',
    'DeviceConfigService',
    'AuthService',
    'FaqService',
    'MessageService',
    function ($scope,
              MenuItem,
              AppState,
              AppStateValues,
              IconProvider,
              $location,
              StateRouteAdapter,
              resolveBadges,
              SystemConfigService,
              BadgeService,
              DeviceConfigService,
              AuthService,
              FaqService,
              MessageService) {

      // Implicit vars defined for included directives
      // included in generic-header directive implicitly
      $scope.headerText = "Help";

      // Enable navbar buttons
      $scope.btnEnable = {
        close: true,
        toggle: true
      };

      $scope.menuItems = [];

      $scope.notificationBadge = resolveBadges;

      // Is this a mobile device
      $scope.mobile = DeviceConfigService.get('mobile');

      // Define Menu Items
      if (SystemConfigService.get('conversationEnabled')) {
        $scope.menuItems.push(new MenuItem(SystemConfigService.get('conversationMenuItemName'), AppStateValues.ASV_CONVERSATION, IconProvider.getIcon('conversation'), 0, 'btn-customer-service.png', SystemConfigService.get('conversationMenuItemName')));
      }

      if (SystemConfigService.get('notificationsEnabled')) {
        $scope.menuItems.push(new MenuItem(SystemConfigService.get('notificationsMenuItemName'), AppStateValues.ASV_NOTIFICATIONS, IconProvider.getIcon('notifications'), $scope.notificationBadge, 'btn-notifications.png', SystemConfigService.get('notificationsMenuItemName')));

      }

      if (SystemConfigService.get('activityLogEnabled')) {
        $scope.menuItems.push(new MenuItem(SystemConfigService.get('historyMenuItemName'), AppStateValues.ASV_HISTORY, IconProvider.getIcon('history'), 0, 'btn-activity-log.png', SystemConfigService.get('historyMenuItemName')));

      }

      if (SystemConfigService.get('faqEnabled')) {
        $scope.menuItems.push(new MenuItem(SystemConfigService.get('faqMenuItemName'), AppStateValues.ASV_FAQS, IconProvider.getIcon('faqs'), 0, 'btn-faqs.png', SystemConfigService.get('faqMenuItemName')));

      }


      $scope.changeRoute = function (menuItem) {

        menuItem = Object.prototype.toString.call(menuItem) === '[object Number]' ? menuItem : menuItem.state;

        if (menuItem === AppStateValues.ASV_CONVERSATION && MessageService.getConversationGuid() != null) {
          if (!confirm("Resume previous conversation?")) {
            MessageService.setConversationGuid(null);
          }
        }

        AppState.setStateAndRoute(menuItem);

        switch (menuItem) {
          case 1:
          case 2:
          case 4:
          case 8:
          case 16:
          case 32:
            break;
          case 64:
            FaqService.cacheSearch({text: null, results: null});
            break;
          case 256:
            break;
        }
      };

      // MESSAGES
      $scope.$on('new:message', function (e) {

        BadgeService.getBadgesFromServer().then(
          function (result) {

            // set the badge on notification menu item to the result
            $scope.menuItems[1].badge = result;
          },
          function (reject) {

            console.log(reject);
            // There was an error updating badges
          }
        );
      });

      $scope.$on('$routeChangeStart', function (e, next, current) {
        /*if ((AppState.getState() === AppStateValues.ASV_SELF_SERVICE) ||
            (AppState.getState() ===  AppStateValues.ASV_SELF_SERVING_CONTENT)) {
            MessageService.setConversationGuid(null);
        }*/
      });

      $scope.$on('$routeChangeSuccess', function (e) {
        $scope.$emit('route:change', {route: 'menu'});
      });

    }])
  .controller('ConversationCtrl', [
    '$scope',
    '$rootScope',
    '$interval',
    '$timeout',
    'AuthService',
    'AppState',
    'AppStateValues',
    'ArticleService',
    'StateRouteAdapter',
    'SystemConfigService',
    'DeviceConfigService',
    'MqService',
      '$location',
      'MessageService',
      'CalendarData',
      'BrowserNotificationService',
      'SurveyService',
    function ($scope,
              $rootScope,
              $interval,
              $timeout,
              AuthService,
              AppState,
              AppStateValues,
              ArticleService,
              StateRouteAdapter,
              SystemConfigService,
              DeviceConfigService,
              MqService,
              $location,
              MessageService,
              CalendarData,
              BrowserNotificationService,
              SurveyService) {

      function init() {

        switch(AppState.getState()) {

          case AppStateValues.ASV_SELF_SERVICE:

            $scope.appState = AppStateValues.ASV_SELF_SERVICE;
            $scope.headerText = "Self Service";
            $scope.showFooter = false;
            break;

          case AppStateValues.ASV_SELF_SERVING_CONTENT:

            $scope.appState = AppStateValues.ASV_SELF_SERVING_CONTENT;
            $scope.headerText = "Self Serving Content";
            $scope.showFooter = false;
            break;

          default:

            // For when we switch to single chat stream handler
            $scope.appState = AppStateValues.ASV_CONVERSATION;
            $scope.headerText = "Chat";
            $scope.showFooter = true;
        }

        setHeaderBtns();
        initBrowserNotifications();

        if (MessageService.getConversationGuid() == null) {
          $scope.startConversation();
        }
        else {
          $scope.resumeConversation();
        }
      }

      function setHeaderBtns() {

        switch(AppState.getState()) {

          case AppStateValues.ASV_SELF_SERVICE:

            // Enable navbar buttons
            // This is set and reset in the watcher for show prefs
            // they must match or it will get weird
            $scope.btnEnable = {
              close: true,
              resolve: false,
              toggle: true,
              back: true
            };
            break;

          case AppStateValues.ASV_SELF_SERVING_CONTENT:

            // Enable navbar buttons
            // This is set and reset in the watcher for show prefs
            // they must match or it will get weird
            $scope.btnEnable = {
              close: true,
              resolve: false,
              toggle: true,
              back: true,
              agentBtn: true
            };
            break;

          default:

            // Enable navbar buttons
            // This is set and reset in the watcher for show prefs
            // they must match or it will get weird
            $scope.btnEnable = {
              close: true,
              resolve: SystemConfigService.get('userResolveIssueEnabled'),
              toggle: true,
              back: true,
              print: true
            };
        }
      }

      function initBrowserNotifications() {

        if (!BrowserNotificationService.hasNotificationApi()) {
          return false;
          // alert('Your browser is old and out of date.  Update to a newer browser for a better experience.');
        }
        else if (!BrowserNotificationService.hasPermission()) {
          BrowserNotificationService.askPermission().then(
              function (result) {},
              function (reject) {}
          )
        }
      }

      function subscribeToTopic(companyGuid, conversationGuid) {
        MqService.subscribe(companyGuid, conversationGuid);
      }

      function addMqHandlers() {

        MqService.addHandler('message', 'agentTyping', function (payload) {

          if (payload.data.hasOwnProperty("type") && payload.data.type === 'indicator' && payload.data.actor === 'agent') {
            if (payload.data.show === 'composing') {
              $scope.$broadcast('agent:composing:message');
            }
            else if (payload.data.show === 'paused') {
              $scope.$broadcast('agent:paused:message');
            }
          }
        });
        MqService.addHandler('message', 'agentMessage', function (payload) {
          if (payload.data.hasOwnProperty("type") && payload.data.type === 'message' && payload.data.actor === 'agent') {
            MessageService.getMessages();
          }
        });
      }

      function removeMqHandlers() {

        MqService.removeHandler('message', 'agentTyping');
        MqService.removeHandler('message', 'agentMessage');
      }

      // Implicit vars defined for included directives
      // included in generic-header directive implicitly
      $scope.headerText = "";

      $scope.resolveBtnText = SystemConfigService.get('userResolveIssueBtnText');

      $scope.messages = [];

      $scope.user = AuthService.user();

      $scope.agentBtnText = 'Agent';

      $scope.showFooter = false;

      // Is this a mobile device
      $scope.mobile = DeviceConfigService.get('mobile');

      // what kind of device is this
      $scope.device = DeviceConfigService.get('device');

      $scope.startConversation = function () {

        $scope.$broadcast('message-list:loading', true);

        var conversationData = {};

        switch(AppState.getState()) {

          case AppStateValues.ASV_SELF_SERVICE:

            conversationData = {subject: 'Main Menu', userState: 'auto'};

            break;

          case AppStateValues.ASV_SELF_SERVING_CONTENT:

            conversationData = {subject: 'Demo Search', userState: 'auto'};
            break;

          default:

            // For when we switch to single chat stream handler
            conversationData = {userState: 'app2agent'};
        }

        MessageService.startConversation(conversationData).then(
            function (result) {

              // Set on scope so that it's available for template
              $scope.userState = MessageService.getConversationData().userState;
              addMqHandlers();
              subscribeToTopic($scope.user.companyGuid, MessageService.getConversationGuid());

              $scope.$broadcast('message-list:new-message', result);
            },
            function (reject) {

              console.log(reject);
            }

        ).finally(function () {

          $scope.$broadcast('message-list:loading', false);
        })
      };

      $scope.resumeConversation = function () {

        $scope.$broadcast('message-list:loading', true);
        MessageService.resumeConversation().then(
            function (result) {

              // Set on scope so that it's available for template
              $scope.userState = MessageService.getConversationData().userState;
              if ($scope.userState == 'live' || $scope.userState == 'app2agent') {
                $scope.headerText = "Chat";
                addMqHandlers();
                subscribeToTopic($scope.user.companyGuid, MessageService.getConversationGuid());
                MqService.sendOpenConversation(AuthService.user(), MessageService.getConversationGuid());
              }
              $scope.$broadcast('message-list:set-messages', result);
            },
            function (reject) {
              console.log(reject);
            }
        ).finally(function () {
          $scope.$broadcast('message-list:loading', false);
        });
      };

      $scope.agentButton = function () {

        MessageService.setConversationData({subject: 'Demo Search', userState: 'auto', statedata: ""});
        MessageService.postMessage('Agent', {id: 'Search Results', action: "response", input: "agent", articleId: "1"}, "application/vnd.cs.mobile.kb").then(
            function (result) {

              $rootScope.$broadcast('user-input:new:message', result);
            },
            function (reject) {

              console.log(reject);
            }
        )
      };

      $scope.getSurveyURL = function () {

        var conversationData = MessageService.getConversationData();

        if ( conversationData.stateData.hasOwnProperty('surveyURL')) {
          return  conversationData.stateData.surveyURL;
        }
        else {
          return false;
        }
      };

      // MESSAGES
      $scope.$on('user-input:user-input-focus', function (e) {

        $scope.$broadcast('message-list:scroll-content-bottom');
      });

      $scope.$on('user-input:new:message', function (e, data) {

        // Tell agent we've stopped typing
        MqService.sendTypingPaused(AuthService.user(), MessageService.getConversationGuid());

        // Set on scope so that it's available for template
        $scope.userState = MessageService.getConversationData().userState;

        // Switch header on state change
        if ($scope.userState == 'live' || $scope.userState == 'app2agent') {
          $scope.headerText = "Chat";

          $scope.btnEnable = {
            close: true,
            resolve: SystemConfigService.get('userResolveIssueEnabled'),
            toggle: true,
            back: true,
            print: true
          };

          $scope.showFooter = true;
        }

        $scope.$broadcast('message-list:new-message', data);
        MqService.sendUserMessage(AuthService.user(), MessageService.getConversationGuid(), data.messageText);
      });

      $scope.$on('message-service:new:message', function (e, data) {

        // Set on scope so that it's available for template
        $scope.userState = MessageService.getConversationData().userState;

        // Switch header on state change
        if ($scope.userState == 'live' || $scope.userState == 'app2agent') {
          $scope.headerText = "Chat";

          $scope.btnEnable = {
            close: true,
            resolve: SystemConfigService.get('userResolveIssueEnabled'),
            toggle: true,
            back: true,
            print: true
          };

          $scope.showFooter = true;
        }

        $scope.$broadcast('message-list:new-message', data);
      });

      $scope.$on('header:button:agent-chat', function (e) {

        $scope.agentButton();
      });

      $scope.$on('message-list:update-header-btns', function (e, data) {

        $scope.btnEnable = Object.assign($scope.btnEnable, data);
      });

      $scope.$on('header:button:resolve', function (e, data) {

        MessageService.resolveConversation().then(
          function (result) {

            $rootScope.$broadcast('user:conversation:resolved');
            MqService.sendUserMessage(AuthService.user(), MessageService.getConversationGuid(), 'Resolved');

            var surveyURL = $scope.getSurveyURL();

            if (surveyURL !== false) {
              SurveyService.setSurveyUrl(surveyURL);
              $location.url('/survey');
            }
            else {
              AppState.setStateAndRoute(AppStateValues.ASV_MENU);
            }
          },
          function (reject) {
            console.log(reject);
          }
        )
      });

      $scope.$on('header:button:back', function () {

        if ($location.search().previous == AppStateValues.ASV_HISTORY) {
          AppState.setStateAndRoute(AppStateValues.ASV_HISTORY);
        }
        else if ($location.search().previous == AppStateValues.ASV_NOTIFICATIONS) {
          AppState.setStateAndRoute(AppStateValues.ASV_NOTIFICATIONS);
        }
        else {
          AppState.setStateAndRoute(AppStateValues.ASV_MENU);
        }
      });

      $scope.$on('$routeChangeSuccess', function (e, next, previous) {

        $scope.$emit('route:change', {route: 'conversation'});

        //  $scope.stopOverlay();
      });

      $scope.$on('$routeChangeStart', function (e, next, current) {

        // @TODO: Fix this.  We use this to determine if we are trying to start a new ssc/ss from an existing but it's causing a new one to be started from the history list

        if (next.$$route.originalPath.indexOf(StateRouteAdapter(AppStateValues.ASV_SELF_SERVICE)) != -1 ||
            next.$$route.originalPath.indexOf(StateRouteAdapter(AppStateValues.ASV_SELF_SERVING_CONTENT)) != -1) {
          // MessageService.setConversationGuid(null);
        }

        if (next.$$route.originalPath.indexOf('/articles') != -1 && ($scope.userState != 'live' && $scope.userState != 'app2agent')) {
          $location.search('previous', AppStateValues.ASV_SELF_SERVING_CONTENT);
        }
      });

      $scope.$on('$destroy', function (e) {

        MqService.sendLeaveScreen($scope.user, MessageService.getConversationGuid());
        removeMqHandlers();
        MqService.unsubscribe($scope.user.companyGuid, MessageService.getConversationGuid());
      });

      // Init controller
      init();
    }
  ])
  .controller('NotificationPrefsOptInCtrl', ['$scope', '$location', 'AppState', 'AppStateValues', 'NotificationPreferencesService', 'StateRouteAdapter',  function ($scope, $location, AppState, AppStateValues, NotificationPreferencesService, StateRouteAdapter) {

      $scope.headerText = 'Notification Preferences';

      $scope.btnEnable = {
        close: true,
        toggle: true,
        back: true
      };

      $scope.$on('header:button:back', function (e, data) {
        $scope.$broadcast('preferences:close');

        var appState = AppState.getState();
        if (appState != AppStateValues.ASV_CONVERSATION && appState != AppStateValues.ASV_SELF_SERVING_CONTENT && appState != AppStateValues.ASV_SELF_SERVICE) {
          AppState.setStateAndRoute(AppStateValues.ASV_NOTIFICATIONS);
        }
        else {
          NotificationPreferencesService.showNotificationPreferences = false;
          $location.url(StateRouteAdapter(appState))
        }
      });

      $scope.$on('notification-prefs:save:success', function (e) {
        var appState = AppState.getState();
        if (appState != AppStateValues.ASV_CONVERSATION && appState != AppStateValues.ASV_SELF_SERVING_CONTENT && appState != AppStateValues.ASV_SELF_SERVICE) {
          AppState.setStateAndRoute(AppStateValues.ASV_NOTIFICATIONS);
        }
        else {
          NotificationPreferencesService.showNotificationPreferences = false;
          $location.url(StateRouteAdapter(appState))
        }
      })
    }])
  .controller('HistoryCtrl', [
    '$scope',
    'SystemConfigService',
    'DeviceConfigService',
      'StateRouteAdapter',
      'AppStateValues',
      'AppState',
      '$location',
    function ($scope,
              SystemConfigService,
              DeviceConfigService,
              StateRouteAdapter,
              AppStateValues,
              AppState,
              $location) {

      // Implicit vars defined for included directives
      // included in generic-header directive implicitly
      $scope.headerText = SystemConfigService.get('historyMenuItemName');

      $scope.btnEnable = {
        back: true,
        close: true,
        toggle: true
      };

      // Is this a mobile device
      $scope.mobile = DeviceConfigService.get('mobile');


      // MESSAGES

      $scope.$on('$routeChangeSuccess', function (e) {
        $scope.$emit('route:change', {route: 'history'});
        // $scope.stopOverlay();
      });

      $scope.$on('$locationChangeSuccess', function (e) {
        $location.search('previous', AppStateValues.ASV_HISTORY);
      });

      $scope.$on('$routeChangeStart', function (e) {

      });

      $scope.$on('header:button:back', function () {

          AppState.setStateAndRoute(AppStateValues.ASV_MENU);
      })
    }])
  .controller('NotificationsCtrl', [
    '$scope',
    '$location',
    'SystemConfigService',
    'DeviceConfigService',
      'StateRouteAdapter',
      'AppStateValues',
      'MessageService',
      'AppState',
    function ($scope,
              $location,
              SystemConfigService,
              DeviceConfigService,
              StateRouteAdapter,
              AppStateValues, MessageService, AppState) {

      // Implicit vars defined for included directives
      // included in generic-header directive implicitly
      $scope.headerText = SystemConfigService.get('notificationsMenuItemName');

      // Enable navbar buttons
      $scope.btnEnable = {
        back: true,
        close: true,
        toggle: true,
        prefs: SystemConfigService.get('userPrefsEnabled')
      };

      // Is this a mobile device
      $scope.mobile = DeviceConfigService.get('mobile');

      // Shoe preferences window
      $scope.showPreferences = false;

      $scope.resumeConversation = function (note) {
        MessageService.setConversationGuid(note.conversationGuid);
        AppState.setStateAndRoute(AppStateValues.ASV_CONVERSATION);
      };

      $scope.openNotification = function (notification) {

        // $scope.$emit('notification:open', notificationItem);

        switch(notification.notificationScope) {

          case 'Blast':
                $location.url('/notifications/' + notification.notificationGuid);
                break;

          case 'Individual':
                $location.url('/notifications/' + notification.notificationGuid);
                break;

          default:
                $scope.resumeConversation(notification);

        }
      };

      $scope.$on('$routeChangeSuccess', function (e) {
        $scope.$emit('route:change', {route: 'notifications'})
      });

      $scope.$on('$locationChangeSuccess', function (e) {
        $location.search('previous', AppStateValues.ASV_NOTIFICATIONS);
      });

      $scope.$on('$routeChangeStart', function (e, next, current) {

        var appState = AppState.getState();
        if (appState == AppStateValues.ASV_SELF_SERVICE || appState == AppStateValues.ASV_SELF_SERVING_CONTENT) {
          MessageService.setConversationGuid(null);
        }

      });

      $scope.$on('header:button:prefs', function () {

        AppState.setStateAndRoute(AppStateValues.ASV_PREFERENCES);
      });

      $scope.$on('header:button:back', function () {

        AppState.setStateAndRoute(AppStateValues.ASV_MENU);
      });

      $scope.$on('notification-item:open', function(e, notification) {

        notification.notificationState = 'Read';
        $scope.openNotification(notification)
      })

    }])
  .controller('BlastNotificationCtrl', [
    '$scope',
    'resolveNotification',
    'SystemConfigService',
    'DeviceConfigService',
      'AppState',
      'AppStateValues',
    function ($scope, resolveNotification, SystemConfigService, DeviceConfigService, AppState, AppStateValues) {

      // Implicit vars defined for included directives
      // included in generic-header directive implicitly
      $scope.headerText = "Notification";

      // Enable navbar buttons
      $scope.btnEnable = {
        back: true,
        closeChat: true,
        toggleChat: true
      };

      $scope.notification = resolveNotification;

      // Is this a mobile device
      $scope.mobile = DeviceConfigService.get('mobile');


      // MESSAGES

      $scope.$on('$routeChangeSuccess', function (e) {
        $scope.$emit('route:change', {route: 'blast-notifications'})

        // $scope.stopOverlay();
      });

      $scope.$on('$routeChangeError', function (e) {
      });

      $scope.$on('$routeChangeStart', function (e) {

      });

      $scope.$on('navbar:button:custom-back', function () {

        AppState.setStateAndRoute(AppStateValues.ASV_NOTIFICATIONS);
      })


    }])
  .controller('FaqArticlesCtrl', [
    '$scope',
    'resolveFaqArticles',
    'FaqService',
    '$routeParams',
    'SystemConfigService',
    'DeviceConfigService',
      '$window',
    function ($scope,
              resolveFaqArticles,
              FaqService,
              $routeParams,
              SystemConfigService,
              DeviceConfigService, $window) {

      // Implicit vars defined for included directives
      // included in generic-header directive implicitly
      $scope.headerText = SystemConfigService.get('faqMenuItemName');

      // Enable navbar buttons
      $scope.btnEnable = {
        back: true,
        close: true,
        toggle: true
      };

      $scope.faqArticleItems = resolveFaqArticles ? resolveFaqArticles : [];

      $scope.faqLabel = FaqService.getFaqLabel($routeParams.labelGuid);

      // Is this a mobile device
      $scope.mobile = DeviceConfigService.get('mobile');

      $scope.$on('header:button:back', function(e) {

        $window.history.back();
      })

    }])
  .controller('FaqArticleTextCtrl', [
    '$scope',
      '$window',
    'AuthService',
    'FaqService',
    '$routeParams',
    'SystemConfigService',
    'DeviceConfigService',
    function ($scope,
              $window,
              AuthService,
              FaqService,
              $routeParams,
              SystemConfigService,
              DeviceConfigService) {

      // Implicit vars defined for included directives
      // included in generic-header directive implicitly
      $scope.headerText = SystemConfigService.get('faqMenuItemName');

      // Enable navbar buttons
      $scope.btnEnable = {
        back: true,
        close: true,
        toggle: true
      };

      // Get the article with the param provided in the url
      $scope.faqArticle = FaqService.getFaqArticle($routeParams.articleGuid);

      $scope.$on('header:button:back', function(e) {

        $window.history.back();
      })

    }])
  .controller('FaqSmallCtrl', [
    '$scope',
    'FaqService',
    '$routeParams',
    'SystemConfigService',
    'DeviceConfigService',
      '$window',
    function ($scope,
              FaqService,
              $routeParams,
              SystemConfigService,
              DeviceConfigService, $window) {


      // Implicit vars defined for included directives
      // included in generic-header directive implicitly
      $scope.headerText = SystemConfigService.get('faqMenuItemName');

      // Enable navbar buttons
      $scope.btnEnable = {
        back: true,
        close: true,
        toggle: true
      };

      // Is this a mobile device
      $scope.mobile = DeviceConfigService.get('mobile');

      $scope.$on('header:button:back', function(e) {

        $window.history.back();
      })

    }
  ])
  .controller('FaqLargeCtrl', [
    '$scope',
    '$location',
    'SystemConfigService',
    'DeviceConfigService',
    'FaqService',
    'IconProvider',
    'FaqSearchService',
      '$window',
    function ($scope,
              $location,
              SystemConfigService,
              DeviceConfigService,
              FaqService,
              IconProvider,
              FaqSearchService, $window) {

      // Implicit vars defined for included directives
      // included in generic-header directive implicitly
      $scope.headerText = SystemConfigService.get('faqMenuItemName');

      // Enable navbar buttons
      $scope.btnEnable = {
        back: true,
        close: true,
        toggle: true
      };


      $scope.$on('$routeChangeSuccess', function (e) {
        $scope.$emit('route:change', {route: 'faqs'});
      });


      // Handle Header Buttons
      $scope.$on('header:button:back', function(e) {

        $window.history.back();
      })
    }
  ])
  .controller('ArticleCtrl', [
      '$scope',
      'ArticleService',
      'HistoryService',
      'AppStateValues',
      'AuthService',
      'AppState',
        '$routeParams',
        '$location',
        '$window',
        'StateRouteAdapter',
        'MessageService',
        'SystemConfigService',
      function ($scope, ArticleService, HistoryService, AppStateValues, AuthService, AppState, $routeParams, $location, $window, StateRouteAdapter, MessageService, SystemConfigService) {


        function resumeChat() {

          if ($location.search().previous == AppStateValues.ASV_SELF_SERVING_CONTENT) {

            AppState.setStateAndRoute(AppStateValues.ASV_SELF_SERVING_CONTENT);
          }
          else if ($location.search().previous == AppStateValues.ASV_SELF_SERVICE) {

            AppState.setStateAndRoute(AppStateValues.ASV_SELF_SERVICE);
          }
          else {

            AppState.setStateAndRoute(AppStateValues.ASV_CONVERSATION);
          }
        }

        function thumbsUp () {

          var obj = {
            id: "Search Results",
            action: "report",
            type: "positive",
            message: "Thumbs Up",
            articleId: ArticleService.getContentId()
          };


          MessageService.postMessage("Thumbs up", {id: "Search Results", action: "report", input: "positive", articleId: ArticleService.getContentId()}, 'application/vnd.cs.mobile.kb').then(
              function (result) {

                resumeChat();
              },
              function (reject) {

                resumeChat();
              }
          );
        };

        function thumbsDown () {
          var obj = {
            id: "Search Results",
            action: "report",
            type: "negative",
            message: "Thumbs Down",
            articleId: ArticleService.getContentId()
          };


          MessageService.postMessage("Thumbs down", {id: "Search Results", action: "report", input: "negative", articleId: ArticleService.getContentId()}, 'application/vnd.cs.mobile.kb').then(
              function (result) {

                resumeChat();
              },
              function (reject) {

                resumeChat();
              }
          );
        };

        AppState.setState(AppStateValues.ASV_ARTICLES);

        // Enable navbar buttons
        $scope.btnEnable = {
          close: true,
          toggle: true,
          resolve: true,
          back: true
        };

        $scope.loading = true;

        ArticleService.getArticleHtml($routeParams.articleId).then(function (data) {
          $scope.articleHtml = data;
          $scope.headerText = ArticleService.getTitle();
          $scope.loading = false;
        });

        $scope.resolveBtnText = SystemConfigService.get('userResolveIssueBtnText');

        $scope.$on('ssc-article-feedback-bar:thumbs-up', function (e, data) {

          thumbsUp();
        });

        $scope.$on('ssc-article-feedback-bar:thumbs-down', function (e, data) {

          thumbsDown();
        });

        $scope.$on('header:button:resolve', function (e, data) {

            MessageService.postMessage('Resolve', {id: 'Search Results', action: "response", input: "resolve", articleId: "1"}, "application/vnd.cs.mobile.kb").then(
                function (result) {

                  resumeChat();
                },
                function (reject) {

                  resumeChat();
                }
            )
          });

        $scope.$on('header:button:back', function () {

          resumeChat();
        });

    }])
  .controller('SurveyCtrl', ['$scope', '$location', 'AppStateValues', 'AppState', '$timeout', '$sce', 'SurveyService', 'SystemConfigService', function ($scope, $location, AppStateValues, AppState, $timeout, $sce, SurveyService, SystemConfigService) {

    // Implicit vars defined for included directives
    // included in generic-header directive implicitly
    $scope.headerText = 'Survey';

    $scope.btnEnable = {
      close: true,
      toggle: true,
      back: true
    };

    $scope.surveySrc = null;

    $scope.loadingSurvey = true;

    $scope.init = function() {

      SurveyService.getSurveyUrl().then(
          function (result) {

            $scope.surveySrc = $sce.trustAsResourceUrl(result);
          },
          function (reject) {


          }
      ).finally(
          function () {
            $scope.loadingSurvey = false;
          }
      )
    };

    $scope.init();

    $scope.$on('header:button:back', function () {

      if ($location.search().previous == AppStateValues.ASV_HISTORY) {
        AppState.setStateAndRoute(AppStateValues.ASV_HISTORY);
      }
      else if ($location.search().previous == AppStateValues.ASV_NOTIFICATIONS) {
        AppState.setStateAndRoute(AppStateValues.ASV_NOTIFICATIONS);
      }
      else {
        AppState.setStateAndRoute(AppStateValues.ASV_MENU);
      }
    });

  }])
  .filter('kbSearchAllFields', [function() {

    return function(items, search) {

      if (search== undefined || search.text == undefined || search.text == '' || search.text == null) {
        return items;
      }

      var filtered = [];

      angular.forEach(items, function (item) {
        if (item.title.toLowerCase().indexOf(search.text.toLowerCase())!= -1 || item.details.toLowerCase().indexOf(search.text.toLowerCase()) != -1) {
          filtered.push(item);
        }
      });

      return filtered;
    }
  }])

