'use strict';


angular.module('MyTime.Directives', ['angularFileUpload', 'ui.calendar', 'ui.date'])

    // Generates a login form
    .directive('loginForm', [
        'AuthService',
        function (AuthService) {

            return {
                restrict: 'E',
                replace: true,
                scope: false,
                templateUrl: 'views/directives/login/default-login-form.html',
                link: function (scope, elem, attrs) {

                }
            }
        }])

    // provides the main menu
    .directive('productMenu', [
        function () {

            return {
                restrict: 'E',
                replace: true,
                scope: false,
                templateUrl: 'views/directives/menu/product-menu.html',
                link: function (scope, elem, attrs) {

                    // Implicit scope vars
                    // These should be defined on the including controller
                    // scope.menuItems

                }
            }
        }])

    // provides user preferences for chat notifications
    .directive('productNotificationPrefs', [
        'NotificationPreferencesService',
        'AuthService',
        'SystemConfigService',
        'BrowserNotificationService',
        function (NotificationPreferencesService, AuthService, SystemConfigService, BrowserNotificationService) {

            return {
                restrict: 'E',
                scope: false,
                templateUrl: 'views/directives/notification/product-notification-prefs.html',
                link: function (scope, elem, attrs) {

                    scope.prefs = null;

                    scope.emailPrefs = null;
                    scope.smsPrefs = null;
                    scope.browserNotificationsEnabled = BrowserNotificationService.hasPermission();
                    scope.browserNotificationsSet = BrowserNotificationService.hasBeenSetByUser();
                    scope.loading = false;

                    if (SystemConfigService.get('userPrefsEnabled')) {
                        NotificationPreferencesService.getPreferences().then(
                            function (result) {

                                scope.prefs = result;

                                scope.emailPrefs = {
                                    name: 'Email',
                                    active: NotificationPreferencesService.getPrefOptInValue(scope.prefs, 'Email'),
                                    value: NotificationPreferencesService.getPrefContactValue(scope.prefs, 'email') || AuthService.getUserAttr('addrEmail') || ""
                                };

                                scope.smsPrefs = {
                                    name: 'SMS',
                                    active: NotificationPreferencesService.getPrefOptInValue(scope.prefs, 'SMS'),
                                    value: NotificationPreferencesService.getPrefContactValue(scope.prefs, 'SMS') || AuthService.getUserAttr('phone') || ""
                                };

                            },
                            function (reject) {

                                // handle error
                            }
                        );
                    }

                    scope.askPermission = function() {
                        BrowserNotificationService.askPermission().then().finally(function (){
                            scope.browserNotificationsEnabled = BrowserNotificationService.hasPermission();
                            scope.browserNotificationsSet = true;
                        })
                    };

                    scope.savePrefs = function () {

                        var inputArr = [scope.emailPrefs, scope.smsPrefs];

                        var prefs = scope._createPrefs(inputArr);
                        scope.loading = true;
                        NotificationPreferencesService.setPreferences(prefs).then(
                            function (result) {

                                scope.prefs = prefs;
                                scope.$emit('notification-prefs:save:success');
                                // scope.closePreferences();
                            },
                            function (reject) {

                                console.log('error');
                                scope.$emit('notification-prefs:save:error');
                            }
                        ).finally(
                            function () {
                                scope.loading = false;
                            }
                        )
                    }

                    scope.createOptIn = function (name, value) {

                        return {"category": "OPT_IN", "name": name, "value": value.toString()}
                    }

                    scope.createContact = function (name, value) {

                        return {"category": "contact", "name": name, "value": value}
                    }

                    scope._createPrefs = function (prefsArr) {

                        var notificationPrefs = [];

                        angular.forEach(prefsArr, function (prefs) {

                            notificationPrefs.push(scope.createOptIn(prefs.name, prefs.active));
                            notificationPrefs.push(scope.createContact(prefs.name, prefs.value));
                        });

                        return notificationPrefs;
                    }

                    scope.$on('preferences:close', function (e) {

                        scope.prefs = NotificationPreferencesService.getPrefsFromStore();

                        scope.emailPrefs = {
                            name: 'Email',
                            active: NotificationPreferencesService.getPrefOptInValue(scope.prefs, 'Email'),
                            value: NotificationPreferencesService.getPrefContactValue(scope.prefs, 'email') || AuthService.getUserAttr('addrEmail') || ""
                        };

                        scope.smsPrefs = {
                            name: 'SMS',
                            active: NotificationPreferencesService.getPrefOptInValue(scope.prefs, 'SMS'),
                            value: NotificationPreferencesService.getPrefContactValue(scope.prefs, 'SMS') || AuthService.getUserAttr('phone') || ""
                        };
                    });
                }
            }
        }])

    // Provides a list for Blast notifications
    .directive('productBlastNotification', [
        function () {

            return {

                restrict: 'E',
                replace: true,
                scope: false,
                templateUrl: 'views/directives/notification/product-blast-notification.html',
                link: function (scope, elem, attrs) {
                }
            }
        }])

    // Provides a list that is Self Service
    .directive('productSelfServiceConversationList', [
        function () {


            return {
                restrict: 'E',
                replace: true,
                scope: false,
                templateUrl: 'views/directives/self-service/product-self-service-conversation-list.html',
                link: function (scope, elem, attrs) {

                    // Implicit scope vars
                    // These should be defined on the including controller
                }
            }
        }])

    // Provides a Calendar widget
    .directive('productCalendarContainer', [
        '$rootScope',
        'CalendarData',
        'MessageService',
        function ($rootScope, CalendarData, MessageService) {
            return {
                restrict: 'E',
                replace: false,
                scope: false,
                templateUrl: 'views/directives/self-service/calendar-container.html',
                link: function (scope, elem, attrs) {


                    scope.menuSelect = function (value, name) {

                        MessageService.postMessage(name, {
                            id: scope.message.messageData.id,
                            action: "response",
                            input: value
                        }, scope.message.mimeType).then(
                            function (result) {

                                $rootScope.$broadcast('user-input:new:message', result);
                            },
                            function (reject) {

                                console.log(reject);
                            }
                        );
                    };

                    scope.sendDate = function (date, evt, a) {

                        if ($(a.currentTarget).hasClass('date-disabled')) {
                            return false;
                        }

                        // Format the date to ISO
                        var _date = $.fullCalendar.formatDate(date, 'yyyy-MM-dd');
                        var displayDate = $.fullCalendar.formatDate(date, 'yyyy/MM/dd');

                        MessageService.postMessage(_date, {
                            id: scope.message.messageData.id,
                            action: "response",
                            input: _date
                        }, scope.message.mimeType).then(
                            function (result) {

                                $rootScope.$broadcast('user-input:new:message', result);
                            },
                            function (reject) {

                                console.log(reject);
                            }
                        );
                    };

                    scope.eventSource = CalendarData.eventSource;
                    scope.events = CalendarData.events;
                    scope.eventsF = CalendarData.eventsF;
                    scope.eventSources = CalendarData.eventSources;
                    scope.uiConfig = CalendarData.uiConfig;
                    scope.uiConfig.calendar.dayClick = scope.sendDate;

                }
            }
        }])

    // provides a phone number widget
    .directive('productPhoneContainer', [
        '$rootScope',
        'MessageService',
        function ($rootScope, MessageService) {
            return {
                restrict: 'E',
                replace: true,
                scope: false,
                templateUrl: 'views/directives/self-service/phone-container.html',
                link: function (scope, elem, attrs) {

                    scope.phoneNumber = '';
                    scope.sendBtnDisable = false;
                    scope.enter = function (input) {

                        if (MyTimeHelpers.isString(input) || MyTimeHelpers.isNumber(input)) {

                            if (scope.phoneNumber.length >= scope.message.messageData.lengthMax) return false;
                            scope.phoneNumber += '' + input + '';
                        }

                        else if (input.hasOwnProperty('target') || input.hasOwnProperty('srcElement')) {

                            input.preventDefault();

                            if (input.keyCode == 8 || input.keyCode == 46) {

                                scope.back();
                            }
                            else if (scope.phoneNumber.length >= scope.message.messageData.lengthMax) {

                                return false;
                            }
                            else {

                                // @TODO: NEED TO WORK ON SHIFT KEY
                                if (!input.shiftKey) {
                                    scope.phoneNumber += '' + String.fromCharCode(input.keyCode + 32) + '';
                                }
                                else {
                                    scope.phoneNumber += '' + String.fromCharCode(input.keyCode) + '';
                                }
                            }
                        }
                    };
                    scope.back = function () {
                        if (scope.phoneNumber.length > 0) {
                            scope.phoneNumber = scope.phoneNumber.substr(0, scope.phoneNumber.length - 1)
                        }
                    };
                    scope.send = function () {

                        if (scope.phoneNumber.length < scope.message.messageData.lengthMin) return false;

                        scope.sendBtnDisable = true;


                        MessageService.postMessage(scope.phoneNumber, {
                            id: scope.message.messageData.id,
                            action: "response",
                            input: scope.phoneNumber
                        }, scope.message.mimeType).then(
                            function (result) {

                                scope.currentWidget = null;
                                scope.sendBtnDisable = false;
                                scope.phoneNumber = '';
                                $rootScope.$broadcast('user-input:new:message', result);
                            },
                            function (reject) {

                                console.log(reject);
                            }
                        );
                    }

                    var _input = $('#input-field');
                    _input.on('focus', function (e) {

                        if (scope.error) {
                            scope.$apply(function () {
                                scope.error = false;
                                scope.errorMessage = '';
                            })
                        }
                    });

                    // Toggle focused input class
                    scope.$watch('error', function (n, o) {

                        if (n) {
                            _input.removeClass('focused-input');
                        }
                        else {
                            _input.addClass('focused-input');
                        }
                    })
                }
            }
        }])

    // provides a widget containing a numeric only keypad ///
    .directive('productNumericOnlyContainer', [
        '$rootScope',
        'MessageService',
        function ($rootScope, MessageService) {
            return {
                restrict: 'E',
                replace: true,
                scope: false,
                templateUrl: 'views/directives/self-service/numeric-only-container.html',
                link: function (scope, elem, attrs) {

                    scope.number = '';
                    scope.sendBtnDisable = false;
                    scope.error = false;
                    scope.errorMessage = '';

                    scope.enter = function (input) {

                        if (scope.error) {
                            scope.error = false;
                            scope.errorMessage = '';
                        }

                        // Is the input a string or and integer?
                        // That means the value came from the html keypad
                        if (MyTimeHelpers.isString(input) || MyTimeHelpers.isNumber(input)) {

                            // Check length
                            if (scope.number.length >= scope.message.messageData.lengthMax) return false;

                            // Append char
                            scope.number += '' + input + '';
                        }

                        // The input came from an actual keyboard press that generated an event
                        else if (input.hasOwnProperty('target') || input.hasOwnProperty('srcElement')) {

                            // prevent
                            input.preventDefault();

                            // Did the press the back key
                            if (input.keyCode == 8 || input.keyCode == 46) {

                                // call the back func
                                scope.back();
                            }

                            // Did they press a number
                            else if (input.keyCode >= 48 && input.keyCode <= 57) {

                                // Check length
                                if (scope.number.length >= scope.message.messageData.lengthMax) return false;

                                // Append char
                                scope.number += String.fromCharCode(input.keyCode);

                            }
                        }
                    };
                    scope.send = function () {

                        // Test for minimum input length
                        if (scope.number.length < scope.message.messageData.lengthMin) {
                            scope.error = true;
                            scope.errorMessage = 'Minimum length is ' + scope.message.messageData.lengthMin;
                            return false;
                        }

                        scope.sendBtnDisable = true;

                        MessageService.postMessage(scope.number, {
                            id: scope.message.messageData.id,
                            action: "response",
                            input: scope.number
                        }, scope.message.mimeType).then(
                            function (result) {

                                scope.currentWidget = null;
                                scope.sendBtnDisable = false;
                                scope.number = '';
                                $rootScope.$broadcast('user-input:new:message', result);
                            },
                            function (reject) {

                                console.log(reject);
                            }
                        );
                    };
                    scope.back = function () {

                        if (scope.number.length > 0) {

                            scope.number = scope.number.substring(0, scope.number.length - 1);
                        }
                    }

                    var _input = $('#input-field');
                    _input.on('focus', function (e) {

                        if (scope.error) {
                            scope.$apply(function () {
                                scope.error = false;
                                scope.errorMessage = '';
                            })
                        }
                    });

                    // Toggle focused input class
                    scope.$watch('error', function (n, o) {

                        if (n) {
                            _input.removeClass('focused-input');
                        }
                        else {
                            _input.addClass('focused-input');
                        }
                    })
                }
            }
        }])

    // provides a widget containing a numeric keypad with symbols ///
    .directive('productNumericWithSymbolsContainer', [
        '$rootScope',
        'MessageService',
        function ($rootScope, MessageService) {
            return {
                restrict: 'E',
                replace: true,
                scope: false,
                templateUrl: 'views/directives/self-service/numeric-with-symbols-container.html',
                link: function (scope, elem, attrs) {

                    scope.number = '';
                    scope.sendBtnDisable = false;
                    scope.error = false;
                    scope.errorMessage = '';

                    scope.enter = function (input) {

                        if (scope.error) {
                            scope.error = false;
                            scope.errorMessage = '';
                        }

                        if (MyTimeHelpers.isString(input) || MyTimeHelpers.isNumber(input)) {

                            if (scope.number.length >= scope.message.messageData.lengthMax) return false;
                            scope.number += '' + input + '';
                        }

                        else if (input.hasOwnProperty('target') || input.hasOwnProperty('srcElement')) {
                            input.preventDefault();

                            if (input.keyCode == 8 || input.keyCode == 46) {

                                scope.back();
                            }
                            else if (scope.number.length >= scope.message.messageData.lengthMax) {

                                return false;
                            }
                            else {

                                var char = String.fromCharCode(input.keyCode);
                                var test = /[0-9\\\/\(\)\[\],.*\+#]/.test(char);
                                if (test) {
                                    scope.number += char;
                                }
                            }
                        }
                    };
                    scope.send = function () {

                        // Test for minimum input length
                        if (scope.number.length < scope.message.messageData.lengthMin) {
                            scope.error = true;
                            scope.errorMessage = 'Minimum length is ' + scope.message.messageData.lengthMin;
                            return false;
                        }

                        scope.sendBtnDisable = true;

                        MessageService.postMessage(scope.number, {
                            id: scope.message.messageData.id,
                            action: "response",
                            input: scope.number
                        }, scope.message.mimeType).then(
                            function (result) {

                                scope.currentWidget = null;
                                scope.sendBtnDisable = false;
                                scope.number = '';
                                $rootScope.$broadcast('user-input:new:message', result);
                            },
                            function (reject) {

                                console.log(reject);
                            }
                        );
                    };
                    scope.back = function () {

                        if (scope.number.length > 0) {

                            scope.number = scope.number.substring(0, scope.number.length - 1);
                        }
                    };

                    var _input = $('#input-field');
                    _input.on('focus', function (e) {

                        if (scope.error) {
                            scope.$apply(function () {
                                scope.error = false;
                                scope.errorMessage = '';
                            })
                        }
                    });

                    // Toggle focused input class
                    scope.$watch('error', function (n, o) {

                        if (n) {
                            _input.removeClass('focused-input');
                        }
                        else {
                            _input.addClass('focused-input');
                        }
                    })
                }
            }
        }])

    // provides a widget containing a numeric only keypad ///
    .directive('productDecimalContainer', [
        '$rootScope',
        'MessageService',
        function ($rootScope, MessageService) {
            return {
                restrict: 'E',
                replace: true,
                scope: false,
                templateUrl: 'views/directives/self-service/decimal-container.html',
                link: function (scope, elem, attrs) {

                    scope.number = '';
                    scope.sendBtnDisable = false;
                    scope.error = false;
                    scope.errorMessage = '';

                    scope.enter = function (input) {

                        if (scope.error) {
                            scope.error = false;
                            scope.errorMessage = '';
                        }

                        if (MyTimeHelpers.isString(input) || MyTimeHelpers.isNumber(input)) {

                            // Check length
                            if (scope.number.length >= scope.message.messageData.lengthMax) return false;

                            // Check if we already have a decimal
                            if (scope.number.indexOf('.') !== -1 && input === '.') return false;

                            // Append char
                            scope.number += '' + input + '';
                        }

                        else if (input.hasOwnProperty('target') || input.hasOwnProperty('srcElement')) {
                            input.preventDefault();

                            if (input.keyCode == 8 || input.keyCode == 46) {

                                scope.back();
                            }
                            else if (scope.number.length >= scope.message.messageData.lengthMax) {

                                return false;
                            }
                            else {

                                var char = String.fromCharCode(input.keyCode);

                                if (input.keyCode === 190 && (scope.number.indexOf('.') === -1)) {
                                    scope.number += '.';
                                }

                                if (/[0-9]/.test(char)) {
                                    scope.number += char;
                                }
                            }
                        }
                    };
                    scope.send = function () {

                        // Test for minimum input length
                        if (scope.number.length < scope.message.messageData.lengthMin) {
                            scope.error = true;
                            scope.errorMessage = 'Minimum length is ' + scope.message.messageData.lengthMin;
                            return false;
                        }

                        if (scope.number[scope.number.length - 1] == '.') {
                            scope.number = scope.number.substr(0, scope.number.length - 1)
                        }

                        scope.sendBtnDisable = true;

                        MessageService.postMessage(scope.number, {
                            id: scope.message.messageData.id,
                            action: "response",
                            input: scope.number
                        }, scope.message.mimeType).then(
                            function (result) {

                                scope.currentWidget = null;
                                scope.sendBtnDisable = false;
                                scope.number = '';
                                $rootScope.$broadcast('user-input:new:message', result);
                            },
                            function (reject) {

                                console.log(reject);
                            }
                        );
                    };
                    scope.back = function () {

                        if (scope.number.length > 0) {

                            scope.number = scope.number.substring(0, scope.number.length - 1);
                        }
                    };

                    var _input = $('#input-field');
                    _input.on('focus', function (e) {

                        if (scope.error) {
                            scope.$apply(function () {
                                scope.error = false;
                                scope.errorMessage = '';
                            })
                        }
                    });

                    // Toggle focused input class
                    scope.$watch('error', function (n, o) {

                        if (n) {
                            _input.removeClass('focused-input');
                        }
                        else {
                            _input.addClass('focused-input');
                        }
                    })
                }
            }
        }])

    // provides a select menu with choices populated from server ///
    .directive('productSpinnerContainer', [
        '$rootScope',
        'MessageService',
        function ($rootScope, MessageService) {

            return {
                restrict: 'E',
                replace: true,
                scope: false,
                templateUrl: 'views/directives/self-service/spinner-container.html',
                link: function (scope, elem, attrs) {

                    scope.selectedItem = "";

                    scope.send = function () {

                        MessageService.postMessage(scope.selectedItem.name, {
                            id: scope.message.messageData.id,
                            action: "response",
                            input: scope.selectedItem.value
                        }, scope.message.mimeType).then(
                            function (result) {

                                $rootScope.$broadcast('user-input:new:message', result);
                            },
                            function (reject) {

                                console.log(reject);
                            }
                        );
                    }
                }
            }
        }])

    // Provides a menu for self service ///
    .directive('productSelfServeMenu', [
        '$rootScope',
        'MessageService',
        function ($rootScope, MessageService) {

            return {

                restrict: 'E',
                replace: false,
                scope: false,
                templateUrl: 'views/directives/self-service/menu.html',
                link: function (scope, elem, attrs) {

                    scope.menuSelect = function (value, name) {

                        MessageService.postMessage(name, {
                            id: scope.message.messageData.id,
                            action: "response",
                            input: value
                        }, scope.message.mimeType).then(
                            function (result) {

                                $rootScope.$broadcast('user-input:new:message', result);
                            },
                            function (reject) {

                                console.log(reject);
                            }
                        );
                    }
                }
            }
        }])

    // Menu widget for self serve content after article list has been served ///
    .directive('productSelfServeContentMenu', [
        '$rootScope',
        'MessageService',
        function ($rootScope, MessageService) {

            return {
                restrict: 'E',
                replace: false,
                scope: false,
                templateUrl: 'views/directives/self-service/ssc-menu.html',
                link: function (scope, elem, attrs) {

                    scope.menuSelect = function (input) {

                        MessageService.postMessage(input.name, {
                            id: input.id,
                            action: input.action,
                            input: input.type,
                            articleId: input.articleId
                        }, scope.message.mimeType).then(
                            function (result) {

                                $rootScope.$broadcast('user-input:new:message', result);
                            },
                            function (reject) {

                                console.log(reject);
                            }
                        )
                    }
                }
            }
        }])

    // Provides listing of knowledge base articles
    .directive('productKnowledgeBase', [
        '$rootScope',
        'ArticleService',
        function ($rootScope, ArticleService) {

            return {

                restrict: 'E',
                replace: false,
                scope: false,
                templateUrl: 'views/directives/self-service/knowledge-base.html',
                link: function (scope, elem, attrs) {

                    var modalId = 'sscArticleModal';

                    scope.selectedArticle = null;

                    var showModal = function () {

                        var modal = $('#' + modalId);
                        modal.find('.modal-body').css('maxHeight', $(window).height() - 150);
                        modal.modal('show');
                    };

                    var hideModal = function () {

                        $('#' + modalId).modal('hide');
                    };

                    var resumeChat = function (data) {

                        angular.forEach(data.messagesFromUser, function (message) {

                            // scope.selfServiceMessages.push(message);
                        })

                        angular.forEach(data.messagesToUser, function (message) {

                            scope.selfServiceMessages.push(message);
                        })

                        scope.$emit('user-input:new:message');
                        hideModal();
                    };


                    scope.articleSelect = function (articleDetails) {

                        scope.selectedArticle = articleDetails;

                        ArticleService.getArticleHtml(articleDetails.articleId).then(function (data) {
                            scope.articleHtml = data;
                            scope.articleTitle = ArticleService.getTitle();
                            showModal();
                        });
                    }
                }
            }
        }])

    // provides a phone number widget ///
    .directive('productCreditCardExpiry', [
        '$rootScope',
        'MessageService',
        function ($rootScope, MessageService) {
            return {
                restrict: 'E',
                replace: true,
                scope: false,
                templateUrl: 'views/directives/self-service/credit-card-expiry.html',
                link: function (scope, elem, attrs) {

                    var numbers = [];
                    scope.number = '';
                    scope.sendBtnDisable = false;
                    scope.error = false;
                    scope.errorMessage = '';

                    scope.enter = function (input) {

                        if (scope.error) {
                            scope.error = false;
                            scope.errorMessage = '';
                        }

                        if (MyTimeHelpers.isString(input) || MyTimeHelpers.isNumber(input)) {

                            scope.typeNumber(input)
                        }

                        else if (input.hasOwnProperty('target') || input.hasOwnProperty('srcElement')) {

                            input.preventDefault();

                            if (input.keyCode >= 48 && input.keyCode <= 57) {
                                scope.typeNumber(String.fromCharCode(input.keyCode));
                            }
                            else if (input.keyCode == 8 || input.keyCode == 46) {
                                scope.back();
                            }
                        }
                    };

                    scope.back = function (e) {

                        if (scope.error) {
                            scope.error = false;
                            scope.errorMessage = '';
                        }

                        $('#cc-expiry-input-field').focus();

                        if (numbers.length > 0) {

                            numbers.pop();

                            if (numbers.length === 0) {
                                scope.number = '';
                            }

                            if (numbers.length === 1) {
                                scope.number = '' + numbers[0];
                            }

                            if (numbers.length === 2) {
                                scope.number = '' + numbers[0] + numbers[1] + '/';
                            }

                            if (numbers.length === 3) {
                                scope.number = '' + numbers[0] + numbers[1] + '/' + numbers[2];
                            }
                        }
                    };

                    scope.typeNumber = function (char) {

                        if (numbers.length < 4) {

                            numbers.push(char);

                            if (numbers.length === 1) {
                                scope.number = '' + numbers[0];
                            }

                            if (numbers.length === 2) {
                                scope.number = '' + numbers[0] + numbers[1] + '/';
                            }

                            if (numbers.length === 3) {
                                scope.number = '' + numbers[0] + numbers[1] + '/' + numbers[2];
                            }

                            if (numbers.length === 4) {
                                scope.number = '' + numbers[0] + numbers[1] + '/' + numbers[2] + numbers[3];
                            }

                        }
                    };

                    scope.checkPattern = function () {

                        // Get today
                        var date = new Date();

                        // date checking patterns
                        var patternFullYear = new RegExp("^(1[0-2]|0[1-9]|\d)\/(20\d{2}|19\d{2}|0(?!0)\d|[1-9]\d)$");
                        var patternTwoYearStrict = new RegExp("^(1[0-2]|0[1-9])\/(1[5-9]|2[0-9])$");
                        var patternTwoYear = new RegExp("^(1[0-2]|0[1-9]|\d{2})\/");

                        // Check for valid date pattern
                        if (!patternTwoYear.test(scope.number)) {
                            /*scope.$emit("ccexpiry:date:invalid", {
                             date: scope.number,
                             title: "Invalid Date",
                             message: "Expiration date is invalid."
                             })*/

                            scope.errorMessage = 'Date is Invalid';

                            return false;
                        }

                        // Compose a date object from entered data.  Just set the day to the first of the month as this
                        // doesn't matter and won't be supplied by the user.
                        var date2String = scope.number.substr(0, 2) + '/01/20' + scope.number.substr(scope.number.lastIndexOf('/') + 1, 2);

                        if (date2String.length != 10) {
                            /*scope.$emit("ccexpiry:date:invalid", {
                             date: scope.number,
                             title: "Invalid Date",
                             message: "Expiration date is invalid."
                             })*/

                            scope.errorMessage = 'Date is Invalid';

                            return false;
                        }

                        var date2 = new Date(date2String);

                        // Check for date in the past
                        if (date2 < date) {
                            /*scope.$emit("ccexpiry:date:invalid", {
                             date: date2,
                             title: "Invalid Date",
                             message: "Expiration date must later that today."
                             });*/

                            scope.errorMessage = 'Date is Invalid';

                            return false;
                        }


                        // check for date in the future
                        var futureDate = new Date(scope.number.substr(0, 2) + '/01/2025');

                        if (date2 > futureDate) {
                            /*scope.$emit("ccexpiry:date:invalid", {
                             date: date2,
                             title: "Invalid Date",
                             message: "Expiration date is too far in the future."
                             });*/

                            scope.errorMessage = 'Date is Invalid';

                            return false;
                        }


                        return true;
                    };

                    scope.send = function () {

                        if (!scope.checkPattern()) {

                            scope.error = true;
                            return false;
                        }

                        // scope.sendBtnDisable = true;

                        var number = scope.number.split('/').join('');

                        MessageService.postMessage(scope.number, {
                            id: scope.message.messageData.id,
                            action: "response",
                            input: number
                        }, scope.message.mimeType).then(
                            function (result) {

                                $rootScope.$broadcast('user-input:new:message', result);
                            },
                            function (reject) {

                                console.log(reject);
                            }
                        );
                    }

                    var _input = $('#input-field');
                    _input.on('focus', function (e) {

                        if (scope.error) {
                            scope.$apply(function () {
                                scope.error = false;
                                scope.errorMessage = '';
                            })
                        }
                    });

                    // Toggle focused input class
                    scope.$watch('error', function (n, o) {

                        if (n) {
                            _input.removeClass('focused-input');
                        }
                        else {
                            _input.addClass('focused-input');
                        }
                    })
                }
            }
        }])

    // regular old alpha num input ///
    .directive('productAlphaNumContainer', [
        '$rootScope',
        'MessageService',
        function ($rootScope, MessageService) {

            return {
                restrict: 'E',
                replace: true,
                scope: false,
                templateUrl: 'views/directives/self-service/alpha-num-container.html',
                link: function (scope, elem, attrs) {

                    scope.inputMessage = '';
                    scope.sendBtnDisable = false;
                    scope.error = false;
                    scope.errorMessage = '';

                    scope.enter = function (input) {

                        if (scope.error) {
                            scope.error = false;
                            scope.errorMessage = '';
                        }
                    };
                    scope.send = function () {

                        if (scope.message === '') {
                            scope.error = true;
                            scope.errorMessage = "Input required.";
                            return false;
                        }

                        scope.sendBtnDisable = true;

                        MessageService.postMessage(scope.inputMessage, {
                            id: scope.message.messageData.id,
                            action: "response",
                            input: scope.inputMessage
                        }, scope.message.mimeType).then(
                            function (result) {

                                $rootScope.$broadcast('user-input:new:message', result);
                            },
                            function (reject) {

                                console.log(reject);
                                scope.error = true;
                                scope.errorMessage = "There was an error."
                            }
                        ).finally(function () {
                            scope.sendBtnDisable = false;
                        })
                    };

                    $('#input-field').on('focus', function (e) {


                        if (scope.error) {
                            scope.$apply(function () {
                                scope.error = false;
                                scope.errorMessage = '';
                            })
                        }
                    })

                    $('#input-field').focus();
                }
            }
        }
    ])

    ///
    .directive('productDatePickerContainer', [
        '$rootScope',
        'MessageService',
        function ($rootScope, MessageService) {
            return {
                restrict: 'E',
                replace: true,
                scope: false,
                templateUrl: 'views/directives/self-service/date-picker-container.html',
                link: function (scope, elem, attrs) {

                    scope.moment = moment(scope.message.messageData.defaultDate);

                    scope.date = {
                        month: scope.moment.format('MMM'),
                        day: scope.moment.format('DD'),
                        year: scope.moment.format('YYYY'),
                    }

                    scope.updateView = function () {

                        if (scope.moment > moment(scope.message.messageData.dateMax)) {
                            scope.moment = moment(scope.message.messageData.dateMin)
                        }
                        else if (scope.moment < moment(scope.message.messageData.dateMin)) {
                            scope.moment = moment(scope.message.messageData.dateMax)
                        }

                        scope.date = {
                            month: scope.moment.format('MMM'),
                            day: scope.moment.format('DD'),
                            year: scope.moment.format('YYYY')
                        }
                    }

                    scope.sendDatePicker = function () {

                        var theDate = scope.moment.toISOString();
                        var displayDate = moment(theDate).format('YYYY-MM-DD');

                        MessageService.postMessage(displayDate, {
                            id: scope.message.messageData.id,
                            action: "response",
                            input: displayDate
                        }, scope.message.mimeType).then(
                            function (result) {

                                $rootScope.$broadcast('user-input:new:message', result);
                            },
                            function (reject) {

                                console.log(reject);
                            }
                        );
                    };

                    scope.incrementMonth = function () {

                        scope.moment.add(1, 'M');
                        scope.updateView();
                    }

                    scope.decrementMonth = function () {

                        scope.moment.subtract(1, 'M');
                        scope.updateView();
                    }


                    scope.incrementDays = function () {

                        scope.moment.add(1, 'd');
                        scope.updateView();
                    }

                    scope.decrementDays = function () {

                        scope.moment.subtract(1, 'd');
                        scope.updateView();
                    }


                    scope.incrementYears = function () {

                        scope.moment.add(1, 'y');
                        scope.updateView();
                    }

                    scope.decrementYears = function () {

                        scope.moment.subtract(1, 'y');
                        scope.updateView();
                    }


                }
            }
        }])


    // NATIVE WIDGETS
    // providers the native device implementation
    .directive('productNativeDatePicker', [
        'MessageService',
        '$rootScope',
        function (MessageService, $rootScope) {
            return {
                restrict: 'E',
                replace: true,
                scope: false,
                templateUrl: 'views/directives/self-service/native-date-picker.html',
                link: function (scope, elem, attrs) {

                    scope.date = new Date(scope.messageData.defaultDate);
                    scope.error = false;
                    scope.errorMessage = '';

                    scope.send = function () {

                        var date = moment($('#input-field').val());

                        // Test for min dates for devices that don't support limiting input
                        if (date.isBefore(scope.messageData.dateMin)) {
                            scope.error = true;
                            scope.errorMessage = 'Minimum date is ' + moment(scope.messageData.dateMin).toISOString();
                            return false;
                        }

                        // Test for max dates for devices that don't support limiting input
                        if (date.isAfter(scope.messageData.dateMax)) {
                            scope.error = true;
                            scope.errorMessage = 'Maximum date is ' + moment(scope.messageData.dateMax).toISOString();
                            return false;
                        }

                        var displayDate = moment(date).format('YYYY-MM-DD');


                        SelfService.postSelfServiceMessageToConversation(displayDate, 'application/vnd.cs.mobile.picker.date', displayDate, scope.messageData.id).then(
                            function (result) {

                                angular.forEach(result.messagesFromUser, function (message) {

                                    scope.selfServiceMessages.push(message)
                                });


                                angular.forEach(result.messagesToUser, function (message) {

                                    scope.selfServiceMessages.push(message)
                                });

                                scope.currentWidget = null;
                                $rootScope.$broadcast('user-input:new:message');
                            },
                            function (reject) {

                                console.log(reject);
                            }
                        )
                    };

                    var _input = $('#input-field');
                    _input.on('focus', function (e) {

                        if (scope.error) {
                            scope.$apply(function () {
                                scope.error = false;
                                scope.errorMessage = '';
                            })
                        }
                    });
                }
            }
        }])

    // native keyboards example
    .directive('productNativeExpiry', [
        'SelfService',
        '$rootScope',
        function (SelfService, $rootScope) {
            return {
                restrict: 'E',
                replace: true,
                scope: false,
                templateUrl: 'views/directives/self-service/native-expiry-date.html',
                link: function (scope, elem, attrs) {

                    scope.date = new Date(Date.now());
                    scope.minDate = scope.messageData.minYear + '-' + scope.messageData.minMonth + '-01';
                    scope.maxDate = scope.messageData.maxYear + '-01-01';
                    scope.error = false;
                    scope.errorMessage = '';

                    scope.send = function () {

                        var date = moment($('#input-field').val());

                        // Test for min dates for devices that don't support limiting input
                        if (date.isBefore(scope.minDate)) {
                            scope.error = true;
                            scope.errorMessage = 'Minimum date is ' + moment(scope.minDate).toISOString();
                            return false;
                        }

                        // Test for max dates for devices that don't support limiting input
                        if (date.isAfter(scope.maxDate)) {
                            scope.error = true;
                            scope.errorMessage = 'Maximum date is ' + moment(scope.maxDate).toISOString();
                            return false;
                        }

                        date = date.toISOString();

                        SelfService.postSelfServiceMessageToConversation(date, 'application/vnd.cs.mobile.payment.card.expdate', date, scope.messageData.id).then(
                            function (result) {

                                angular.forEach(result.messagesFromUser, function (message) {

                                    scope.selfServiceMessages.push(message)
                                });


                                angular.forEach(result.messagesToUser, function (message) {

                                    scope.selfServiceMessages.push(message)
                                });

                                scope.currentWidget = null;
                                $rootScope.$broadcast('user-input:new:message');
                            },
                            function (reject) {

                                console.log(reject);
                            }
                        )
                    };

                    var _input = $('#input-field');
                    _input.on('focus', function (e) {

                        if (scope.error) {
                            scope.$apply(function () {
                                scope.error = false;
                                scope.errorMessage = '';
                            })
                        }
                    });

                }
            }
        }])

    // provides a widget containing a numeric only keypad
    .directive('productNativeNumericOnlyContainer', [
        'SelfService',
        '$rootScope',
        function (SelfService, $rootScope) {
            return {
                restrict: 'E',
                replace: true,
                scope: false,
                templateUrl: 'views/directives/self-service/native-numeric-only.html',
                link: function (scope, elem, attrs) {

                    scope.number = '';
                    scope.sendBtnDisable = false;
                    scope.error = false;
                    scope.errorMessage = '';

                    scope.enter = function (input) {

                        if (scope.error) {
                            scope.error = false;
                            scope.errorMessage = '';
                        }

                        // Is the input a string or and integer?
                        // That means the value came from the html keypad
                        if (MyTimeHelpers.isString(input) || MyTimeHelpers.isNumber(input)) {

                            // Check length
                            if (scope.number.length >= scope.messageData.lengthMax) return false;

                            // Append char
                            scope.number += '' + input + '';
                        }

                        // The input came from an actual keyboard press that generated an event
                        else if (input.hasOwnProperty('target') || input.hasOwnProperty('srcElement')) {

                            // prevent
                            input.preventDefault();

                            // Did the press the back key
                            if (input.keyCode == 8 || input.keyCode == 46) {

                                // call the back func
                                scope.back();
                            }

                            // Did they press a number
                            else if (input.keyCode >= 48 && input.keyCode <= 57) {

                                // Check length
                                if (scope.number.length >= scope.messageData.lengthMax) return false;

                                // Append char
                                scope.number += String.fromCharCode(input.keyCode);

                            }
                        }
                    };
                    scope.send = function () {

                        // Test for minimum input length
                        if (scope.number.length < scope.messageData.lengthMin) {
                            scope.error = true;
                            scope.errorMessage = 'Minimum length is ' + scope.messageData.lengthMin;
                            return false;
                        }

                        scope.sendBtnDisable = true;

                        SelfService.postSelfServiceMessageToConversation(scope.number, 'application/vnd.cs.mobile.alphanum', scope.number, scope.messageData.id).then(
                            function (result) {

                                angular.forEach(result.messagesFromUser, function (message) {

                                    scope.selfServiceMessages.push(message)
                                });

                                angular.forEach(result.messagesToUser, function (message) {

                                    scope.selfServiceMessages.push(message)
                                });

                                scope.currentWidget = null;
                                scope.sendBtnDisable = false;
                                scope.number = '';
                                $rootScope.$broadcast('user-input:new:message');
                            },
                            function (reject) {

                                console.log(reject);
                            }
                        )
                    };
                    scope.back = function () {

                        if (scope.number.length > 0) {

                            scope.number = scope.number.substring(0, scope.number.length - 1);
                        }
                    };

                    var _input = $('#input-field');
                    _input.on('focus', function (e) {

                        if (scope.error) {
                            scope.$apply(function () {
                                scope.error = false;
                                scope.errorMessage = '';
                            })
                        }
                    });

                    // Toggle focused input class
                    scope.$watch('error', function (n, o) {

                        if (n) {
                            _input.removeClass('focused-input');
                        }
                        else {
                            _input.addClass('focused-input');
                        }
                    })
                }
            }
        }])

    // provides a native widget containing a numeric only keypad
    .directive('productNativeDecimalContainer', [
        'SelfService',
        '$rootScope',
        function (SelfService, $rootScope) {
            return {
                restrict: 'E',
                replace: true,
                scope: false,
                templateUrl: 'views/directives/self-service/native-decimal.html',
                link: function (scope, elem, attrs) {

                    scope.number = '';
                    scope.sendBtnDisable = false;
                    scope.error = false;
                    scope.errorMessage = '';

                    scope.enter = function (input) {

                        if (scope.error) {
                            scope.error = false;
                            scope.errorMessage = '';
                        }

                    };
                    scope.send = function () {

                        if (scope.decimalForm.number.$error.number) {
                            scope.error = true;
                            scope.errorMessage = "Number is invalid.";
                            return false;
                        }

                        // Test for minimum input length
                        if (scope.decimalForm.number.$error.minlength) {

                            scope.error = true;
                            scope.errorMessage = 'Minimum length is ' + scope.messageData.lengthMin;
                            return false;
                        }

                        // Test for maximum input length
                        if (scope.decimalForm.number.$error.maxlength) {
                            scope.error = true;
                            scope.errorMessage = 'Maximum length is ' + scope.messageData.lengthMax;
                            return false;
                        }

                        scope.sendBtnDisable = true;

                        SelfService.postSelfServiceMessageToConversation(scope.number, 'application/vnd.cs.mobile.alphanum', scope.number, scope.messageData.id).then(
                            function (result) {

                                angular.forEach(result.messagesFromUser, function (message) {

                                    scope.selfServiceMessages.push(message)
                                });

                                angular.forEach(result.messagesToUser, function (message) {

                                    scope.selfServiceMessages.push(message)
                                });

                                scope.currentWidget = null;
                                scope.sendBtnDisable = false;
                                scope.number = '';
                                $rootScope.$broadcast('user-input:new:message');
                            },
                            function (reject) {

                                console.log(reject);
                            }
                        )
                    };
                    scope.back = function () {

                        if (scope.number.length > 0) {

                            scope.number = scope.number.substring(0, scope.number.length - 1);
                        }
                    };

                    var _input = $('#input-field');
                    _input.on('focus', function (e) {

                        if (scope.error) {
                            scope.$apply(function () {
                                scope.error = false;
                                scope.errorMessage = '';
                            })
                        }
                    });
                }
            }
        }])


    // HTML KEYPADS
    // Numeric Keypad and symbols
    .directive('productNumericKeypadWithSymbols', [
        function () {

            return {
                restrict: 'E',
                replace: true,
                scope: false,
                templateUrl: 'views/directives/self-service/numeric-keypad-with-symbols.html',
                link: function (scope, elem, attrs) {

                    scope.showNumbers = true;

                    scope.toggleKeypad = function () {
                        scope.showNumbers = !scope.showNumbers;
                    }
                }
            }
        }
    ])

    // Telephone Keypad and symbols
    .directive('productTelephoneKeypad', [
        function () {

            return {
                restrict: 'E',
                replace: true,
                scope: false,
                templateUrl: 'views/directives/self-service/telephone-keypad.html',
                link: function (scope, elem, attrs) {


                }
            }
        }
    ])

    // Telephone Keypad and symbols
    .directive('productNumericOnlyKeypad', [
        function () {

            return {
                restrict: 'E',
                replace: true,
                scope: false,
                templateUrl: 'views/directives/self-service/numeric-only-keypad.html',
                link: function (scope, elem, attrs) {


                }
            }
        }
    ])

    // Telephone Keypad and symbols
    .directive('productDecimalKeypad', [
        function () {

            return {
                restrict: 'E',
                replace: true,
                scope: false,
                templateUrl: 'views/directives/self-service/decimal-keypad.html',
                link: function (scope, elem, attrs) {


                }
            }
        }
    ])


    // HELPERS
    .directive('stringToNumber', function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                ngModel.$parsers.push(function (value) {
                    return '' + value;
                });
                ngModel.$formatters.push(function (value) {
                    return parseFloat(value, 10);
                });
            }
        };
    })
    .directive('survey', ['SurveyService', 'AuthService', 'AppStateValues', 'AppState', function (SurveyService, AuthService, AppStateValues, AppState) {

        return {
            restrict: 'E',
            scope: {},
            templateUrl: 'views/directives/modals/survey-modal.html',
            link: function (scope, elem, attrs) {

                var modalId = 'surveyModal';

                scope.questions = [];
                scope.currentQuestion = null;

                var showModal = function () {

                    $('#' + modalId).modal('show');
                };

                var hideModal = function () {

                    $('#' + modalId).modal('hide');
                };


                scope.finishSurvey = function () {

                    SurveyService.finishSurvey(AuthService.user(), scope.questions).then(
                        function (result) {
                            hideModal();
                        },

                        function (reject) {
                            hideModal();
                        }
                    )

                    AppState.setStateAndRoute(AppStateValues.ASV_MENU);
                };

                scope.cancelSurvey = function () {

                    hideModal();
                    AppState.setStateAndRoute(AppStateValues.ASV_MENU);
                };

                scope.$on('survey:start', function (e) {
                    SurveyService.launchSurvey(AuthService.user()).then(
                        function (result) {

                            scope.questions = result.data;
                            scope.currentQuestion = scope.questions[0];
                            showModal();
                        },
                        function (reject) {

                            throw 'unable to launch survey';
                        }
                    )
                })
            }
        }
    }]);




