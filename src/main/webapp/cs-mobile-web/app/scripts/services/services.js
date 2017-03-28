'use strict';

angular.module('MyTime.Services', ['ngCookies'])

    /**
     * Creates menu item objects for Menu directive
     */
    .factory('MenuItem', [
        'SystemConfigService',
        function (SystemConfigService) {

            return function (title, stateValue, icon, badge, img, imgAlt) {

                return {
                    title: title,
                    state: stateValue,
                    icon: icon,
                    badge: badge,
                    img: SystemConfigService.getSystemConfigProperty('imagesPath') + '/' + img || null,
                    imgAlt: imgAlt
                }
            }
        }])

    /**
     * AppStateValues Service
     *
     * Summary: Provides values for AppState for operations
     *
     * @return void
     *
     */
    .factory('AppStateValues', [
        function () {

            var LOGIN = 1,
                CONVERSATION = 2,
                NOTIFICATIONS = 4,
                HISTORY = 8,
                SELF_SERVICE = 16,
                MENU = 32,
                FAQS = 64,
                ERROR = 128,
                PT = 256,
                SELF_SERVING_CONTENT = 512,
                ARTICLES = 1024,
                PREFERENCES = 2048,
                SURVEY = 4096;

            return {
                ASV_LOGIN: LOGIN,
                ASV_CONVERSATION: CONVERSATION,
                ASV_NOTIFICATIONS: NOTIFICATIONS,
                ASV_HISTORY: HISTORY,
                ASV_SELF_SERVICE: SELF_SERVICE,
                ASV_MENU: MENU,
                ASV_FAQS: FAQS,
                ASV_ERROR: ERROR,
                ASV_PT: PT,
                ASV_SELF_SERVING_CONTENT: SELF_SERVING_CONTENT,
                ASV_ARTICLES: ARTICLES,
                ASV_PREFERENCES: PREFERENCES,
                ASV_SURVEY: SURVEY,
                fromString: function (input) {

                    switch (input) {

                        case 'ASV_LOGIN':
                            return this.ASV_LOGIN;

                        case 'ASV_CONVERSATION':
                            return this.ASV_CONVERSATION;

                        case 'ASV_NOTIFICATIONS':
                            return this.ASV_NOTIFICATIONS;

                        case 'ASV_HISTORY':
                            return this.ASV_HISTORY;

                        case 'ASV_SELF_SERVICE':
                            return this.ASV_SELF_SERVICE;

                        case 'ASV_MENU':
                            return this.ASV_MENU;

                        case 'ASV_FAQS':
                            return this.ASV_FAQS;

                        case 'ASV_ERROR':
                            return this.ASV_ERROR;

                        case 'ASV_PT':
                            return this.ASV_PT;

                        case 'ASV_SELF_SERVING_CONTENT':
                            return this.ASV_SELF_SERVING_CONTENT;

                        case 'ASV_ARTICLES':
                            return this.ASV_ARTICLES;

                        case 'ASV_PREFERENCES':
                            return this.ASV_PREFERENCES;


                        default:
                            return false;

                    }
                }
            }
        }])

    /**
     * AppState Service
     *
     * Summary: Sets/Stores Application State
     *
     */
    .service('AppState', [
        'AppStateValues',
        'StateRouteAdapter',
        '$location',
        '$route',
        '$rootScope',
        'MessageService',
        function (AppStateValues, StateRouteAdapter, $location, $route, $rootScope, MessageService) {

            // Alias for shortname
            var asv = AppStateValues;

            // Allowable states
            var stateMask = asv.ASV_LOGIN | asv.ASV_CONVERSATION | asv.ASV_NOTIFICATIONS | asv.ASV_HISTORY | asv.ASV_SELF_SERVICE | asv.ASV_MENU | asv.ASV_FAQS | asv.ASV_SELF_SERVING_CONTENT | asv.ASV_ARTICLES;

            // Current App state
            var currentState = asv.ASV_LOGIN;

            // Did we signal for a new conversation
            var newConversation = false;

            return {

                setState: function (stateValue) {

                    // Is this an allowable state value
                    if (!stateMask & stateValue) {
                        throw 'IllegalArgument: stateValue is invalid or not allowed.'
                    }

                    // Set state
                    currentState = stateValue;
                },

                setStateFromString: function (stateValue) {

                    // Get state value from a string
                    stateValue = asv.fromString(stateValue);

                    // Is this an allowable state value
                    if (!stateValue) {
                        throw 'IllegalArgument: stateValue is invalid.'
                    }

                    // If this is an allowable state
                    if (stateMask & stateValue) {

                        // Set state
                        currentState = stateValue;

                        // Store state
                        sessionStorage.setItem('state', parseInt(stateValue));
                    }
                },

                setStateFromObject: function (stateValue) {

                    if (!stateValue.hasOwnProperty('state')) {
                        throw 'IllegalArgument stateValue Object does not contain property \'state\'.'
                    }

                    // Is this an allowable state value
                    if (!stateMask & stateValue.state) {
                        throw 'IllegalArgument stateValue is invalid.'
                    }

                    // Set state
                    currentState = stateValue.state;

                    // Store state
                    sessionStorage.setItem('state', parseInt(stateValue.state));

                },

                setStateAndRoute: function (stateValue) {

                    var oldState = angular.copy(currentState);

                    if (Object.prototype.toString.call(stateValue) === '[object String]') {

                        if (stateValue.indexOf(':NEW') >= 0) {
                            newConversation = true;
                            stateValue = stateValue.split(':')[0];
                        }

                        // Get state value from a string
                        stateValue = asv.fromString(stateValue);

                        // Is this an allowable state value
                        if (!stateValue) {
                            throw 'IllegalArgument stateValue is invalid.'
                        }

                        // If this is an allowable state
                        if (stateMask & stateValue) {

                            // Set state
                            currentState = stateValue;

                            // Store state
                            sessionStorage.setItem('state', parseInt(stateValue));
                        }
                    }
                    else if (Object.prototype.toString.call(stateValue) === '[object Object]') {

                        // Check for state property
                        if (!stateValue.hasOwnProperty('state')) {
                            throw 'IllegalArgument stateValue Object does not contain property \'state\'.'
                        }

                        // if that property is a string
                        if (Object.prototype.toString.call(stateValue.state) === '[object String]') {

                            if (stateValue.state.indexOf(':NEW') >= 0) {
                                newConversation = true;
                                stateValue.state = stateValue.state.split(':')[0];
                            }

                            // Get state value from a string
                            stateValue.state = asv.fromString(stateValue.state);

                            // Is this an allowable state value
                            if (!stateValue.state) {
                                throw 'IllegalArgument stateValue is invalid.'
                            }

                            // If this is an allowable state
                            if (stateMask & stateValue.state) {

                                // Set state
                                currentState = stateValue.state;

                                // Store state
                                sessionStorage.setItem('state', parseInt(stateValue.state));
                            }
                        }
                    }

                    else {

                        // Is this an allowable state value
                        if (!stateMask & stateValue) {

                            throw 'IllegalArgument stateValue is invalid.'
                        }

                        // Set state
                        currentState = stateValue;

                        // Store state
                        sessionStorage.setItem('state', parseInt(stateValue));
                    }

                    if (newConversation) {
                        MessageService.setConversationGuid(null);
                        newConversation = false;
                    }

                    if (currentState != AppStateValues.ASV_CONVERSATION) {
                        $rootScope.$broadcast('user:presence:unavailable');
                    }

                    // Check for route handled by the same controller
                    if ((oldState == AppStateValues.ASV_SELF_SERVICE && currentState == AppStateValues.ASV_SELF_SERVING_CONTENT) || (oldState == AppStateValues.ASV_SELF_SERVICE && currentState == AppStateValues.ASV_SELF_SERVICE) ||
                        (oldState == AppStateValues.ASV_SELF_SERVING_CONTENT && currentState == AppStateValues.ASV_SELF_SERVICE) || (oldState == AppStateValues.ASV_SELF_SERVING_CONTENT && currentState == AppStateValues.ASV_SELF_SERVING_CONTENT)) {
                        $location.search('previous', '');
                        // $location.url(StateRouteAdapter(this.getState()));
                        $route.reload();
                    }
                    else {
                        $location.url(StateRouteAdapter(this.getState()));
                    }


                },

                getState: function () {

                    return currentState;
                }
            }
        }])

    /**
     * StateRouteAdapter
     *
     * Maps states to routes
     *
     */
    .service('StateRouteAdapter', [
        'SystemConfigService',
        'AppStateValues',
        function (SystemConfigService, AppStateValues) {

            // Alias
            var asv = AppStateValues;


            return function (stateValue) {

                switch (stateValue) {

                    case asv.ASV_LOGIN:
                        return '/login';

                    case asv.ASV_CONVERSATION:
                    case asv.ASV_SELF_SERVICE:
                    case asv.ASV_SELF_SERVING_CONTENT:
                        return '/conversation';

                    case asv.ASV_NOTIFICATIONS:
                        return '/notifications';

                    case asv.ASV_HISTORY:
                        return '/history';

                    case asv.ASV_FAQS:
                        return SystemConfigService.get('faqServerSearch') ? '/faq-large' : '/faq-small';

                    case asv.ASV_ERROR:
                        return '/error';

                    case asv.ASV_MENU:
                        return '/';

                    case asv.ASV_PT:
                        return '/presence-testing';

                    case asv.ASV_PREFERENCES:
                        return '/notification-preferences-opt-in';

                    default:

                        return '/'
                }
            }
        }])

    /**
     * Provides Proper icon classes
     */
    .service('IconProvider', [
        'SystemConfigService',
        function (SystemConfigService) {

            var icons = {

                'bootstrap': {
                    'conversation': 'glyphicon glyphicon-trash',
                    'history': 'glyphicon glyphicon-trash',
                    'notifications': 'glyphicon glyphicon-trash',
                    'faqs': 'glyphicon glyphicon-trash',
                    'self-service': 'glyphicon glyphicon-trash',
                    'back': 'glyphicon glyphicon-trash',
                    'resolve-chat': 'glyphicon glyphicon-trash',
                    'hide-chat': 'glyphicon glyphicon-trash',
                    'show-chat': 'glyphicon glyphicon-trash',
                    'close-chat': 'glyphicon glyphicon-trash',
                    'read-notifications': 'glyphicon glyphicon-trash',
                    'unread-notifications': 'glyphicon glyphicon-trash',
                    'faq-label': 'glyphicon glyphicon-trash',
                    'faq-article': 'glyphicon glyphicon-trash',
                    'faq-more': 'glyphicon glyphicon-trash',
                    'user-prefs': 'glyphicon glyphicon-trash',
                    'parent-window': 'glyphicon glyphicon-trash'
                },
                'font-awesome': {
                    'conversation': 'fa fa-trash fa-fw',
                    'history': 'fa fa-trash fa-fw',
                    'notifications': 'fa fa-trash fa-fw',
                    'faqs': 'fa fa-trash fa-fw',
                    'self-service': 'fa fa-trash fa-fw',
                    'back': 'fa fa-reply fa-fw',
                    'resolve-chat': 'fa fa-times fa-fw',
                    'hide-chat': 'fa fa-chevron-down fa-fw',
                    'show-chat': 'fa fa-chevron-up fa-fw',
                    'close-chat': 'fa fa-times fa-fw',
                    'read-notifications': 'fa fa-plus-circle fa-fw',
                    'unread-notifications': 'fa fa-minus-circle fa-fw',
                    'faq-label': 'fa fa-folder-open fa-fw',
                    'faq-article': 'fa fa-folder-open fa-fw',
                    'faq-more': 'fa fa-angle-right fa-fw',
                    'user-prefs': 'fa fa-cog fa-fw',
                    'parent-window': 'fa fa-caret-square-o-up',
                    'agent-chat': 'fa fa-cog fa-fw'
                }
            };

            return {

                // Retrieves the proper class for an Icon element
                getIcon: function (icon) {

                    // Get the icon set specified in the System Config
                    var ICON_SET = SystemConfigService.getSystemConfigProperty('iconSet');

                    // Check that we have that icon set and that we have that icon
                    if (icons.hasOwnProperty(ICON_SET) && icons[ICON_SET].hasOwnProperty(icon)) {

                        // return that icon
                        return icons[ICON_SET][icon];
                    }

                    // Failed
                    throw "IllegalArgument:" + icon + " icon not found.";
                }
            }
        }])

    /**
     * Login/Logout from CS
     */
    .service('AuthService', [
        'SystemConfigService',
        '$http',
        '$q',
        '$cookieStore',
        function (SystemConfigService, $http, $q, $cookieStore) {

            // Storage place for current user
            var currentUser = false;

            // Creates a Login object
            var LoginObj = function (userAttrs) {

                // add any validation or overrides
                return {
                    companyGuid: SystemConfigService.get('companyGuid'),
                    csApiKey: SystemConfigService.get('csPublicApiKey'),
                    deviceId: "web",
                    deviceMake: '',
                    deviceModel: '',
                    deviceOS: '',
                    deviceVersion: "",
                    appVersion: SystemConfigService.get('appVersion'),
                    sdkVersion: SystemConfigService.get('sdkVersion'),
                    channel: SystemConfigService.get('stropheChannel'),
                    presence: SystemConfigService.get('presence'),
                    userAttrs: userAttrs
                }
            }

            // Creates a currentUser
            var CurrentUser = function (loginObj, sessionGuid, userGuid) {

                var userObj = angular.fromJson(angular.copy(loginObj));
                userObj['userGuid'] = userGuid;
                userObj['sessionGuid'] = sessionGuid;
                userObj['jid'] = userGuid + '@' + SystemConfigService.get('xmppServer');
                userObj['jid'].toLowerCase();
                return userObj;
            }

            return {

                // Login function
                login: function (loginOptions) {

                    var loginObj = null,

                    // Create promise object
                        defer = $q.defer();

                    // create a loginObj and stringify it for POST
                    loginObj = angular.toJson(new LoginObj(loginOptions));

                    // Make http request
                    $http.post(SystemConfigService.get('mytimeEndpoint') + '/login.json', loginObj).then(
                        // Success
                        function (result) {

                            // Check for state data
                            if (result.data.hasOwnProperty('stateData') && result.data.stateData) {



                                // We have state data lets make a js obj
                                var stateData = angular.fromJson(result.data.stateData);

                                // Set xmpp chat server name
                                /*if (stateData.hasOwnProperty('chatServerName')) {
                                    SystemConfigService.set('xmppServer', stateData.chatServerName);
                                }*/

                                if (stateData.hasOwnProperty('awsIotEndpoint')) {
                                    SystemConfigService.set('awsIotEndpoint', stateData.awsIotEndpoint);
                                }

                                if (stateData.hasOwnProperty('awsCognitoPoolId')) {
                                    SystemConfigService.set('awsCognitoPoolId', stateData.awsCognitoPoolId);
                                }

                                if (stateData.hasOwnProperty('awsRegionName')) {
                                    SystemConfigService.set('awsRegionName', stateData.awsRegionName);
                                }

                                // set survey config var
                                if (stateData.hasOwnProperty('surveyOnResolve')) {
                                    SystemConfigService.set('surveyOnResolve', true);
                                }
                            }

                            // Store new CurrentUser object
                            currentUser = new CurrentUser(loginObj, result.data.sessionGuid, result.data.userGuid);

                            // @TODO: Still working on being able to refresh and reattach to strophe
                            sessionStorage.setItem('MyTimeUser', angular.toJson(currentUser));

                            // resolve promise
                            defer.resolve(currentUser);
                        },

                        // Error
                        function (reject) {

                            // throw error
                            defer.reject('There was an error during login.')
                        });

                    // Success.  Return the promise
                    return defer.promise;
                },

                // clear associated user data
                forceLogout: function () {


                    switch (SystemConfigService.get('sessionManagement')) {

                        case 'sessionStorage':
                            sessionStorage.getItem('MyTimeUser');
                            break;

                        case 'localStorage':
                            localStorage.removeItem('MyTimeUser');
                            break;

                        default:
                            $cookieStore.remove('MyTimeUser');
                    }

                    // sessionStorage.setItem('currentUser', null);
                    currentUser = false;
                },

                // DUPLICATE: clear associated user data
                logout: function () {

                    // sessionStorage.setItem('currentUser', null);
                    currentUser = false;
                },

                // Retrieve current user object
                user: function () {

                    // Check both places for a current user
                    // @TODO:: Watch this.  May need to pull from storage, check, and then convert
                    if (!currentUser) {
                        return false;
                    }

                    if (!currentUser) {
                        currentUser = angular.fromJson(sessionStorage.getItem('MyTimeUser'));
                    }
                    return currentUser;
                },

                // Do we have a user true/false
                hasUser: function () {
                    return Object.prototype.toString.call(this.user()) === '[object Object]';
                },

                // If we got a user from elsewhere (like sessionStorage during a page refresh)
                // set them
                setUser: function (aUser) {

                    currentUser = aUser;
                },

                // Sets current user conversation Guid
                setConversationGuid: function (guid) {

                    if (!currentUser) {
                        throw "IllegalAssignment: No current user for conversation guid assingment.";
                    }

                    currentUser['conversationGuid'] = guid;
                },

                // Sets current user conversation type
                setConversationType: function (type) {

                    if (!currentUser) {
                        throw "IllegalAssignment: No current user for conversation type assingment.";
                    }

                    currentUser['conversationType'] = type;
                },

                // Gets a user attr
                getUserAttr: function (attr) {

                    return currentUser.userAttrs.hasOwnProperty(attr) ? currentUser.userAttrs[attr] : null;
                }
            }
        }])

    /**
     * Facilitates the retrieval of notifications.
     */
    .service('__NotificationService', [
        'SystemConfigService',
        '$http',
        'AuthService',
        '$q',
        function (SystemConfigService, $http, AuthService, $q) {


            var notifications = [];

            function setNotifications(notes) {
                notifications = notes
            }

            function getNotifications() {
                return notifications;
            }

            return {

                getNotificationsFromServer: function () {

                    var currentUser = AuthService.user(),
                        defer = $q.defer();


                    $http.get(SystemConfigService.getSystemConfigProperty('mytimeEndpoint') + "/session/" + currentUser.sessionGuid + "/notification.json").then(
                        function (result) {

                            setNotifications(result.data);
                            defer.resolve(getNotifications());
                        },
                        function (reject) {
                            defer.reject("Unable to retrieve notifications.");
                            // Handle notifications rejection
                        });

                    return defer.promise;
                },

                getNotifications: function () {

                    return getNotifications();
                },

                getNotification: function (noteGuid) {

                    var defer = $q.defer(),
                        found = false;

                    angular.forEach(notifications, function (note) {

                        if (note.notificationGuid === noteGuid) {
                            found = note;
                            defer.resolve(note);
                        }
                    });


                    if (!found) {
                        defer.reject(false);
                    }

                    return defer.promise;
                }
            }
        }])

    /**
     * Facilitates the retrieval of FAQs
     */
    .service('FaqService', [
        'SystemConfigService',
        'AuthService',
        '$http',
        '$q',
        function (SystemConfigService, AuthService, $http, $q) {

            var faqLabels = [],
                faqArticles = null,
                faqText = null,
                faqSearchText = null;

            function setFaqLabels(inFaqLabels) {

                faqLabels = inFaqLabels;
            }

            function setFaqArticles(inFaqArticles) {

                faqArticles = inFaqArticles;
            }

            function setFaqText(inFaqText) {

                faqArticles = inFaqText;
            }

            function getFaqLabels() {

                return faqLabels;
            }

            function getFaqLabel(labelGuid) {

                var i = 0;

                while (i < faqLabels.length) {

                    if (faqLabels[i].labelGuid === labelGuid) {
                        return faqLabels[i];
                    }

                    i++;
                }

                throw 'IllegalArgument: Faq Label with guid ' + labelGuid + ' not found.';
            }

            function getFaqArticles() {

                return faqArticles;
            }

            function getFaqArticle(articleGuid) {

                var articles = getFaqArticles(),
                    i = 0;

                while (i < articles.length) {

                    if (articles[i].articleGuid === articleGuid) {
                        return articles[i]
                    }

                    i++
                }

                return false;
            }

            return {

                getFaqLabelsFromServer: function () {

                    var defer = $q.defer(),
                        currentUser = AuthService.user();

                    $http.get(SystemConfigService.getSystemConfigProperty('mytimeEndpoint') + "/session/" + currentUser.sessionGuid + "/kb/label.json").then(
                        function (result) {

                            setFaqLabels(result.data);
                            defer.resolve(getFaqLabels());
                        },
                        function (reject) {
                            defer.reject("Unable to retrieve FAQ's from the the server.");

                        });

                    return defer.promise;

                },

                getAllFaqArticlesFromServer: function () {

                    var defer = $q.defer(),
                        currentUser = AuthService.user();

                    $http.get(SystemConfigService.getSystemConfigProperty('mytimeEndpoint') + "/session/" + currentUser.sessionGuid + "/kb/article.json").then(
                        function (result) {

                            setFaqArticles(result.data);
                            defer.resolve(getFaqLabels());
                        },
                        function (reject) {
                            defer.reject("Unable to retrieve FAQ's from the the server.");

                        });

                    return defer.promise;
                },

                getFaqLabels: function () {
                    return getFaqLabels()
                },

                getFaqLabel: function (labelGuid) {

                    return getFaqLabel(labelGuid);

                },

                getFaqArticlesFromServer: function (labelGuid) {

                    var defer = $q.defer(),
                        currentUser = AuthService.user();

                    $http.get(SystemConfigService.getSystemConfigProperty('mytimeEndpoint') + "/session/" + currentUser.sessionGuid + "/kb/label/" + labelGuid + "/article.json").then(
                        function (result) {

                            setFaqArticles(result.data);
                            defer.resolve(getFaqArticles());
                        },
                        function (reject) {
                            defer.reject("Unable to retrieve FAQ Articles from the the server.");

                        });

                    return defer.promise;
                },

                getFaqArticle: function (articleGuid) {

                    return getFaqArticle(articleGuid)
                },

                setFaqArticle: function (article) {

                    if (!getFaqArticle(article.articleGuid)) {
                        faqArticles.push(article);
                    }
                },

                setFaqArticles: function (articles) {
                    faqArticles = articles;
                },

                getCachedFaqArticles: function () {

                    return getFaqArticles();
                },

                cacheSearch: function (searchObj) {
                    faqSearchText = searchObj.text;
                    faqArticles = searchObj.results;
                },

                getCachedSearchText: function () {
                    return faqSearchText;
                }
            }
        }])

    /**
     * Retrieves badges
     */
    .service('BadgeService', [
        'SystemConfigService',
        '$q',
        '$http',
        'AuthService',
        function (SystemConfigService, $q, $http, AuthService) {

            var badge = null;

            function getBadge() {
                return badge;
            }

            function setBadge(inBadge) {

                badge = inBadge;
            }

            return {

                getBadgesFromServer: function () {

                    var defer = $q.defer(),
                        currentUser = AuthService.user();

                    $http.get(SystemConfigService.getSystemConfigProperty('mytimeEndpoint') + "/session/" + currentUser.sessionGuid + "/badge.json?unread=1").then(
                        function (result) {

                            setBadge(result.data.message + result.data.alert);
                            defer.resolve(getBadge());

                        },
                        function (reject) {
                            defer.reject('unable to retrieve notification badge number.');
                        });


                    return defer.promise;
                },

                getBadge: function () {
                    return getBadge();
                }
            }
        }])

    .service('ArticleService', ['SystemConfigService', 'AuthService', 'MessageService', '$http', '$q', function (SystemConfigService, AuthService, MessageService, $http, $q) {

        var contentId;
        var title;
        var isResponded;

        return {

            setTitle: function (t) {
                title = t;
            },

            getTitle: function () {
                return title;
            },

            setContentId: function (id) {
                contentId = id;
            },

            getContentId: function () {
                return contentId;
            },

            setResponded: function (bool) {
                isResponded = bool;
            },

            isResponded: function () {
                return isResponded;
            },

            parseTitle: function (data) {

                title = data.substr(data.indexOf('<title>') + 7, data.indexOf('</title>') - 34);
            },

            getArticleHtml: function (_contentId) {

                var defer = $q.defer(),
                    currentUser = AuthService.user(),
                    self = this,
                    conversationGuid = MessageService.getConversationGuid();

                $http.get(SystemConfigService.getSystemConfigProperty('mytimeEndpoint') + "/session/" + currentUser.sessionGuid + "/conversation/" + conversationGuid + "/content/" + _contentId + ".html").then(
                    function (result) {

                        contentId = _contentId;
                        self.parseTitle(result.data);
                        defer.resolve(result.data);
                    },
                    function (reject) {

                        defer.reject(reject);
                    });

                return defer.promise;
            }
        }
    }])

    .service('CalendarData', [
        function () {

            var maxDate = '',
                minDate = '';


            return {

                init: function (calendarData) {
                    minDate = new Date(calendarData.rangeDate[0]);
                    maxDate = new Date(calendarData.rangeDate[1]);
                    $('#calendar').fullCalendar('render');
                },

                eventSource: {
                    url: "http://www.google.com/calendar/feeds/usa__en%40holiday.calendar.google.com/public/basic",
                    className: 'gcal-event', // an option!
                    currentTimezone: 'America/Chicago' // an option!
                },

                /* event source that contains custom events on the scope */
                events: [],

                /* event source that calls a function on every view switch */
                eventsF: function (start, end, timezone, callback) {
                    var s = new Date(start).getTime() / 1000;
                    var e = new Date(end).getTime() / 1000;
                    var m = new Date(start).getMonth();
                    var events = [
                        {
                            title: 'Feed Me ' + m,
                            start: s + (50000),
                            end: s + (100000),
                            allDay: false,
                            className: ['customFeed']
                        }
                    ];
                    callback(events);
                },

                eventSources: [this.eventSource],


                // calendar config
                uiConfig: {
                    calendar: {
                        height:339,
                        editable: true,
                        events: [],
                        header: {
                            left: 'title',
                            center: '',
                            right: 'prev,next'
                        },
                        dayClick: null,
                        dayRender: function (date, cell) {
                            if (date < new Date(minDate)) {
                                $(cell).addClass('date-disabled');
                            }

                            if (date > new Date(maxDate)) {
                                $(cell).addClass('date-disabled');
                            }
                        },
                        viewRender: function (currentView) {

                            if (minDate) {
                                $('[data-date="' + moment(minDate).format('YYYY-MM-DD') + '"').addClass('cs-selected-date')
                            }

                            if (minDate >= currentView.start && minDate <= currentView.end) {
                                $(".fc-button-prev").prop('disabled', true);
                                $(".fc-button-prev").addClass('fc-state-disabled');
                            }
                            else {
                                $(".fc-button-prev").removeClass('fc-state-disabled');
                                $(".fc-button-prev").prop('disabled', false);
                            }
                            // Future
                            if (maxDate >= currentView.start && maxDate <= currentView.end) {
                                $(".fc-button-next").prop('disabled', true);
                                $(".fc-button-next").addClass('fc-state-disabled');
                            } else {
                                $(".fc-button-next").removeClass('fc-state-disabled');
                                $(".fc-button-next").prop('disabled', false);
                            }
                        }
                    }
                }
            }
        }])

    /**
     * Facilitates User Preferences to conversation notifications
     */
    .service('NotificationPreferencesService', [
        'AuthService',
        'SystemConfigService',
        '$http',
        '$q',
        function (AuthService, SystemConfigService, $http, $q) {

            var data = [
                {"category": "OPT_IN", "name": "Email", "value": "true"},
                {"category": "OPT_IN", "name": "SMS", "value": "false"}
            ];

            var hasPrefs = false;

            return {

                showNotificationPreferences: true,

                hasPreferences: function () {

                    return hasPrefs;
                },

                getPrefContactValue: function (prefs, prop) {

                    var value = false,
                        i = 0;

                    while (i < prefs.length && !value) {

                        if (prefs[i].hasOwnProperty('category') && prefs[i].category === "contact") {

                            if (prefs[i].name.toLowerCase() === prop.toLowerCase()) {
                                value = prefs[i].value;
                            }
                        }

                        i++;
                    }

                    return value;
                },

                getPrefOptInValue: function (prefs, prop) {

                    var value = false;

                    angular.forEach(prefs, function (pref) {

                        if (pref.category === "OPT_IN") {

                            if (pref.name.toLowerCase() === prop.toLowerCase()) {

                                value = pref.value === "true";
                            }
                        }
                    });

                    return value;
                },

                getPreferences: function () {

                    var currentUser = AuthService.user(),
                        defer = $q.defer();

                    $http.get(SystemConfigService.getSystemConfigProperty('mytimeEndpoint') + '/session/' + currentUser.sessionGuid + '/preferences.json').then(
                        function (result) {

                            if (result.data.length === 2) {

                                hasPrefs = false;
                                var arr = data.concat(result.data);
                                data = arr;
                                defer.resolve(arr);
                            }

                            else {

                                hasPrefs = true;
                                data = result.data;
                                defer.resolve(result.data);
                            }
                        },

                        function (reject) {

                            // defer.reject(reject);
                        }
                    );

                    return defer.promise;
                },

                setPreferences: function (prefs) {

                    var currentUser = AuthService.user(),
                        defer = $q.defer();

                    $http.post(SystemConfigService.getSystemConfigProperty('mytimeEndpoint') + '/session/' + currentUser.sessionGuid + '/preferences.json', angular.toJson(prefs)).then(
                        function (result) {

                            hasPrefs = true;
                            data = prefs;
                            defer.resolve(result);
                        },

                        function (reject) {

                            // defer.reject(reject);
                        }
                    );

                    return defer.promise;
                },

                getPrefsFromStore: function () {

                    return data;
                }
            }
        }])

    /**
     * Facilitates User Auto Login feature
     */
    .service('AutoLoginService', [
        '$location',
        'DeviceConfigService',
        'AuthService',
        'AppState',
        'AppStateValues',
        'PostMessage',
        'SystemConfigService',
        function ($location, DeviceConfigService, AuthService, AppState, AppStateValues, PostMessage, SystemConfigService) {

            return {
                user: null,
                setUser: function (user) {
                    this.user = user;
                },
                logout: function () {

                    if (window.close() === undefined) {

                        PostMessage.send('MyTimeClose', null, PostMessage.parent(), SystemConfigService.get('parentDomain'));

                        if (AuthService.user()) {
                            AuthService.logout();
                            this.user = false;
                        }

                        if (csStropheService.hasConnection()) {
                            csStropheService.disconnect();
                        }

                        $location.url('/login');
                    }
                    else {
                        window.close();
                    }
                }
            }
        }])

    .service('FaqSearchService', [
        'SystemConfigService',
        'AuthService',
        '$http',
        function (SystemConfigService, AuthService, $http) {

            this.search = function (terms) {

                var payload = {
                    searchString: terms
                };

                return $http.post(SystemConfigService.getSystemConfigProperty('mytimeEndpoint') + "/session/" + AuthService.user().sessionGuid + "/kb/search.json", payload);
            }

        }])

    .service('ChatWindowToggleService', [function () {
        this.chatToggle = false;

        this.toggleChat = function () {
            this.chatToggle = !this.chatToggle
            return this.chatToggle;
        }
    }])

    .service('SurveyService', [
        '$q',
        '$http',
        'SystemConfigService',
        function ($q, $http, SystemConfigService) {


            var self = this,
                defer = $q.defer();

            self.launchSurvey = function (user) {
                self.getSurvey(user.sessionGuid, user.conversationGuid).then(
                    function (result) {
                        angular.forEach(result.data, function (question) {
                            question['answer'] = null;
                        });

                        defer.resolve(result);
                    },
                    function (reject) {
                        defer.reject(reject);
                    }
                )

                return defer.promise;
            };

            self.finishSurvey = function (user, data) {

                var defer = $q.defer();
                data = angular.copy(data);

                angular.forEach(data, function (question) {
                    delete question.answers;
                });

                self.postSurvey(user.sessionGuid, user.conversationGuid, data).then(
                    function (result) {

                        defer.resolve(result);
                    },
                    function (reject) {

                        defer.reject(reject);
                    }
                );

                return defer.promise;
            }


            self.getSurvey = function (sessionGuid, conversationGuid) {


                var defer = $q.defer();

                var survey = {
                    data: [
                        {
                            "order": "1",
                            "question": "How was your experience?",
                            "answers": ["Great", "Good", "Okay", "Poor"]
                        }
                    ]
                };

                defer.resolve(survey);

                return defer.promise;
            };

            self.postSurvey = function (sessionGuid, conversationGuid, data) {

                var defer = $q.defer();


                $http.post(SystemConfigService.get('mytimeEndpoint') + '/session/' + sessionGuid + '/conversationV2/' + conversationGuid + '/survey.json', data).then(
                    function (result) {


                        defer.resolve(result);
                    },
                    function (reject) {

                        defer.resolve(reject);
                    }
                )

                return defer.promise;
            };

            self.__getSurvey = function (sessionGuid, conversationGuid) {

                var defer = $q.defer(),
                    questions = [];

                $http.get(SystemConfigService.get('mytimeEndpoint') + '/session/' + sessionGuid + '/conversationV2/' + conversationGuid + '/survey.json').then(
                    function (result) {

                        angular.forEach(result.data, function (question) {
                            questions.push(self.make(question));
                        })

                        defer.resolve(questions);
                    },
                    function (reject) {
                        defer.reject(reject);
                    }
                );

                return defer.promise;
            };
        }
    ])

    .service('MessageService', ['SystemConfigService', 'AuthService', '$http', '$q', '$rootScope', 'MqService',
        function (SystemConfigService, AuthService, $http, $q, $rootScope, MqService) {

            var HashMap = function() {

                var self = this;
                var hash = {};


                self.add = function(message) {
                    if (!self.duplicate(message)) {
                        hash[self.getGuid(message)] = 1;
                        return true;
                    }

                    // console.log('duplicate message: ' + self.getGuid(message));
                    return false;
                };

                self.duplicate = function (message) {
                    return hash.hasOwnProperty(self.getGuid(message));
                };

                self.getGuid = function (message) {

                    return message.messageGuid;
                };

            }

            var Conversation = function (data) {

                var _this = this;
                _this.conversationData = {};
                _this.messagesToUser = [];
                _this.messagesFromUser = [];

            };

            var ConversationData = function (data) {

                var _this = this;
                _this.subject = '';
                _this.userState = '';
                _this.stateData = '';
                _this.acr = null;
                // _this.chatServerName = null;
                // _this.stateData = null;

                for (var property in _this) {
                    if (data.hasOwnProperty(property)) {

                        if (property === 'stateData') {
                            try {
                                _this[property] = angular.fromJson(data[property])
                            }
                            catch(e) {
                                _this[property] = data[property];
                            }
                        }
                        else {
                            _this[property] = data[property];
                        }
                    }
                }
            };

            var Message = function (data) {

                var _this = this;
                _this.messageType = 'Mobile';
                _this.locale = 'en_US';
                _this.messageText = '';
                _this.messageData = '';
                _this.geoLocation = "0.000000,0.000000";
                _this.encrypted = 0;
                _this.createTstamp = new Date();
                _this.mimeType = null;

                if (Object.prototype.toString.call(data) == '[object Object]')
                    for (var property in _this) {
                        if (data.hasOwnProperty(property)) {
                            _this[property] = data[property];

                            if (property == 'messageData') {

                                try {
                                    _this.messageData = angular.fromJson(_this.messageData);
                                }
                                catch (e) {
                                    _this.messageData = data[property];
                                }
                            }
                        }
                    }

                _this.stringifyMessageData = function () {
                    _this.messageData = angular.toJson(_this.messageData);
                }
            };

            var self = this;
            var _conversationGuid = null;
            var _conversationData = {};
            var _messageGuidHash = new HashMap();

            self.startConversation = function (conversationInput) {

                var defer = $q.defer();
                var currentUser = AuthService.user();
                var conversationData = new ConversationData(conversationInput);
                _messageGuidHash = new HashMap();

                $http.post(SystemConfigService.getSystemConfigProperty('mytimeEndpoint') + '/session/' + currentUser.sessionGuid + '/conversationV2.json', conversationData).then(
                    function (result) {

                        var messages = [];

                        for (var i = 0; i < result.data.messages.length; i++) {
                            if (!_messageGuidHash.add(result.data.messages[i])) continue;
                            messages.push(new Message(result.data.messages[i]));
                        }

                        delete result.data.messages;

                        _conversationData = new ConversationData(result.data);
                        _conversationGuid = result.data.conversationGuid;

                        $rootScope.$broadcast('message-service:conversation:active');
                        defer.resolve(messages);
                    },
                    function (reject) {

                        defer.reject(reject);
                    }
                );

                return defer.promise;
            };

            self.resumeConversation = function () {

                var defer = $q.defer();
                var currentUser = AuthService.user();
                _messageGuidHash = new HashMap();

                $http.get(SystemConfigService.getSystemConfigProperty('mytimeEndpoint') + "/session/" + currentUser.sessionGuid + "/conversationV2/" + _conversationGuid + ".json?userVisible=1&viewer=user").then(
                    function (result) {

                        var messages = [];

                        for (var i = 0; i < result.data.messages.length; i++) {
                            if (!_messageGuidHash.add(result.data.messages[i])) continue;
                            messages.push(new Message(result.data.messages[i]));
                        }

                        delete result.data.messages;

                        _conversationData = new ConversationData(result.data);
                        _conversationGuid = result.data.conversationGuid;

                        $rootScope.$broadcast('message-service:conversation:active');
                        defer.resolve(messages);

                    },
                    function (reject) {

                        defer.reject(reject);
                    }
                );

                return defer.promise;
            };

            self.postMessage = function (messageText, messageData, mimeType) {

                var defer = $q.defer();
                var currentUser = AuthService.user();
                var conversation = new Conversation();
                var message = new Message({messageText: messageText, messageData: messageData, mimeType: mimeType});

                message.messageData != null ? message.stringifyMessageData() : null;
                conversation.conversationData = new ConversationData(_conversationData);
                conversation.messagesFromUser.push(message);

                $http.post(SystemConfigService.getSystemConfigProperty('mytimeEndpoint') + "/session/" + currentUser.sessionGuid + "/conversationV2/" + self.getConversationGuid() + "/messaging.json", conversation).then(
                    function (result) {

                        var messages = [];

                        for (var i = 0; i < result.data.messagesFromUser.length; i++) {
                            // if (!_messageGuidHash.add(result.data.messagesFromUser[i])) continue;
                            messages.push(new Message(result.data.messagesFromUser[i]));
                        }

                        for (var j = 0; j < result.data.messagesToUser.length; j++) {
                            // if (!_messageGuidHash.add(result.data.messagesToUser[i])) continue;
                            messages.push(new Message(result.data.messagesToUser[j]));
                        }

                        _conversationData = new ConversationData(result.data.conversationData);

                        defer.resolve(messages);

                    },
                    function (reject) {

                        defer.reject(reject);
                    }
                );

                return defer.promise
            };

            self.getMessages = function (xmppMessage) {

                xmppMessage = xmppMessage || null;

                if (xmppMessage != null) {

                    // test for composing and paused messages
                    var paused = $(xmppMessage).find("paused");
                    var composing = $(xmppMessage).find("composing");
                    var presence = $(xmppMessage).find("presence");
                    if (paused.length > 0 || composing.length > 0 || presence.length > 0) {
                        return true;
                    }
                }

                var nocache = '&x-nocache=' + Date.now();

                var defer = $q.defer();
                var currentUser = AuthService.user();

                $http.get(SystemConfigService.getSystemConfigProperty('mytimeEndpoint') + "/session/" + currentUser.sessionGuid + "/conversationV2/" + _conversationGuid + ".json?userVisible=1&userViewed=0&viewer=user" + nocache).then(
                    function (result) {


                        if (result.data.hasOwnProperty('acr') && result.data.acr.hasOwnProperty('agentLiveAddr') && result.data.acr.agentLiveAddr !== null) {
                            // csStropheService.setAgentJid(result.data.acr.agentLiveAddr);
                        }

                        var messages = [];

                        for (var i = 0; i < result.data.messages.length; i++) {
                            if (!_messageGuidHash.add(result.data.messages[i])) continue;
                            messages.push(new Message(result.data.messages[i]));
                        }

                        _conversationData = new ConversationData(result.data);

                        $rootScope.$broadcast('message-service:new:message', messages);
                        defer.resolve(messages);

                    },
                    function (reject) {

                        defer.reject(reject);
                    }
                );

                return defer.promise
            };

            self.resolveConversation = function () {
                var endChatMessageText = 'Resolved';
                return self.postMessage(endChatMessageText, null, 'text/plain')
            };

            self.getConversationGuid = function () {
                return _conversationGuid;
            };

            self.setConversationGuid = function (guid) {
                _conversationGuid = guid;
            };

            self.getConversationData = function () {
                return new ConversationData(_conversationData);
            };

            self.setConversationData = function (data) {

                _conversationData = new ConversationData(data);
            };
        }]);

