'use strict';

/**
 * Register Service
 */
angular.module('MyTime.SystemConfig', [])
  .constant('ICON_SET', 'font-awesome')

  // Do not leave this blank.  PostMessage will not work.
  .constant('PARENT_DOMAIN', '${parentDomain}')
  .constant('STROPHE_URL', '${stropheUrl}')
  .constant('STROPHE_CHANNEL', 'web')
  .constant('COMPANY_GUID', '${companyGuid}')
  .constant('CS_PUBLIC_API_KEY', '${csPublicApiKey}')
  .constant('APP_VERSION', '1.0')
  .constant('SDK_VERSION', '2.5')
  .constant('MYTIME_ENDPOINT', '${mytimeEndpoint}')
    .constant('PRESENCE', 'mqtt')
    .constant('AWS_IOT_ENDPOINT', null)
    .constant('AWS_COGNITO_POOL_ID', null)
    .constant('AWS_REGION_NAME', null)
  .constant('XMPP_SERVER', null)
  .constant('IMAGES_PATH', 'images')
  .constant('ALLOWED_FILE_UPLOAD_TYPES', 'png,jpg,mp4,wav')
  .constant('ERROR_OVERLAY_ON', true)
  .constant('LOADING_OVERLAY_ON', true)
  .constant('MENU_ENABLED', true)
  .constant('CONVERSATION_ENABLED', true)
  .constant('SELF_SERVICE_ENABLED', true)
  .constant('ACTIVITY_LOG_ENABLED', true)
  .constant('NOTIFICATIONS_ENABLED', true)
  .constant('USER_PREFS_ENABLED', true)
  .constant('FAQ_ENABLED', true)
  .constant('ARTICLE_ENABLED', true)
  .constant('PRESENCE_TEST_HARNESS', false)
  .constant('USER_RESOLVE_ISSUE_ENABLED', true)
  .constant('USER_RESOLVE_ISSUE_BTN_TEXT', 'Resolve')
  .constant('FAQ_SERVER_SEARCH', false)

  // Self Service widget mode
  .constant('NATIVE_DEVICE', false)

  // Timeouts
  .constant('USER_IDLE_TIME', 600000)
  .constant('USER_INACTIVE_TIME', 900000)
  .constant('USER_PAUSED_TYPING_TIME', 3000)

  // Menu Icon Names
  .constant('CONVERSATION_MENU_ITEM_NAME', 'Customer Service')
  .constant('HISTORY_MENU_ITEM_NAME', 'Activity Log')
  .constant('NOTIFICATIONS_MENU_ITEM_NAME', 'Notifications')
  .constant('FAQ_MENU_ITEM_NAME', 'FAQs')
  .constant('SELF_SERVICE_MENU_ITEM_NAME', 'Customer Service')

  // We need to store the user locally.
  // This determines the place.
  // Values are 'sessionStorage', 'localStorage', 'cookie'
  // It will default to cookie if nothing is specified
  .constant('SESSION_MANAGEMENT', 'sessionStorage')

  // Display a survey when the chat is resolved by the user
  // This value is normally sent from the server during login and
  // will override and value set here
  .constant('SURVEY_ON_RESOLVE', false)

    // MomentJS is used to format the createdTStamp date property
    // in messages.  See momentjs.com for date format string examples
    .constant('MESSAGE_DATE_FORMAT', 'MMM D, h:mm A')

    // Defines the service worker script for browser notifications.  This is required
    .constant('BROWSER_NOTIFICATION_SERVICE_WORKER_SCRIPT', 'browser-notification-service-worker-script.js')

    // Defines icon for a browser notification.  This icon should be kept in the app/images folder or an
    // absolute url can be used.
    .constant('BROWSER_NOTIFICATION_ICON', 'images/ic-live-agent.png')

    // Defines the title of a browser notification
    .constant('BROWSER_NOTIFICATION_TITLE', 'MyTime Message Notification')

    // Set this true to truncate a notification message to 75 characters and appends an ellipses (...) to the end
    // of the truncated message.
    .constant('BROWSER_NOTIFICATION_MESSAGE_TRUNCATE', true)

    // Set vibrate property for browser notifications.  This will vibrate a phone if the browser and users
    // phone settings allow it to.  If the browser or users phone does not allow this option it will simply
    // be ignored
    .constant('BROWSER_NOTIFICATION_VIBRATE', true)

    // Set the require interaction property for browser notifications.  Setting to 'true' requires the user
    // to dismiss the message.  'False' will auto dismiss the message.  Keep in mind that a maximum number of
    // notifications to display at one time may be set by the browser manufacturer.  If more than the allotted
    // amount are currently shown excess messages will be queued to show after interaction.
    .constant('BROWSER_NOTIFICATION_REQUIRE_INTERACTION', false)


    // The default survey url is used to config a default endpoint for surveys.  This is just a guess at what may be
    // required for actual implementation.
    .constant('DEFAULT_SURVEY_URL', 'http://survey.vovici.com/se/705E3F05378F130B');