var HeaderComponent = ['$rootScope','DeviceConfigService', 'ChatWindowToggleService', 'BrowserNotificationService', '$location', function ($rootScope, DeviceConfigService, ChatWindowToggleService, BrowserNotificationService, $location) {

    return {

        restrict: 'E',
        scope: {
            title: '=',
            btnEnable: '='
        },
        templateUrl: 'views/directives/components/header.html',
        link: function (scope, elem, attrs) {

            var defaultBtnsEnabled = {
                back: false,
                resolve: false,
                toggle: false,
                close: false,
                userPrefs: false,
                closePrefs: false,
                parentWindow: false,
                agentChat: false,
                print: false
            };

            // Merge default buttons and controller assigned buttons
            scope.btnEnable = Object.assign(angular.copy(defaultBtnsEnabled), scope.btnEnable);

            scope.minimized = false;

            // Is this a mobile device
            scope.mobile = DeviceConfigService.get('mobile');

            // what kind of device is this
            scope.device = DeviceConfigService.get('device');

            // Print the conversation screen
            scope.print = function () {

                window.focus();
                window.print();
            };

            // Minimize/Maximize chat window in browser
            scope.toggle = function () {

                scope.minimized = !scope.minimized;

                // jQuery time!  Manipulate element css
                if (scope.minimized) {
                    // Using jQuery here
                    $(parent.document.getElementById('cs-iframe-container')).css({
                        height: 35 + 'px'
                    }).removeClass('open').addClass('closed');

                    $rootScope.$broadcast('header:button:minimize');
                }
                else {
                    // Using jQuery here
                    $(parent.document.getElementById('cs-iframe-container')).css({
                        height: 550 + 'px'
                    }).removeClass('closed').addClass('open');

                    $rootScope.$broadcast('header:button:maximize');
                }
            };

            // Close the chat and disconnect
            scope.close = function () {

                $rootScope.$broadcast('header:button:close');

                // clean up before window/iframe closes
                // This function defined: scripts/app.js
                window.onbeforeunload();
            };

            // Got to previous screen
            scope.back = function () {

                $rootScope.$broadcast('header:button:back');
            };

            // Resolve a chat
            scope.resolve = function () {

                // delegate to controller implementation
                $rootScope.$broadcast('header:button:resolve');
            }

            // Chat with agent
            scope.agentChat = function () {
                // delegate to controller implementation
                $rootScope.$broadcast('header:button:agent-chat');
            }

            // User prefs
            scope.prefs = function () {
                // delegate to controller implementation
                $rootScope.$broadcast('header:button:prefs');
            }

            scope.testNotifications = function () {
                BrowserNotificationService.notifyMeNow();
            }

            scope.testSurvey = function () {

                $location.url('/survey');
            }
        }
    }
}];

