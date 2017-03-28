'use strict';


angular.module('MyTime.MqModule', [])
    .factory('MessageFactory', [function () {

        var resource = 'web';

        function makeLastWillAndTestament(userGuid, companyGuid) {

            return {
                "type":"presence",
                "actor":"user",
                "userGuid":  userGuid,
                "resource": resource,
                "presenceState": "unavailable",
                "show": "dead",
                "conversationGuid": "",
                "companyGuid": companyGuid
            }
        }

        function makeAvailable(user, conversationGuid) {

            return {
                "type":"presence",
                "actor":"user",
                "userGuid": user.userGuid,
                "resource": resource,
                "presenceState": "available",
                "show": "chat",
                "conversationGuid": conversationGuid,
                "companyGuid": user.companyGuid
            }
        }

        function makeUnavailable(user, conversationGuid) {

            return {
                "type":"presence",
                "actor":"user",
                "userGuid":  user.userGuid,
                "resource": resource,
                "presenceState": "unavailable",
                "show": "nil",
                "conversationGuid": conversationGuid,
                "companyGuid": user.companyGuid
            }
        }

        function makeEndChat(user, conversationGuid) {

            return {
                "type":"presence",
                "actor":"user",
                "userGuid":  user.userGuid,
                "resource": resource,
                "presenceState": "unavailable",
                "show": "nil",
                "conversationGuid": conversationGuid,
                "companyGuid": user.companyGuid
            }
        }

        function makeIdle(user, conversationGuid) {

            return {
                "type":"presence",
                "actor":"user",
                "userGuid": user.userGuid,
                "resource": resource,
                "presenceState": "available",
                "show": "away",
                "conversationGuid": conversationGuid,
                "companyGuid": user.companyGuid
            }
        }

        function makeExtendedAway(user, conversationGuid) {

            return {
                "type":"presence",
                "actor":"user",
                "userGuid": user.userGuid,
                "resource": resource,
                "presenceState": "available",
                "show": "xa",
                "conversationGuid": conversationGuid,
                "companyGuid": user.companyGuid
            }
        }

        function makeLeaveScreen(user, conversationGuid) {

            return {
                "type":"presence",
                "actor":"user",
                "userGuid": user.userGuid,
                "resource": resource,
                "presenceState": "unavailable",
                "show": "dead",
                "conversationGuid": conversationGuid,
                "companyGuid": user.companyGuid
            };
        }

        function makeOpenConversation(user, conversationGuid) {

            return 'OPEN CONVERSATION: NOT IMPLEMENTED';
        }

        function makeTypingActive(user, conversationGuid) {

            return {
                "type": "indicator",
                "show": "composing",
                "actor" : "user",
                "userGuid": user.userGuid,
                "conversationGuid": conversationGuid,
                "companyGuid": user.companyGuid
            };
        }

        function makeTypingPaused(user, conversationGuid) {

            return {
                "type": "indicator",
                "show": "paused",
                "actor": "user",
                "userGuid": user.userGuid,
                "conversationGuid": conversationGuid,
                "companyGuid": user.companyGuid
            };
        }

        function makeMessage(user, conversationGuid, messageText) {

            return {
                "type": "message",
                "show": messageText,
                "actor" : "user",
                "name": user.name,
                "resource": resource,
                "mimetype": "text/plain",
                "userGuid": user.userGuid,
                "conversationGuid": conversationGuid,
                "companyGuid": user.companyGuid
            }
        }

        return {
            makeAvailable: makeAvailable,
            makeUnavailable: makeUnavailable,
            makeIdle: makeIdle,
            makeExtendedAway: makeExtendedAway,
            makeLeaveScreen: makeLeaveScreen,
            makeEndChat: makeEndChat,
            makeOpenConversation: makeOpenConversation,
            makeTypingActive: makeTypingActive,
            makeTypingPaused: makeTypingPaused,
            makeMessage: makeMessage,
            makeLastWillAndTestament: makeLastWillAndTestament
    }

    }])
    .service('MqService', ['$rootScope', 'awsMqttFactory', 'MessageFactory', 'SystemConfigService', function ($rootScope, awsMqttFactory, MessageFactory, SystemConfigService) {

        var self = this;
        self.handlers = {
            connect: {},
            reconnect: {},
            message: {},
            close: {}
        };

        // Set the messaging service
        self.messageService = awsMqttFactory;
        self.messageFactory = MessageFactory;

        self.connected = false;

        // Initialize Message Service
        self.init = function (clientId, companyGuid) {

            var lastWill = {
                topic: 'Company/' + companyGuid,
                payload: self.messageFactory.makeLastWillAndTestament(clientId, companyGuid),
                qos: 0
            };

            var endpoint = SystemConfigService.get('awsIotEndpoint'),
                identityPool = SystemConfigService.get('awsCognitoPoolId'),
                region = SystemConfigService.get('awsRegionName');


            self.setClientId(clientId);
            self.messageService.init(region, identityPool, endpoint);
        };

        self.hasConnection = function () {

            return self.messageService.hasConnection();
        };

        self.buildTopic = function (companyGuid, conversationGuid) {

            return 'Company/' + companyGuid.toUpperCase() + '/Conversation/' + conversationGuid.toUpperCase();
        };

        // Send message with message service
        self.send = function (data) {

            if (!data.companyGuid || !data.conversationGuid) return;

            if (self.hasConnection()) {
                self.messageService.publishData(JSON.stringify(data), self.buildTopic(data.companyGuid, data.conversationGuid));
            }
            else {
                throw new Error('No mq connection');
            }
        };

        self.setClientId = function (id) {
            self.messageService.setClientId(id);
        };

        self.subscribe = function (companyGuid, conversationGuid) {

            if (self.hasConnection()) {
                var topic = self.buildTopic(companyGuid, conversationGuid);
                self.messageService.subscribe(topic);
            }
            else {
                throw new Error('No mq connection');
            }
        };

        self.unsubscribe = function (companyGuid, conversationGuid) {

            if (self.hasConnection()) {
                var topic = self.buildTopic(companyGuid, conversationGuid);
                self.messageService.unsubscribe(topic);
            }
            else {
                throw new Error('No mq connection');
            }
        };

        self.sendPresence = function (data) {

            self.messageService.send(data)
        };

        self.sendAvailable = function (user, conversationGuid) {

            self.send(self.messageFactory.makeAvailable(user, conversationGuid))
        };

        self.sendUnavailable = function (user, conversationGuid) {

            self.send(self.messageFactory.makeUnavailable(user, conversationGuid))
        };

        self.sendIdle = function (user, conversationGuid) {

            self.send(self.messageFactory.makeIdle(user, conversationGuid))
        };

        self.sendExtendedAway = function (user, conversationGuid) {

            self.send(self.messageFactory.makeExtendedAway(user, conversationGuid))
        };

        self.sendLeaveScreen = function (user, conversationGuid) {

            self.send(self.messageFactory.makeLeaveScreen(user, conversationGuid))
        };

        self.sendOpenConversation = function (user, conversationGuid) {

            // self.send(self.messageFactory.makeOpenConversation(user, conversationGuid));
        };

        self.sendTypingActive = function (user, conversationGuid) {

            self.send(self.messageFactory.makeTypingActive(user, conversationGuid));
        };

        self.sendTypingPaused = function (user, conversationGuid) {

            self.send(self.messageFactory.makeTypingPaused(user, conversationGuid));
        };

        self.sendUserMessage = function(user, conversationGuid, messageText) {

            self.send(self.messageFactory.makeMessage(user, conversationGuid, messageText));
        };

        self.sendEndChat = function(user, conversationGuid) {

            self.send(self.messageFactory.makeEndChat(user, conversationGuid));
        };

        self.isValidHandlerType = function (type) {

            if (!self.handlers.hasOwnProperty(type)) throw new Error('Handler type '+ type + ' does not exist.  Valid handler types are "connect", "reconnect", "close", and "message".');

            return true;

        };

        self.isValidHandlerName = function (name) {

            if (Object.prototype.toString.call(name) !== '[object String]') throw new Error('Handler name must be a valid string.');

            return true;
        };

        self.isValidHandlerFunction = function (handler) {

            if (Object.prototype.toString.call(handler) !== '[object Function]') throw new Error('Handler must be a "function"');
            return true;
        };

        self.addHandler = function (type, name, handler) {

            self.isValidHandlerType(type);

            self.isValidHandlerName(name);

            self.isValidHandlerFunction(handler);

            self.handlers[type][name] = handler;
        };

        self.removeHandler = function (type, name) {

            self.isValidHandlerType(type);

            self.isValidHandlerName(name);

            delete self.handlers[type][name];
        };

        self.fireConnectHandlers = function () {

            angular.forEach(self.handlers.connect, function (v, i) {
                v.call(this);
            })
        };

        self.fireReconnectHandlers = function () {

            angular.forEach(self.handlers.reconnect, function (v, i) {
                v.call(this);
            })
        };

        self.fireCloseHandlers = function () {

            angular.forEach(self.handlers.close, function (v, i) {
                v.call(this);
            })
        };

        self.fireMessageHandlers = function (payload) {

            angular.forEach(self.handlers.message, function (v, i) {
                v.call(this, payload);
            })
        };

        self.onConnect = $rootScope.$on('mqservice:connected', function () {

            self.fireConnectHandlers();
        });

        self.onReconnect = $rootScope.$on('mqservice:reconnected', function () {

            self.fireReconnectHandlers();
            self.connected = true;
        });

        self.onMessage = $rootScope.$on('mqservice:message', function (e, payload) {

            self.fireMessageHandlers(payload);
        });

        self.onClose = $rootScope.$on('mqservice:closed', function (e) {

            if (self.connected) {
                self.fireCloseHandlers();
            }
        });

        $rootScope.$on('$destroy', function () {

            self.onConnect();
            self.onReconnect();
            self.onMessage();

        })

    }]);