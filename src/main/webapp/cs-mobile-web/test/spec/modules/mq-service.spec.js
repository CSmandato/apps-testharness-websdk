describe('MyTime.MqModule.MqService', function () {

    var MqService, MessageFactory, user, conversationGuid, $rootScope;

    beforeEach(module('MyTime.MqModule'));
    beforeEach(function () {
        user = {
            userGuid: 'testUserGuid',
            companyGuid: 'testCompanyGuid'
        }
    });
    beforeEach(function () {
        conversationGuid = 'testConversationGuid'
    });

    describe('standard', function () {

        beforeEach(function () {

            awsMqttMock = {
                init: function () {
                    return 'init';
                },
                publishData: function () {
                    return true;
                },
                hasConnection: function () {
                    return true;
                },
                subscribe: function () {
                    return true;
                },
                unsubscribe: function () {
                    return true;
                }
            };

            spyOn(awsMqttMock, 'init');
            spyOn(awsMqttMock, 'publishData');
            spyOn(awsMqttMock, 'hasConnection').and.callThrough();


            module(function ($provide) {
                $provide.value('awsMqttFactory', awsMqttMock);
            });

        });
        beforeEach(inject(function ($injector) {
            MessageFactory = $injector.get('MessageFactory');
            $rootScope = $injector.get('$rootScope');
        }));
        beforeEach(inject(function ($injector) {
            MqService = $injector.get('MqService');
        }));

        describe('init', function () {

            beforeEach(function () {

                MqService.init();
            });

            it('Should init the messaging service', function () {

                expect(awsMqttMock.init).toHaveBeenCalled();
            });
        });

        describe('hasConnection', function () {

            beforeEach(function () {

                MqService.hasConnection();
            });

            it('Should check if the messaging service has a connection', function () {

                expect(awsMqttMock.hasConnection).toHaveBeenCalled();
            });
        });

        describe('send', function () {

            describe('check payload', function () {

                beforeEach(function () {

                    spyOn(MqService, 'hasConnection');
                    MqService.send({});
                });

                it('should fail if there is no company guid', function () {

                    expect(awsMqttMock.hasConnection).not.toHaveBeenCalled();
                });

                it('should fail if there is no conversation guid', function () {

                    expect(awsMqttMock.hasConnection).not.toHaveBeenCalled();
                });

            });

            describe('send success', function () {

                beforeEach(function () {

                    var data = {};
                    data['userGuid'] = user.userGuid;
                    data['companyGuid'] = user.companyGuid;
                    data['conversationGuid'] = conversationGuid;

                    MqService.send(data);
                });

                it('Should check for an mq connection before sending a message', function () {

                    expect(awsMqttMock.hasConnection).toHaveBeenCalled();
                });

                it('Should send a message using the defined mq service implementation', function () {

                    expect(awsMqttMock.publishData).toHaveBeenCalled();
                });
            });
        });

        describe('buildTopic', function () {

            var topic;

            beforeEach(function () {

                topic = MqService.buildTopic(user.companyGuid, conversationGuid);
            });

            it('should return the proper topic string', function () {

                expect(topic).toBe('Company/TESTCOMPANYGUID/Conversation/TESTCONVERSATIONGUID');
            });
        });

        describe('subscribe', function () {

            beforeEach(function () {

                spyOn(awsMqttMock, 'subscribe');
                spyOn(MqService, 'buildTopic');

                var data = {};
                data['userGuid'] = user.userGuid;
                data['companyGuid'] = user.companyGuid;
                data['conversationGuid'] = conversationGuid;

                MqService.subscribe(data.companyGuid, data.conversationGuid);

            });

            it('should check if it has a connection before calling subscribe', function () {

                expect(awsMqttMock.hasConnection).toHaveBeenCalled();
            });

            it('should build a topic string from input', function () {

                expect(MqService.buildTopic).toHaveBeenCalled();
            });

            it('should subscribe to a topic', function () {

                expect(awsMqttMock.subscribe).toHaveBeenCalled();
            });

        });

        describe('unsubscribe', function () {

            beforeEach(function () {

                spyOn(awsMqttMock, 'unsubscribe');
                spyOn(MqService, 'buildTopic');

                var data = {};
                data['userGuid'] = user.userGuid;
                data['companyGuid'] = user.companyGuid;
                data['conversationGuid'] = conversationGuid;

                MqService.unsubscribe(data.companyGuid, data.conversationGuid);

            });

            it('should check if it has a connection before calling subscribe', function () {

                expect(awsMqttMock.hasConnection).toHaveBeenCalled();
            });

            it('should build a topic string from input', function () {

                expect(MqService.buildTopic).toHaveBeenCalled();
            });

            it('should unsubscribe from a topic', function () {

                expect(awsMqttMock.unsubscribe).toHaveBeenCalled();
            });

        });

        describe('sendUserMessage', function () {

            beforeEach(function () {

                spyOn(MqService, 'send');
                spyOn(MessageFactory, 'makeMessage');
                MqService.sendUserMessage(user, conversationGuid, 'messageText');
            });

            it('Should send a user message payload', function () {

                expect(MqService.send).toHaveBeenCalled();
                expect(MessageFactory.makeMessage).toHaveBeenCalled();
            });
        });


        describe('sendAvailable', function () {

            beforeEach(function () {

                spyOn(MqService, 'send');
                spyOn(MessageFactory, 'makeAvailable');
                MqService.sendAvailable(user, conversationGuid);
            });

            it('Should send an available presence payload', function () {

                expect(MqService.send).toHaveBeenCalled();
                expect(MessageFactory.makeAvailable).toHaveBeenCalled();
            });
        });

        describe('sendUnavailable', function () {

            beforeEach(function () {
                spyOn(MqService, 'send');
                spyOn(MessageFactory, 'makeUnavailable');
                MqService.sendUnavailable(user, conversationGuid);
            });

            it('Should send an unavailable presence payload', function () {

                expect(MqService.send).toHaveBeenCalled();
                expect(MessageFactory.makeUnavailable).toHaveBeenCalled();
            });
        });

        describe('sendIdle', function () {

            beforeEach(function () {
                spyOn(MqService, 'send');
                spyOn(MessageFactory, 'makeIdle');
                MqService.sendIdle(user, conversationGuid);
            });

            it('Should send an idle presence payload', function () {

                expect(MqService.send).toHaveBeenCalled();
                expect(MessageFactory.makeIdle).toHaveBeenCalled();
            });
        });

        describe('sendExtenedAway', function () {

            beforeEach(function () {

                spyOn(MqService, 'send');
                spyOn(MessageFactory, 'makeExtendedAway');
                MqService.sendExtendedAway(user, conversationGuid);
            });

            it('Should send an extended away presence payload', function () {

                expect(MqService.send).toHaveBeenCalled();
                expect(MessageFactory.makeExtendedAway).toHaveBeenCalled();
            });
        });

        describe('sendLeaveScreen', function () {

            beforeEach(function () {
                spyOn(MqService, 'send');
                spyOn(MessageFactory, 'makeLeaveScreen');
                MqService.sendLeaveScreen(user, conversationGuid);
            });

            it('Should send a leave screen presence payload', function () {

                expect(MqService.send).toHaveBeenCalled();
                expect(MessageFactory.makeLeaveScreen).toHaveBeenCalled();
            });
        });


        /*describe('sendOpenConversation', function () {

            beforeEach(function () {

                spyOn(MqService, 'send');
                spyOn(MessageFactory, 'makeOpenConversation');
                MqService.sendOpenConversation(user, conversationGuid);
            });

            it('Should send an open conversation presence payload', function () {

                expect(MqService.send).toHaveBeenCalled();
                expect(MessageFactory.makeOpenConversation).toHaveBeenCalled();
            });
        });*/

        describe('sendTypingActive', function () {

            beforeEach(function () {

                spyOn(MqService, 'send');
                spyOn(MessageFactory, 'makeTypingActive');
                MqService.sendTypingActive(user, conversationGuid);
            });

            it('Should send a active typing indicator payload', function () {

                expect(MqService.send).toHaveBeenCalled();
                expect(MessageFactory.makeTypingActive).toHaveBeenCalled();
            });
        });

        describe('sendTypingPaused', function () {

            beforeEach(function () {

                spyOn(MqService, 'send');
                spyOn(MessageFactory, 'makeTypingPaused');
                MqService.sendTypingPaused(user, conversationGuid);
            });

            it('Should send a paused typing indicator payload', function () {

                expect(MqService.send).toHaveBeenCalled();
                expect(MessageFactory.makeTypingPaused).toHaveBeenCalled();
            });
        });

        describe('addHandler (connect)', function () {

            beforeEach(function () {

                MqService.addHandler('connect', 'testHandler', function() { return true;});
            });

            it('Should be able to add a "connect" type handler', function () {

                expect(MqService.handlers.connect.hasOwnProperty('testHandler')).toBe(true);
                expect(typeof(MqService.handlers.connect['testHandler'])).toBe('function');
            });
        });

        describe('removeHandler (connect)', function () {

            beforeEach(function () {

                MqService.addHandler('connect', 'testHandler', function() { return true;});
                MqService.removeHandler('connect', 'testHandler');
            });

            it('Should be able to remove a "connect" type handler', function () {

                expect(MqService.handlers.connect.hasOwnProperty('testHandler')).not.toBe(true);
            });
        });

        describe('addHandler (message)', function () {

            beforeEach(function () {

                MqService.addHandler('message', 'testHandler', function() { return true;});
            });

            it('Should be able to add a "message" type handler', function () {

                expect(MqService.handlers.message.hasOwnProperty('testHandler')).toBe(true);
                expect(typeof(MqService.handlers.message['testHandler'])).toBe('function');
            });
        });

        describe('removeHandler (message)', function () {

            beforeEach(function () {
                MqService.addHandler('message', 'testHandler', function() { return true;});
                MqService.removeHandler('message', 'testHandler');
            });

            it('Should be able to remove a "message" type handler', function () {
                expect(MqService.handlers.message.hasOwnProperty('testHandler')).not.toBe(true);
            });
        });

        describe('addHandler (reconnect)', function () {

            beforeEach(function () {
                MqService.addHandler('reconnect', 'testHandler', function() { return true;});
            });

            it('Should be able to add a "reconnect" type handler', function () {
                expect(MqService.handlers.reconnect.hasOwnProperty('testHandler')).toBe(true);
                expect(typeof(MqService.handlers.reconnect['testHandler'])).toBe('function');
            });
        });

        describe('removeHandler (reconnect)', function () {

            beforeEach(function () {
                MqService.addHandler('reconnect', 'testHandler', function() { return true;});
                MqService.removeHandler('reconnect', 'testHandler');
            })

            it('Should be able to remove a "reconnect" type handler', function () {

                expect(MqService.handlers.reconnect.hasOwnProperty('testHandler')).not.toBe(true);
            });
        });

        describe('addHandler validate params', function () {

            beforeEach(function () {
                spyOn(MqService, 'isValidHandlerType');
                spyOn(MqService, 'isValidHandlerName');
                spyOn(MqService, 'isValidHandlerFunction');
                MqService.addHandler('connect', 'testHandler', function() { return true;});
            });

            it('Should validate all params before adding the handler', function () {
                expect(MqService.isValidHandlerType).toHaveBeenCalled();
                expect(MqService.isValidHandlerName).toHaveBeenCalled();
                expect(MqService.isValidHandlerFunction).toHaveBeenCalled();
            });
        });

        describe('isValidHandlerType', function () {
            it('Should throw an error if specified handler type does not exist', function () {

                expect(function () {
                    MqService.isValidHandlerType('badHandlerType')
                }).toThrow(new Error('Handler type badHandlerType does not exist.  Valid handler types are "connect", "reconnect", and "message".'));
            });
        });

        describe('isValidHandlerName', function () {

            it('Should throw an error if specified handler name is not a string', function () {

                expect(function () {
                    MqService.isValidHandlerName({})
                }).toThrow(new Error('Handler name must be a valid string.'));
            });
        });

        describe('isValidHandlerFunction', function () {

            it('Should throw an error if specified handler function is not a function', function () {
                expect(function () {
                    MqService.isValidHandlerFunction('thisIsNotAFunction')
                }).toThrow(new Error('Handler must be a "function"'));
            });
        });

        describe('$rootScope.$on("mqservice:connected")', function () {

            beforeEach(function () {

                spyOn(MqService, 'fireConnectHandlers');
                $rootScope.$broadcast('mqservice:connected');
            });

            it('Should respond to "mqservice:connected" messages broadcasted from $rootScope', function () {

                expect(MqService.fireConnectHandlers).toHaveBeenCalled();
            });
        });

        describe('$rootScope.$on("mqservice:reconnected")', function () {

            beforeEach(function () {

                spyOn(MqService, 'fireReconnectHandlers');
                $rootScope.$broadcast('mqservice:reconnected');
            });

            it('Should respond to "mqservice:reconnected" messages broadcasted from $rootScope', function () {

                expect(MqService.fireReconnectHandlers).toHaveBeenCalled();
            });
        });

        describe('$rootScope.$on("mqservice:message")', function () {

            beforeEach(function () {

                spyOn(MqService, 'fireMessageHandlers');
                $rootScope.$broadcast('mqservice:message');
            });

            it('Should respond to "mqservice:message" messages broadcasted from $rootScope', function () {

                expect(MqService.fireMessageHandlers).toHaveBeenCalled();
            });

        });

        describe('$rootScope.$on($destroy) listener', function () {

            beforeEach(function () {
                spyOn(MqService, 'onConnect');
                spyOn(MqService, 'onReconnect');
                spyOn(MqService, 'onMessage');
                $rootScope.$broadcast('$destroy');
            });

            it('Should remove $rootScope listeners on destruction', function () {
                expect(MqService.onConnect).toHaveBeenCalled();
                expect(MqService.onReconnect).toHaveBeenCalled();
                expect(MqService.onMessage).toHaveBeenCalled();
            });
        });

        describe('fireConectHandlers', function () {

            beforeEach(function () {
                MqService.addHandler('connect', 'testHandler1', function (){ return true;});
                MqService.addHandler('connect', 'testHandler2', function (){ return true;});
                spyOn(MqService.handlers.connect, 'testHandler1');
                spyOn(MqService.handlers.connect, 'testHandler2');
                MqService.fireConnectHandlers();
            });

            it('Should call each handler once for the connect event', function () {
                expect(MqService.handlers.connect['testHandler1']).toHaveBeenCalledTimes(1);
                expect(MqService.handlers.connect['testHandler2']).toHaveBeenCalledTimes(1);
            });
        });

        describe('fireReconnectHandlers', function () {

            beforeEach(function () {
                MqService.addHandler('reconnect', 'testHandler1', function (){ return true;});
                MqService.addHandler('reconnect', 'testHandler2', function (){ return true;});
                spyOn(MqService.handlers.reconnect, 'testHandler1');
                spyOn(MqService.handlers.reconnect, 'testHandler2');
                MqService.fireReconnectHandlers();
            });

            it('Should call each handler once for the reconnect event', function () {
                expect(MqService.handlers.reconnect['testHandler1']).toHaveBeenCalledTimes(1);
                expect(MqService.handlers.reconnect['testHandler2']).toHaveBeenCalledTimes(1);
            });
        });

        describe('fireMessageHanders', function () {

            beforeEach(function () {
                MqService.addHandler('message', 'testHandler1', function (){ return true;});
                MqService.addHandler('message', 'testHandler2', function (){ return true;});
                spyOn(MqService.handlers.message, 'testHandler1');
                spyOn(MqService.handlers.message, 'testHandler2');
                MqService.fireMessageHandlers();
            });

            it('Should call each handler once for the message event', function () {
                expect(MqService.handlers.message['testHandler1']).toHaveBeenCalledTimes(1);
                expect(MqService.handlers.message['testHandler2']).toHaveBeenCalledTimes(1);
            });
        });

    });

    describe('no connection', function () {

        beforeEach(function () {

            awsMqttMock = {
                init: function () {
                    return 'init';
                },
                publishData: function () {
                    return true;
                },
                hasConnection: function () {
                    return false;
                }
            };

            spyOn(awsMqttMock, 'init');
            spyOn(awsMqttMock, 'publishData');
            spyOn(awsMqttMock, 'hasConnection').and.callThrough();

            module(function ($provide) {
                $provide.value('awsMqttFactory', awsMqttMock);
            });

        });
        beforeEach(inject(function ($injector) {
            MqService = $injector.get('MqService');
        }));
        describe('send', function () {

            it('Should throw an error when send is called without a connection', function () {

                var data = {};
                data['userGuid'] = user.userGuid;
                data['companyGuid'] = user.companyGuid;
                data['conversationGuid'] = conversationGuid;

                expect(function () {
                    MqService.send(data);
                }).toThrow(new Error('No mq connection'));
            })
        });

        describe('subscribe', function () {

            it('should check if it has a connection before calling subscribe', function () {

                var data = {};
                data['userGuid'] = user.userGuid;
                data['companyGuid'] = user.companyGuid;
                data['conversationGuid'] = conversationGuid;

                expect(function () {
                    MqService.subscribe(data);
                }).toThrow(new Error('No mq connection'));
            });
        });

        describe('unsubscribe', function () {

            it('should check if it has a connection before calling subscribe', function () {

                var data = {};
                data['userGuid'] = user.userGuid;
                data['companyGuid'] = user.companyGuid;
                data['conversationGuid'] = conversationGuid;

                expect(function () {
                    MqService.unsubscribe(data);
                }).toThrow(new Error('No mq connection'));
            });
        });
    });
});