var ContentComponent = [function () {

    return {

        restrict: 'E',
        scope: {
            hasFooter: '='
        },
        templateUrl: 'views/directives/components/content.html',
        transclude: true,
        link: function (scope, elem, attrs) {


            function setFullHeight(hasFooter) {
                if (!hasFooter) {
                    $('#content-container').css({
                        bottom: 0
                    })
                }
                else {
                    $('#content-container').css({
                        bottom: 50 + 'px'
                    })
                }
            }

            // Set fullheight variable on instantiation
            setFullHeight(scope.hasFooter);

            // Sets the content container to full width if no fixed footer is needed
            scope.$watch('hasFooter', function (n, o) {

                setFullHeight(n)
            });
        }
    }
}];

var FooterComponent = [function () {

    return {
        restrict: 'E',
        scope: {},
        transclude: true,
        templateUrl: 'views/directives/components/footer.html',
        link: function (scope, elem, attrs) {}
    }
}];

var HistoryList = ['HistoryService', function (HistoryService) {

    return {
        restrict: 'E',
        replace: true,
        scope: {},
        templateUrl: 'views/directives/components/history-list.html',
        link: function (scope, elem, attrs) {

            scope.loading = false;
            scope.historyItems = [];

            scope.loadHistory = function () {

                scope.loading = true;

                HistoryService.getHistoryFromServer().then(
                    function(result) {

                        scope.historyItems = result.data;
                    },
                    function (reject) {

                        console.log(reject);
                    }
                ).finally(function () {

                    scope.loading = false;
                })
            };

            scope.removeHistoryItem = function (item) {

                var i = 0;
                while (i < scope.historyItems.length) {

                    if (item.conversationGuid === scope.historyItems[i].conversationGuid) {
                        scope.historyItems.splice(i, 1);
                        break;
                    }
                    i++
                }
            };

            scope.$on('history-list-item:conversation:archived', function (e, historyItem) {

                scope.removeHistoryItem(historyItem);
            });

            // Init directive
            scope.loadHistory();
        }
    }
}];