var HistoryService = ['$http', 'SystemConfigService', 'AuthService', function ($http, SystemConfigService, AuthService) {

    var self = this;

    self.getHistoryFromServer = function () {
        var currentUser = AuthService.user();

        if (!currentUser) {
            throw new Error('HistoryService.gethistroyFromServer requires a valid user and session');
        }

        return $http.get(SystemConfigService.getSystemConfigProperty('mytimeEndpoint') + "/session/" + currentUser.sessionGuid + "/firstRecord/0/maxReturn/200/conversations.json")
    };

    self.archiveConversation = function (item) {
        var currentUser = AuthService.user();

        if (!currentUser) {
            throw new Error('HistoryService.gethistroyFromServer requires a valid user and session');
        }

        return $http.post(SystemConfigService.getSystemConfigProperty('mytimeEndpoint') + "/session/" + currentUser.sessionGuid + "/conversation/" + item.conversationGuid + "/archive.json", {})
    };
}];

var NotificationService = ['$http', 'SystemConfigService', 'AuthService', function ($http, SystemConfigService, AuthService) {

    var self = this;

    self.getNotificationsFromServer = function () {

        var currentUser = AuthService.user();

        return $http.get(SystemConfigService.getSystemConfigProperty('mytimeEndpoint') + "/session/" + currentUser.sessionGuid + "/notification.json");
    }
}];

