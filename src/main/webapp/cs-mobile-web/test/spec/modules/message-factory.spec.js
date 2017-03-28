describe('MyTime.MqModule.MessageFactory', function() {

    var MessageFactory, user, conversationGuid;

    beforeEach(module('MyTime.MqModule'));
    beforeEach(inject(function($injector) {
        MessageFactory = $injector.get('MessageFactory');
    }));
    beforeEach(function () {
        user = {
            userGuid: 'testUserGuid',
            companyGuid: 'testCompanyGuid'
        }
    });
    beforeEach(function() {
        conversationGuid = 'testConversationGuid'
    });

    it('Should contain only certain functions for creating Messages', function () {

        expect(typeof(MessageFactory)).toBe('object');
        expect(JSON.stringify(MessageFactory)).toEqual(JSON.stringify({
            makeAvailable: Function,
            makeUnavailable: Function,
            makeIdle: Function,
            makeExtendedAway: Function,
            makeLeaveScreen: Function,
            makeOpenConversation: Function,
            makeTypingActive: Function,
            makeTypingPaused: Function,
            makeMessage: Function
        }));
    });

    it('Should create payload for "Presence:Available"', function() {

        var message = MessageFactory.makeAvailable(user, conversationGuid);
        expect(typeof(message)).toEqual('object');
        expect(message.userGuid).toBe('testUserGuid');
        expect(message.type).toBe('presence');
        expect(message.actor).toBe('user');
        expect(message.resource).toBe('web');
        expect(message.presenceState).toBe('available');
        expect(message.show).toBe('chat');
        expect(message.conversationGuid).toBe('testConversationGuid');
        expect(message.companyGuid).toBe('testCompanyGuid');
    });

    it('Should create payload for "Presence:Unavailable"', function() {

        var message = MessageFactory.makeUnavailable(user, conversationGuid);
        expect(typeof(message)).toEqual('object');
        expect(message.userGuid).toBe('testUserGuid');
        expect(message.type).toBe('presence');
        expect(message.actor).toBe('user');
        expect(message.resource).toBe('web');
        expect(message.presenceState).toBe('unavailable');
        expect(message.show).toBe('nil');
        expect(message.conversationGuid).toBe('testConversationGuid');
        expect(message.companyGuid).toBe('testCompanyGuid');
    });

    it('Should create payload for "Presence:Idle"', function() {

        var message = MessageFactory.makeIdle(user, conversationGuid);
        expect(typeof(message)).toEqual('object');
        expect(message.userGuid).toBe('testUserGuid');
        expect(message.type).toBe('presence');
        expect(message.actor).toBe('user');
        expect(message.resource).toBe('web');
        expect(message.presenceState).toBe('available');
        expect(message.show).toBe('away');
        expect(message.conversationGuid).toBe('testConversationGuid');
        expect(message.companyGuid).toBe('testCompanyGuid');
    });

    it('Should create payload for "Presence:ExtendedAway"', function() {

        var message = MessageFactory.makeExtendedAway(user, conversationGuid);
        expect(typeof(message)).toEqual('object');
        expect(message.userGuid).toBe('testUserGuid');
        expect(message.type).toBe('presence');
        expect(message.actor).toBe('user');
        expect(message.resource).toBe('web');
        expect(message.presenceState).toBe('available');
        expect(message.show).toBe('xa');
        expect(message.conversationGuid).toBe('testConversationGuid');
        expect(message.companyGuid).toBe('testCompanyGuid');
    });

    it('Should create payload for "Presence:LeaveScreen"', function() {

        var message = MessageFactory.makeLeaveScreen(user, conversationGuid);
        expect(typeof(message)).toEqual('object');
        expect(message.userGuid).toBe('testUserGuid');
        expect(message.type).toBe('presence');
        expect(message.actor).toBe('user');
        expect(message.resource).toBe('web');
        expect(message.presenceState).toBe('unavailable');
        expect(message.show).toBe('dead');
        expect(message.conversationGuid).toBe('testConversationGuid');
        expect(message.companyGuid).toBe('testCompanyGuid');
    });

    it('Should create payload for "User Composing Message', function() {

        var message = MessageFactory.makeTypingActive(user, conversationGuid);
        expect(typeof(message)).toEqual('object');
        expect(message.type).toBe('indicator');
        expect(message.actor).toBe('user');
        expect(message.show).toBe('composing');
    });

    it('Should create payload for "User Paused Typing Message', function() {

        var message = MessageFactory.makeTypingPaused(user, conversationGuid);
        expect(typeof(message)).toEqual('object');
        expect(message.type).toBe('indicator');
        expect(message.actor).toBe('user');
        expect(message.show).toBe('paused');
    });

    it('Should create payload for "User Send Message"', function() {

        var message = MessageFactory.makeMessage(user, conversationGuid, 'messageText');
        expect(typeof(message)).toEqual('object');
        expect(message.userGuid).toBe('testUserGuid');
        expect(message.type).toBe('message');
        expect(message.actor).toBe('user');
        expect(message.resource).toBe('web');
        expect(message.show).toBe('messageText');
        expect(message.conversationGuid).toBe('testConversationGuid');
        expect(message.companyGuid).toBe('testCompanyGuid');
        expect(message.mimetype).toBe("text/plain")
    });

});