var HistoryListItem = ['AuthService', 'AppState', 'AppStateValues', 'HistoryService', 'MessageService', 'SystemConfigService',
    function (AuthService, AppState, AppStateValues, HistoryService, MessageService, SystemConfigService) {

        return {
            restrict: 'E',
            replace: true,
            scope: {
                item: '='
            },
            templateUrl: 'views/directives/components/history-list-item.html',
            link: function (scope, elem, attrs) {

                scope.resumeConversation = function () {

                    // Set the conversationGuid
                    MessageService.setConversationGuid(scope.item.conversationGuid);

                    // Is this a self service conversation
                    if (scope.item.userState === 'auto') {

                        // Yes.  Route to Self Service
                        AppState.setStateAndRoute(AppStateValues.ASV_SELF_SERVICE);
                    }
                    else {

                        // No.  Route to Conversation
                        AppState.setStateAndRoute(AppStateValues.ASV_CONVERSATION);
                    }
                };

                scope.archiveConversation = function () {

                    HistoryService.archiveConversation(scope.item).then(
                        function (result) {

                            scope.$emit('history-list-item:conversation:archived', scope.item);
                        },
                        function (reject) {

                            console.log(reject);
                        }
                    ).finally (function () {})
                }

                scope.formatDate = function () {

                    return moment(scope.item.lastMsgTstamp).format(SystemConfigService.get('messageDateFormat'))
                }
            }
        }
    }];