var BrowserNotificationService = [ '$window', '$q', 'SystemConfigService', '$filter', function ($window, $q, SystemConfigService, $filter) {

    var self = this,
        ALLOW = 'granted',
        DEFAULT = 'default',
        DENY = 'denied',
        navigator = window.navigator,
        serviceWorkerScript = SystemConfigService.get('browserNotificationServiceWorkerScript'),
        icon = SystemConfigService.get('browserNotificationIcon'),
        title = SystemConfigService.get('browserNotificationTitle'),
        truncate = SystemConfigService.get('browserNotificationMessageTruncate'),
        vibrate = SystemConfigService.get('browserNotificationVibrate'),
        requireInteraction = SystemConfigService.get('browserNotificationRequireInteraction');

    self.initServiceWorker = function () {
        navigator.serviceWorker.register(serviceWorkerScript);
    };

    self.hasServiceWorkerApi = function () {

        return 'serviceWorker' in navigator;
    };

    self.hasNotificationApi = function () {
        return window.Notification !== undefined;
    };

    self.hasPermission = function () {
        return Notification.permission === ALLOW;
    };

    self.askPermission = function () {

        var defer = $q.defer();

        Notification.requestPermission(function(permission) {

            if (permission === ALLOW) {
                defer.resolve();
            }
            else if (permission === DENY) {
                defer.reject();
            }
        });

        return defer.promise;
    };

    self.sendNotification = function (message) {

        var options = {
            body: truncate ? $filter('cut')(message, true, 75, '...') : message,
            icon: icon,
            tag: Math.round(Math.random() * (9999999 - 1000000) + 1000000),
            vibrate: vibrate,
            requireInteraction: requireInteraction
        };

        if (self.hasServiceWorkerApi()) {
            navigator.serviceWorker.ready.then(function(registration) {
                registration.showNotification(title, options);
            });
        }
        else if (self.hasNotificationApi()) {

            var notification = new Notification(title, options);
        }
    };

    self.notifyMeNow = function () {

        if (!self.hasNotificationApi()) throw 'Notify: This browser does not support notifications';
        if (!self.hasPermission()) {

            self.askPermission().then(
                function (result) {
                    self.sendNotification('I asked permission')
                },
                function (reject) {
                    // console.log('browser notification permission denied')
                }
            )
        }
        else {

            self.sendNotification('I already had permission and this is a really really really long message that should probably ever happen but we should test it anyway')
        }
    };

    self.init = function () {

        if (self.hasNotificationApi() && self.hasServiceWorkerApi()) {
            self.initServiceWorker();
        }
    };

    self.hasBeenSetByUser = function () {
        return Notification.permission === ALLOW || Notification.permission === DENY;
    };

    self.init();
}];