/**
 * Register Services
 */
angular.module('MyTime.SystemConfig')
    .service('SystemConfigService', [
        'ICON_SET',
        'PARENT_DOMAIN',
        'STROPHE_URL',
        'STROPHE_CHANNEL',
        'COMPANY_GUID',
        'CS_PUBLIC_API_KEY',
        'APP_VERSION',
        'SDK_VERSION',
        'MYTIME_ENDPOINT',
        'PRESENCE',
        'AWS_IOT_ENDPOINT',
        'AWS_COGNITO_POOL_ID',
        'AWS_REGION_NAME',
        'XMPP_SERVER',
        'IMAGES_PATH',
        'ALLOWED_FILE_UPLOAD_TYPES',
        'ERROR_OVERLAY_ON',
        'LOADING_OVERLAY_ON',
        'CONVERSATION_ENABLED',
        'SELF_SERVICE_ENABLED',
        'ACTIVITY_LOG_ENABLED',
        'NOTIFICATIONS_ENABLED',
        'USER_PREFS_ENABLED',
        'MENU_ENABLED',
        'FAQ_ENABLED',
        'ARTICLE_ENABLED',
        'PRESENCE_TEST_HARNESS',
        'USER_RESOLVE_ISSUE_ENABLED',
        'USER_RESOLVE_ISSUE_BTN_TEXT',
        'SESSION_MANAGEMENT',
        'USER_IDLE_TIME',
        'USER_INACTIVE_TIME',
        'USER_PAUSED_TYPING_TIME',
        'NATIVE_DEVICE',
        'FAQ_SERVER_SEARCH',
        'CONVERSATION_MENU_ITEM_NAME',
        'HISTORY_MENU_ITEM_NAME',
        'NOTIFICATIONS_MENU_ITEM_NAME',
        'FAQ_MENU_ITEM_NAME',
        'SELF_SERVICE_MENU_ITEM_NAME',
        'SURVEY_ON_RESOLVE',
        'MESSAGE_DATE_FORMAT',
        'BROWSER_NOTIFICATION_SERVICE_WORKER_SCRIPT',
        'BROWSER_NOTIFICATION_ICON',
        'BROWSER_NOTIFICATION_TITLE',
        'BROWSER_NOTIFICATION_MESSAGE_TRUNCATE',
        'BROWSER_NOTIFICATION_REQUIRE_INTERACTION',
        'DEFAULT_SURVEY_URL',
        function (ICON_SET,
                  PARENT_DOMAIN,
                  STROPHE_URL,
                  STROPHE_CHANNEL,
                  COMPANY_GUID,
                  CS_PUBLIC_API_KEY,
                  APP_VERSION,
                  SDK_VERSION,
                  MYTIME_ENDPOINT,
                  PRESENCE,
                  AWS_IOT_ENDPOINT,
                  AWS_COGNITO_POOL_ID,
                  AWS_REGION_NAME,
                  XMPP_SERVER,
                  IMAGES_PATH,
                  ALLOWED_FILE_UPLOAD_TYPES,
                  ERROR_OVERLAY_ON,
                  LOADING_OVERLAY_ON,
                  CONVERSATION_ENABLED,
                  SELF_SERVICE_ENABLED,
                  ACTIVITY_LOG_ENABLED,
                  NOTIFICATIONS_ENABLED,
                  USER_PREFS_ENABLED,
                  MENU_ENABLED,
                  FAQ_ENABLED,
                  ARTICLE_ENABLED,
                  PRESENCE_TEST_HARNESS,
                  USER_RESOLVE_ISSUE_ENABLED,
                  USER_RESOLVE_ISSUE_BTN_TEXT,
                  SESSION_MANAGEMENT,
                  USER_IDLE_TIME,
                  USER_INACTIVE_TIME,
                  USER_PAUSED_TYPING_TIME,
                  NATIVE_DEVICE,
                  FAQ_SERVER_SEARCH,
                  CONVERSATION_MENU_ITEM_NAME,
                  HISTORY_MENU_ITEM_NAME,
                  NOTIFICATIONS_MENU_ITEM_NAME,
                  FAQ_MENU_ITEM_NAME,
                  SELF_SERVICE_MENU_ITEM_NAME,
                  SURVEY_ON_RESOLVE,
                  MESSAGE_DATE_FORMAT,
                  BROWSER_NOTIFICATION_SERVICE_WORKER_SCRIPT,
                  BROWSER_NOTIFICATION_ICON,
                  BROWSER_NOTIFICATION_TITLE,
                  BROWSER_NOTIFICATION_MESSAGE_TRUNCATE,
                  BROWSER_NOTIFICATION_REQUIRE_INTERACTION,
                  DEFAULT_SURVEY_URL) {

            var systemConfig = {
                iconSet: ICON_SET,
                parentDomain: PARENT_DOMAIN,
                stropheUrl: STROPHE_URL,
                stropheChannel: STROPHE_CHANNEL,
                companyGuid: COMPANY_GUID,
                csPublicApiKey: CS_PUBLIC_API_KEY,
                appVersion: APP_VERSION,
                sdkVersion: SDK_VERSION,
                mytimeEndpoint: MYTIME_ENDPOINT,
                presence: PRESENCE,
                awsIotEndpoint: AWS_IOT_ENDPOINT,
                awsCognitoPoolId: AWS_COGNITO_POOL_ID,
                awsRegionName: AWS_REGION_NAME,
                xmppServer: XMPP_SERVER,
                imagesPath: IMAGES_PATH,
                allowedFileUploadTypes: ALLOWED_FILE_UPLOAD_TYPES,
                errorOverlayOn: ERROR_OVERLAY_ON,
                loadingOverlayOn: LOADING_OVERLAY_ON,
                conversationEnabled: CONVERSATION_ENABLED,
                selfServiceEnabled: SELF_SERVICE_ENABLED,
                activityLogEnabled: ACTIVITY_LOG_ENABLED,
                notificationsEnabled: NOTIFICATIONS_ENABLED,
                userPrefsEnabled: USER_PREFS_ENABLED,
                menuEnabled: MENU_ENABLED,
                faqEnabled: FAQ_ENABLED,
                articleEnabled: ARTICLE_ENABLED,
                presenceTestHarness: PRESENCE_TEST_HARNESS,
                userResolveIssueEnabled: USER_RESOLVE_ISSUE_ENABLED,
                userResolveIssueBtnText: USER_RESOLVE_ISSUE_BTN_TEXT,
                sessionManagement: SESSION_MANAGEMENT,
                userIdleTime: USER_IDLE_TIME,
                userInactiveTime: USER_INACTIVE_TIME,
                userPausedTypingTime: USER_PAUSED_TYPING_TIME,
                nativeDevice: NATIVE_DEVICE,
                faqServerSearch: FAQ_SERVER_SEARCH,
                conversationMenuItemName: CONVERSATION_MENU_ITEM_NAME,
                historyMenuItemName: HISTORY_MENU_ITEM_NAME,
                notificationsMenuItemName: NOTIFICATIONS_MENU_ITEM_NAME,
                faqMenuItemName: FAQ_MENU_ITEM_NAME,
                selfServiceMenuItemName: SELF_SERVICE_MENU_ITEM_NAME,
                surveyOnResolve: SURVEY_ON_RESOLVE,
                messageDateFormat: MESSAGE_DATE_FORMAT,
                browserNotificationServiceWorkerScript: BROWSER_NOTIFICATION_SERVICE_WORKER_SCRIPT,
                browserNotificationIcon: BROWSER_NOTIFICATION_ICON,
                browserNotificationTitle: BROWSER_NOTIFICATION_TITLE,
                browserNotificationMessageTruncate: BROWSER_NOTIFICATION_MESSAGE_TRUNCATE,
                browserNotificationRequireInteraction: BROWSER_NOTIFICATION_REQUIRE_INTERACTION,
                defaultSurveyUrl: DEFAULT_SURVEY_URL
            };

      this.get = function (configProp)
      {

          return this.getSystemConfigProperty(configProp);
      };

      this.getSystemConfigProperty = function (configProp)
      {

          if (systemConfig.hasOwnProperty(configProp)) {
            return systemConfig[configProp];
          }
      };

      this.set = function (configProp, value)
      {

          if (systemConfig.hasOwnProperty(configProp)) {
            systemConfig[configProp] = value;
          }
          else {
            // console.log(value);
            console.log('SystemConfigError: Requested config property "' + configProp + '" not found.');
          }
      };

  }]);