var InputCtrl = ['$scope', 'MessageService', "DeviceConfigService", 'MqService', 'AuthService', function ($scope, MessageService, DeviceConfigService, MqService, AuthService) {

    var self = this;

    self.sendInProgress = false;
    self.inputMessage = '';
    self.userTyping = false;
    self.agentTyping = false;
    self.files = null;
    self.browserRecorded = false;
    self.recording = false;
    self.recorder = null;

    // Does this browser have UserMedia functionality
    self.hasGetUserMedia = function () {
        return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia || navigator.msGetUserMedia);
    };

    // Send message
    self.sendMessage = function () {

        // Don't resend messages;
        if (self.sendInProgress) return;

        // Alias message
        var input = angular.copy(self.inputMessage);

        // Add Optional Validation
        // Input was null or empty string
        // No reason to send
        if (input === undefined || input === null || input === '') return false;

        self.sendInProgress = true;

        // Send this message to the server
        MessageService.postMessage(input, '', 'text/plain').then(
            // Success
            function (result) {

                self.inputMessage = '';
                $scope.$emit('user-input:new:message', result);
            },
            // Error
            function (reject) {

                // Handled in error handler defined in 'scripts/app.js'
                throw reject;
            }
        ).finally(
            function () {

                self.sendInProgress = false;
                self.userTyping = false;
            }
        )
    };

    // Records audio
    self.recordAudio = function () {

        if (self.hasGetUserMedia()) {
            self.browserRecorded = true;
            self.recording = true;
            navigator.getUserMedia = ( navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia);

            navigator.getUserMedia({audio: true}, success, function (s) {
                alert('Error capturing audio.');
            });
        } else alert('getUserMedia not supported in this browser.');

        function success(s) {
            var audioContext = window.AudioContext || window.webkitAudioContext;
            var context = new audioContext();
            var mediaStreamSource = context.createMediaStreamSource(s);
            self.recorder = new Recorder(mediaStreamSource);
            self.recorder.record();
        }
    };

    // Stop recording audio
    self.stopRecording = function () {

        self.recording = false;
        self.recorder.stop();

        // @TODO: Alert user that audio is encoding

        self.recorder.exportWAV(function (s) {
            s.name = 'audio';
            self.upload(s);
        })
    };

    // Checks files being uploads and...uploads files.
    self.upload = function (inFile) {

        // Did we pass in a file or is there one in the files array of the file upload element
        if (inFile || (self.files && self.files.length)) {

            // Assign to a local variable
            var file = inFile || self.files[0];


            // Check file type.  If it's not an image or is an image
            // and doesn't match one of the allowed extensions
            // notify the user and clear the files array
            // Included video because of the mimetype changin below
            if (file.type.substr(0, 5) !== 'image' && file.type.substr(0, 5) !== 'audio' && file.type.substr(0, 5) !== 'video') {

                // Alert user
                alert('Only image and audio files can be uploaded.');

                // Set files array to null
                self.files = null;

                // stop processing
                return false;
            }

            // If we are a FireFox browser or...iOS device
            if ((DeviceConfigService.get('browser') === 'mozilla' && !browserRecorded) || DeviceConfigService.get('browser') === 'safari' || (DeviceConfigService.get('device') === 'iOS')) {

                // we only allow these types of files
                if (file.type != 'image/png' && file.type != 'image/jpg' && file.type != 'image/jpeg' && file.type != 'audio/mp4' && file.type != 'video/mp4') {

                    // Notify user
                    alert("Only PNG and JPG images and MP4 audio files are supported.");

                    // Set files array to null
                    self.files = null;

                    return false;
                }

                // we only allow these files for the rest of supported devices/browsers
            } else if (file.type != 'image/png' && file.type != 'image/jpg' && file.type != 'image/jpeg' && file.type != 'audio/mp4' && file.type != 'video/mp4' && file.type != 'audio/wav' && file.type != 'audio/x-wav') {

                // Notify user
                alert("Only PNG and JPG images, or MP4 and WAV audio files are supported.");

                // Set files array to null
                self.files = null;

                return false;
            }

            // We have a good file.  Confirm upload.
            if (!confirm('Upload ' + file.name + '?')) {

                // Cancel file upload
                self.files = null;

                return false;
            }
            else {

                switch (file.type.substr(0, 5)) {

                    case 'audio':

                        break;

                    case 'image':

                        break;

                    case 'video':

                    default:


                }

                // @TODO: Show loading screen

            }


            //base64 for Mobile Gateway
            var reader = new FileReader();
            //var file64 = file64 = btoa(binaryString);

            // define load function for file reader
            reader.onload = function () {
                var array64 = reader.result.split(',');
                var first = array64[0];
                var start = first.indexOf(":") + 1;
                var end = first.indexOf(";");
                var mimeType = first.substring(start, end);

                if (mimeType == "video/mp4")
                    mimeType = "audio/mp4";

                MessageService.postMessage(null, {encodedData: array64[1]}, mimeType)// handle response
                    .then(function (response) {
                            // Notify the application that a message was received
                            // $rootScope.$broadcast('user-input:new:message', file.type.substr(0, 5));
                            $scope.$emit('user-input:new:message', response);

                            // reset this flag regardless
                            self.browserRecorded = false;

                        },
                        function (reject) {

                           console.log(reject)
                        }
                    );
            };

            // call file upload
            reader.readAsDataURL(file);
        }
    };

    // Send user typing/paused message
    self.userInputActive = function () {

        if (!self.userTyping && self.inputMessage !== "") {

            // Set flag for user typing
            self.userTyping = true;

            // Send the typing indicator
            MqService.sendTypingActive(AuthService.user(), MessageService.getConversationGuid());
        }

        // Check if user has erased all input
        // if so send user pause typing message
        else if (self.userTyping && self.inputMessage === "") {

            // Set flag for user typing
            self.userTyping = false;

            // Send the typing indicator
            MqService.sendTypingPaused(AuthService.user(), MessageService.getConversationGuid());
        }

        // If we need to send user pause on actual user pause
        // just re enable this code
        /*if (userPausedTimer != false) {
         $timeout.cancel(userPausedTimer);
         }

         userPausedTimer = $timeout(function () {
         $scope.userTyping = false;
         csStropheService.sendPauseTyping(AuthService.user());
         }, SystemConfigService.get('userPausedTypingTime'));*/

    };

    // Watch the files array to see if the user is uploading a file
    $scope.$watch(function(){return self.files;}, function (n, o) {
        self.upload();
    });

    $scope.$on('agent:composing:message', function (e) {

        $scope.$apply(function () {
            self.agentTyping = true;
        })
    });

    $scope.$on('agent:paused:message', function (e) {

        $scope.$apply(function () {
            self.agentTyping = false;
        })
    });
}];