var SurveyService = ['SystemConfigService', '$q', '$timeout', function(SystemConfigService, $q, $timeout) {

    var self = this;
    self.surveyUrl = SystemConfigService.get('defaultSurveyUrl');

    self.setSurveyUrl = function (value) {

        self.surveyUrl = value;
    };

    self.getSurveyUrl = function () {

        var defer = $q.defer();

        $timeout(function () {
            defer.resolve(self.surveyUrl);
        }, 2000);

        return defer.promise;
    };

}];

angular.module('MyTime.Services')
    .service('HistoryService', HistoryService)
    .service('NotificationService', NotificationService)
    .service('BrowserNotificationService', BrowserNotificationService)
    .service('SurveyService', SurveyService);





// Object.assign Polyfill
if (!Object.assign) {
    Object.defineProperty(Object, 'assign', {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (target, firstSource) {
            'use strict';
            if (target === undefined || target === null) {
                throw new TypeError('Cannot convert first argument to object');
            }

            var to = Object(target);
            for (var i = 1; i < arguments.length; i++) {
                var nextSource = arguments[i];
                if (nextSource === undefined || nextSource === null) {
                    continue;
                }

                var keysArray = Object.keys(Object(nextSource));
                for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
                    var nextKey = keysArray[nextIndex];
                    var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                    if (desc !== undefined && desc.enumerable) {
                        to[nextKey] = nextSource[nextKey];
                    }
                }
            }
            return to;
        }
    });
}