var InputComponent = [function () {

    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'views/directives/components/input-component.html',
        controller: InputCtrl,
        controllerAs: 'inputctrl',
        link: function (scope, elem, attrs, ctrl) {

            scope.attachEvents = function () {

                $(elem).on('keypress keyup', function (e, data) {

                    if (e.keyCode === 13) {
                        ctrl.sendMessage();
                    }
                    else {

                        ctrl.userInputActive();
                    }

                })

                $('#user-input').on('focus', function () {
                    scope.$emit('user-input:user-input-focus');
                });

            };

            scope.attachEvents();
        }
    }
}];

var MessageListCtrl = ['$scope', '$timeout', 'MessageService', 'AppState', 'AppStateValues', 'CalendarData', 'ArticleService', function ($scope, $timeout, MessageService, AppState, AppStateValues, CalendarData, ArticleService) {

    var self = this;

    self.userState = null;
    self.messages = [];
    self.loading = true;

    function handleNonTextMessage(message) {

        switch (message.mimeType) {

            case 'application/vnd.cs.mobile.menu':
                $scope.currentWidget = 'menu';
                $scope.message = message;
                break;

            case 'application/vnd.cs.mobile.calendar':
                $scope.currentWidget = 'calendar';
                $scope.message = message;
                CalendarData.init($scope.message.messageData);
                break;

            case 'application/vnd.cs.mobile.spinner':
                $scope.currentWidget = 'spinner';
                $scope.message = message;
                break;

            case 'application/vnd.cs.mobile.picker.date':
                $scope.currentWidget = 'date-picker';
                $scope.message = message;
                break;

            case 'application/vnd.cs.mobile.payment.card.expdate':
                $scope.currentWidget = 'expiry';
                $scope.message = message;
                break;

            case 'application/vnd.cs.mobile.kb':

                $scope.message = message;

                switch($scope.message.messageData.id) {

                    case 'Search Results':

                        angular.forEach($scope.message.messageData.article, function (article) {
                            article['messageType'] = 'article';
                            self.messages.push(article);
                        });

                        angular.forEach($scope.message.messageData.button, function (button) {

                            if (button.name == 'Agent' && MessageService.getConversationData().userState != 'live') {
                                $scope.$emit('message-list:update-header-btns', {agentChat: true})
                            }
                        });

                        $scope.currentWidget = 'knowledge-base';
                        break;

                    case 'Article Feedback':

                        $scope.menuData = {
                            button: [],
                            mimeType: $scope.message.mimeType,
                            id: $scope.message.messageData.id
                        };

                        angular.forEach($scope.message.messageData.button, function (button) {

                            if (button.name == 'No' || button.name == 'Yes') {
                                button.id = $scope.message.messageData.id;
                                button.articleId = ArticleService.getContentId();
                                button.type = button.value;
                                button.message = button.name;
                                $scope.menuData.button.push(angular.copy(button));
                            }
                        });

                        $scope.currentWidget = 'ssc-menu';
                        break;
                }
                break;

            case 'application/vnd.cs.mobile.alphanum':

                $scope.message = message;

                // Check to make sure we have keyboardStart property
                if (!$scope.message.messageData.hasOwnProperty('keyboardStart')) throw 'SelfService Error: No keyboardStart property missing.';

                // Check to make sure we have numericOnly property
                if (!$scope.message.messageData.hasOwnProperty('numericOnly')) throw 'SelfService Error: numericOnly property missing.';

                // What keyboard/input type
                switch ($scope.message.messageData.keyboardStart) {

                    // Only digits (no dashes, hashes, slashes, or periods)
                    case 'digits':

                        // digits is numeric only
                        // Is this redundant as digits specifies numeric only input
                        // See 3.1.4 Alphanums in MyTime 2.0 Mobile Gateway
                        if ($scope.message.messageData.numericOnly) {

                            // Choose a specific widget based on id
                            switch ($scope.message.messageData.id) {

                                // We use the numeric only keypad for telephone input
                                // Should MGW be responsible for parsing different types of phone numbers?
                                case 'Phone Number':

                                    $scope.currentWidget = 'telephone';
                                    break;

                                default:
                                    $scope.currentWidget = 'numeric-only';
                            }
                        }
                        else {

                            $scope.currentWidget = 'numeric-with-symbols';
                        }

                        return false;

                    // This specifies numeric input but with decimals
                    case 'num':

                        if ($scope.message.messageData.numericOnly) {

                            // Choose a specific widget based on id
                            switch ($scope.message.messageData.id) {


                                case 'Decimal Number':

                                    $scope.currentWidget = 'decimal';
                                    break;

                                default:
                                    $scope.currentWidget = 'numeric-only';
                            }
                        }
                        else {

                            $scope.currentWidget = 'numeric-with-symbols';
                        }

                        return false;


                    case 'alpha':

                        switch ($scope.message.messageData.id) {

                            case 'Letters and Digits':

                                $scope.currentWidget = 'alpha-num';
                                break;

                            default:

                                $scope.currentWidget = 'alpha-num';
                        }
                        break;

                    default:

                        throw 'SelfService AlphaNum:  What should be the default keyboard?'
                }

                break;

            case 'application/vnd.cs.mobile.telephone':
                AppState.setStateAndRoute(AppStateValues.ASV_MENU);
                break;
        }

    };

    function scrollContent() {

        $timeout(function () {
            $('#content').animate({
                scrollTop: $('#message-list-scroll-bottom').position().top
            }, 'slow')
        }, 500);
    };

    $scope.$on('message-list:new-message', function (e, data) {

        // Add new messages to messages list
        self.messages = self.messages.concat(data);

        // reset widgets
        $scope.currentWidget = null;

        // Get the last message
        var lastMessage = self.messages[self.messages.length - 1];

        // check the last message mime-type.
        if (lastMessage.mimeType !== 'text/plain') {

         // It's not a text message so handle it
         handleNonTextMessage(lastMessage);
         }

        scrollContent();
    });

    $scope.$on('message-list:set-messages', function (e, data) {

        // Loop through the messages
        angular.forEach(data, function (message) {

            // Add message it messages array
            self.messages.push(message);

            // Check if it has a mimetype of 'application/vnd.cs.mobile.kb'
            if (message.mimeType === 'application/vnd.cs.mobile.kb') {

                // If so is it a search result
                if (message.messageData.id === 'Search Results') {

                    // Send this to the message handler
                    handleNonTextMessage(message);
                }
            }
        });

        // get the last message
        var lastMessage = self.messages[self.messages.length - 1];

        // get the last message mime-type.
        if (lastMessage.mimeType !== 'text/plain') {

            // Send to the message handler
            handleNonTextMessage(lastMessage);
        }

        scrollContent();
    });

    $scope.$on('message-list:scroll-content-bottom', function (e) {
        scrollContent();
    });

    $scope.$on('message-list:loading', function (e, toggle) {
        self.loading = toggle;
    });
}];

var MessageList = ['MessageService', function (MessageService) {

    return {
        restrict: "E",
        scope: {
            appState: '='
        },
        templateUrl: 'views/directives/components/message-list.html',
        controller: MessageListCtrl,
        controllerAs: 'messagelistctrl',
        link: function (scope, elem, attrs, ctrl) {

        }
    }
}];

var UserMessage = ['DeviceConfigService', 'SystemConfigService', function (DeviceConfigService, SystemConfigService) {

    return {
        restrict: 'E',
        replace: true,
        scope: {
            message: '='
        },
        templateUrl: 'views/directives/components/user-message.html',
        link: function (scope, elem, attrs) {

            scope.device = DeviceConfigService.get('device');

            scope.formatDate = function () {

                return moment(scope.message.createTstamp).format(SystemConfigService.get('messageDateFormat'))
            }
        }
    }
}];

var AgentMessage = ['DeviceConfigService', 'SystemConfigService', function (DeviceConfigService, SystemConfigService) {

    return {
        restrict: 'E',
        replace: true,
        scope: {
            message: '='
        },
        templateUrl: 'views/directives/components/agent-message.html',
        link: function (scope, elem, attrs) {
            scope.device = DeviceConfigService.get('device');

            scope.formatDate = function () {

                return moment(scope.message.createTstamp).format(SystemConfigService.get('messageDateFormat'))
            }
        }
    }
}];

var AutoMessage = ['DeviceConfigService', 'SystemConfigService', function (DeviceConfigService, SystemConfigService) {

    return {
        restrict: 'E',
        replace: true,
        scope: {
            message: '='
        },
        templateUrl: 'views/directives/components/auto-message.html',
        link: function (scope, elem, attrs) {

            scope.device = DeviceConfigService.get('device');

            scope.formatDate = function () {

                return moment(scope.message.createTstamp).format(SystemConfigService.get('messageDateFormat'))
            }
        }
    }
}];

var ArticleMessage = [function () {

    return {
        restrict: 'E',
        replace: true,
        scope: {
            message: '='
        },
        templateUrl: 'views/directives/components/article-message.html',
        link: function (scope, elem, attrs) {}
    }
}];

var SmallFaqArticlesList = ['FaqService', function (FaqService) {

    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'views/directives/components/small-faq-articles-list.html',
        link: function (scope, elem, attrs) {

            scope.search = {
                text: ''
            };

            scope.faqArticleItems = FaqService.getCachedFaqArticles();

        }
    }
}];

var SmallFaqArticleListItem = ['SystemConfigService', '$location', '$routeParams', function (SystemConfigService, $location, $routeParams) {

    return {
        restrict: 'E',
        replace: true,
        scope: {
            article: '='
        },
        templateUrl: 'views/directives/components/small-faq-article-list-item.html',
        link: function (scope, elem, attrs) {

            scope.routeToArticle = function () {

                $location.url('/faqs/' + $routeParams.labelGuid + '/' + scope.article.articleGuid)
            };

            scope.routeToArticleSmallFaq = function () {

                $location.url('/faq-small/' + scope.article.articleGuid);
            };

            scope.getArticle = function () {

                if (SystemConfigService.get('faqServerSearch')) {

                }
                else {
                    scope.routeToArticleSmallFaq();
                }
                scope.routeToArticle();
            }
        }
    }
}];

var FaqArticle = [function () {

    return {
        restrict: 'E',
        scope: {
            faqArticle: '='
        },
        templateUrl: 'views/directives/components/faq-article.html',
        link: function (scope, elem, attrs) {

        }
    }
}];

var LargeFaqLabelsList = ['FaqService', 'FaqSearchService', function (FaqService, FaqSearchService) {

    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'views/directives/components/large-faq-labels-list.html',
        link: function (scope, elem, attrs) {

            // Cache our input element
            scope.$searchInputElem = $('#faq-search');

            // FAQ Labels are resolved in app.js
            scope.faqLabelItems = FaqService.getFaqLabels();

            // Set search model
            scope.search = {
                text: FaqService.getCachedSearchText(),
                results: FaqService.getCachedSearchText() != null ? FaqService.getCachedFaqArticles() : null
            };

            // Send search criteria up to server.
            // Assign the results on success.
            // Error out if bad response.
            scope.send = function (e) {

                // Query server
                FaqSearchService.search(scope.search.text).then(
                    function (result) {

                        // Assign results
                        scope.search.results = result.data.searchResults === null ? [] : result.data.searchResults;

                        // Cache the search
                        FaqService.cacheSearch(scope.search);

                    },
                    function (reject) {

                        // Handle error
                        throw 'Search returned an error.';
                    }
                ).finally(
                    function () {

                    }
                )
            };

            // Load an article
            scope.getFaqArticle = function (item) {

                // Goto the article
                $location.url('/faqs/' + item.labels[0].labelGuid + '/' + item.articleGuid);
            }

            // Add event handlers
            scope.attachEvents = function () {

                scope.$searchInputElem.on('keypress', function (e, data) {

                    if (e.keyCode === 13) {
                        scope.send();
                    }
                })
            };

            // Init()
            scope.attachEvents();

        }
    }
}];

var FaqLabelListItem = ['SystemConfigService', '$location', '$routeParams', function (SystemConfigService, $location, $routeParams) {

    return {
        restrict: 'E',
        replace: true,
        scope: {
            label: '='
        },
        templateUrl: 'views/directives/components/faq-label-list-item.html',
        link: function (scope, elem, attrs) {


            scope.getArticles = function (faqLabelItem) {

                $location.url('/faqs/' + scope.label.labelGuid)
            };
        }
    }
}];

var LargeFaqArticlesList = ['FaqService', '$routeParams', function (FaqService, $routeParams) {

    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'views/directives/components/large-faq-articles-list.html',
        link: function (scope, elem, attrs) {

            scope.search = {
                text: ''
            };

            scope.label = FaqService.getFaqLabel($routeParams.labelGuid);

            scope.faqArticleItems = FaqService.getCachedFaqArticles();

        }
    }
}];

var SscArticleFeedbackBar = [function () {

    return {
        restrict: 'E',
        replace: true,
        scope: {},
        templateUrl: 'views/directives/components/ssc-article-feedback-bar.html',
        link: function (scope, elem, attrs) {

            scope.thumbsUp = function () {

                scope.$emit('ssc-article-feedback-bar:thumbs-up');
            }

            scope.thumbsDown = function () {

                scope.$emit('ssc-article-feedback-bar:thumbs-down');
            }
        }
    }
}];

var NotificationsList = ['NotificationService', function (NotificationService) {

    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'views/directives/components/notifications-list.html',
        link: function (scope, elem, attrs) {

            scope.notificationItems = [];
            scope.loading = false;
            scope.stateToggle = 'Unread';
            scope.totalUnread = 0;
            scope.totalRead = 0;

            scope.getNotifications = function () {

                scope.loading = true;
                scope.notificationItems = [];
                NotificationService.getNotificationsFromServer().then(
                    function (result) {

                        scope.notificationItems = result.data;
                    },
                    function (reject) {

                        console.log(reject);
                    }
                ).finally(function () {
                    scope.loading = false;
                })
            };

            scope.getTotalUnread = function () {

                var _totalUnread = 0;

                angular.forEach(scope.notificationItems, function (v,i) {

                    if (v.notificationState === 'Unread') {
                        _totalUnread++;
                    }
                });

                scope.totalUnread = _totalUnread;
            };

            scope.getTotalRead = function () {

                var _totalRead = 0;

                angular.forEach(scope.notificationItems, function (v,i) {

                    if (v.notificationState === 'Read') {
                        _totalRead++;
                    }
                })

                scope.totalRead = _totalRead;
            };

            scope.setNotificationTotals = function () {

                scope.getTotalUnread();
                scope.getTotalRead();
            }

            scope.getTotalNotificationItems = function () {

                return scope['total' + scope.stateToggle];
            };

            scope.showUnread = function () {
                scope.stateToggle = 'Unread';
                scope.getNotifications();
            };

            scope.showRead = function () {
                scope.stateToggle = 'Read';
                scope.getNotifications();
            };

            scope.init = function() {

                scope.getNotifications();
            };

            scope.init();

            scope.$watch('notificationItems', function (n, o) {

                scope.setNotificationTotals();
            })
        }
    }
}];

var NotificationListItem = ['SystemConfigService', function (SystemConfigService) {

    return {
        restrict: 'E',
        scope: {
            notification: '='
        },
        templateUrl: 'views/directives/components/notification-list-item.html',
        link: function (scope, elem, attrs) {

            scope.onItemClick = function () {

                scope.$emit('notification-item:open', scope.notification);
            }

            scope.formatDate = function () {

                return moment(scope.notification.displayTstamp).format(SystemConfigService.get('messageDateFormat'))
            }
        }
    }
}];

var NotificationStateFilter = [function () {

    return function (items, query) {


        if (items.length === 0) return items;

        var _filtered = [];

        angular.forEach(items, function (v, i) {

            if (v.notificationState === query) {

                _filtered.push(v);
            }
        })

        return _filtered;
    }
}];

var Loading = [function() {

    return {
        restrict: 'E',
        scope: {
            visible: '=',
            showText: '=',
            placement: '@',
            loadingMessage: '@'
        },
        templateUrl: 'views/directives/components/loading.html',
        link: function (scope, elem, attrs) {

            scope.loadingMessage = scope.loadingMessage == undefined ? 'Loading' : scope.loadingMessage;
            scope._showText = scope.showText == undefined ? true : scope.showText;
            scope.placement = scope.placement || 'middle-center';
            scope.verticalAlign = 'middle';
            scope.horizontalAlign = 'center';

            var parsePlacement = function () {
                var placementArr = scope.placement.split('-');
                scope.verticalAlign = placementArr[0];
                scope.horizontalAlign = placementArr[1];
            };

            var setVerticalAlign = function (alignment) {

                $(elem).find('.loading-container').css({
                    verticalAlign: alignment
                })
            };

            var setHorizontalAlign = function (alignment) {

                $(elem).find('.loading-container').css({
                    textAlign: alignment
                })
            };

            scope.setSpinnerAlignment = function () {
                parsePlacement();
                setVerticalAlign(scope.verticalAlign);
                setHorizontalAlign(scope.horizontalAlign);
            };

            scope.$watch('placement', function (n, o) {

                scope.setSpinnerAlignment()
            })
        }
    }
}];

var Truncate = ['$filter', function ($filter) {

    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            lines: '@'
        },
        link: function (scope, elem, attrs, ngModel) {

            var elemWidth = $(elem).width();
            var fc = 2;
            var fontSize = $(elem).css('font-size');
            var fontNumber = fontSize.match(/(\d+)/g)[0];
            var fontUnits = fontSize.match(/(\D+)/g)[0];
            var lineHeight = $(elem).css('line-height').match(/(\d+)/g)[0];
            var maxLineLength = Math.floor(elemWidth / (fontNumber / fc));

            $(elem).css({
                'height': (scope.lines * lineHeight) + fontUnits,
                'overflowY': 'hidden'
            });
            scope.$watch(function () {return ngModel.$modelValue;}, function (n, o) {

                if (n) {
                    var text = $filter('cut')(ngModel.$modelValue, true, (scope.lines * maxLineLength), ' ...');
                    ngModel.$setViewValue(text);
                }
            });
        }
    }
}];


angular.module('MyTime.Directives')
    .directive('header', HeaderComponent)
    .directive('content', ContentComponent)
    .directive('footer', FooterComponent)
    .controller('InputCtrl', InputCtrl)
    .directive('inputComponent', InputComponent)
    .directive('historyList', HistoryList)
    .directive('historyListItem', HistoryListItem)
    .directive('messageList', MessageList)
    .directive('userMessage', UserMessage)
    .directive('agentMessage', AgentMessage)
    .directive('autoMessage', AutoMessage)
    .directive('articleMessage', ArticleMessage)
    .directive('smallFaqArticlesList', SmallFaqArticlesList)
    .directive('smallFaqArticleListItem', SmallFaqArticleListItem)
    .directive('faqArticle', FaqArticle)
    .directive('largeFaqLabelsList', LargeFaqLabelsList)
    .directive('faqLabelListItem', FaqLabelListItem)
    .directive('largeFaqArticlesList', LargeFaqArticlesList)
    .directive('sscArticleFeedbackBar', SscArticleFeedbackBar)
    .directive('notificationsList', NotificationsList)
    .directive('notificationListItem', NotificationListItem)
    .directive('loading', Loading)
    .filter('notificationStateFilter', NotificationStateFilter)
    .filter('cut', function () {
      return function (value, wordwise, max, tail) {
        if (!value) return '';
        max = parseInt(max, 10);
        if (!max) return value;
        if (value.length <= max) return value;
        value = value.substr(0, max);
        if (wordwise) {
          var lastspace = value.lastIndexOf(' ');
          if (lastspace != -1) {
            //Also remove . and , so its gives a cleaner result.
            if (value.charAt(lastspace-1) == '.' || value.charAt(lastspace-1) == ',' || value.charAt(lastspace-1) == '?'  || value.charAt(lastspace-1) == '!') {
              lastspace = lastspace - 1;
            }
            value = value.substr(0, lastspace);
          }
        }
        return value + (tail || ' …');
      };
    })
    .directive('truncate', Truncate);


