'use strict'

angular.module('MyTime.AwsModule', [])

    .service('awsMqttService', ['$rootScope', function ($rootScope) {

        var self = this;

        self.currentlySubscribedTopic = 'Presence/company/342D1075-57DC-E311-9403-005056875911/user/0A0B6872-5791-135C-8157-AEB12CA40068';
        self.messageHistory = '';
        self.clientId = '';
        self.region = 'us-west-2';
        self.identityPoolId = 'us-west-2:6146c6bb-ccf9-47e5-b553-a7362b52f9c7';
        self.credentials = '';
        self.mqttClient = null;
        self.cognitoIdentity = '';
        self.makeMqttClient = function (accessKeyId, secretKey, sessionToken, expiration) {
            var self = this;

            return AWSIoTData.device({
                //
                // Set the AWS region we will operate in.
                //
                region: self.region,
                //
                // Use the clientId created earlier.
                //
                clientId: self.clientId,
                //
                // Connect via secure WebSocket
                //
                protocol: 'wss',
                //
                // Set the maximum reconnect time to 8 seconds; this is a browser application
                // so we don't want to leave the user waiting too long for reconnection after
                // re-connecting to the network/re-opening their laptop/etc...
                //
                maximumReconnectTimeMs: 8000,
                //
                // Enable console debugging information (optional)
                //
                debug: false,
                //
                // IMPORTANT: the AWS access key ID, secret key, and sesion token must be
                // initialized with empty strings.
                //
                accessKeyId: '',
                secretKey: '',
                sessionToken: ''
            })
        };
        self.makeCredentials = function () {

            var self = this;

            return new AWS.CognitoIdentityCredentials({IdentityPoolId: self.identityPoolId});
        };
        self.setCredentials = function (next) {

            var self = this;

            self.credentials.get(function (err, data) {
                if (!err) {

                    var params = {
                        IdentityId: self.credentials.identityId
                    };
                    self.cognitoIdentity.getCredentialsForIdentity(params, function (err, data) {
                        if (!err) {

                            //
                            // Update our latest AWS credentials; the MQTT client will use these
                            // during its next reconnect attempt.
                            //

                            self.mqttClient.updateWebSocketCredentials(
                                data.Credentials.AccessKeyId,
                                data.Credentials.SecretKey,
                                data.Credentials.SessionToken);

                            next();
                        } else {
                            console.log('error retrieving credentials: ' + err);
                            alert('error retrieving credentials: ' + err);
                        }
                    });
                } else {
                    console.log('error retrieving identity:' + err);
                    alert('error retrieving identity: ' + err);
                }
            });

        };
        self.publishData = function (publishData, publishTopic) {

            publishTopic = publishTopic || self.currentlySubscribedTopic;

            if (!publishTopic) throw 'Must be subscribed to a topic to publish';

            self.mqttClient.publish(publishTopic, publishData);
        };

        self.init = function (topic) {
            var self = this;

            // Set AWS Properties
            AWS.config.region = self.region;

            self.currentlySubscribedTopic = 'Presence/company/342D1075-57DC-E311-9403-005056875911/user/0A0B6872-5791-135C-8157-AEB12CA40068';
            self.messageHistory = '';
            self.clientId = 'mqtt-explorer-' + (Math.floor((Math.random() * 100000) + 1));
            self.credentials = self.makeCredentials();
            self.mqttClient = self.makeMqttClient();
            self.cognitoIdentity = new AWS.CognitoIdentity();
            self.setCredentials(function () {

                self.mqttClient.on('connect', function () {


                    $rootScope.$broadcast('mqservice:connected')
                });

                self.mqttClient.on('message', function (topic, payload) {

                    $rootScope.$broadcast('mqservice:message', payload)
                });
            });

        };
    }])
    .factory('awsMqttFactory', ['$rootScope', function ($rootScope) {

        var mqttClient = null;

        //
        // Remember our current subscription topic here.
        //
        // var currentlySubscribedTopic = 'Presence/company/342D1075-57DC-E311-9403-005056875911/user/0A0B6848-4A16-1473-814A-4B5A8F086CF3';
        var currentlySubscribedTopic = 'Company/342D1075-57DC-E311-9403-005056875911/Conversation/0A0B6848-5918-1A08-8159-1A13CDC003EA';
        // var currentlySubscribedTopic = 'Presence/company/342D1075-57DC-E311-9403-005056875911/user/#';

        //
        // Remember our message history here.
        //
        var messageHistory = '';

        //
        // Create a client id to use when connecting to AWS IoT.
        //
        var clientId = 'mqtt-explorer-' + (Math.floor((Math.random() * 100000) + 1));


        //
        // Initialize our configuration.
        //
        AWS.config.region = 'us-west-2';

        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: 'us-west-2:6146c6bb-ccf9-47e5-b553-a7362b52f9c7'
        });


        var init = function (region, identityPool, endpoint) {

            AWS.config.region = region;

            AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                IdentityPoolId: identityPool
            });

            //
            // Create the AWS IoT device object.  Note that the credentials must be
            // initialized with empty strings; when we successfully authenticate to
            // the Cognito Identity Pool, the credentials will be dynamically updated.
            //
            mqttClient = AWSIoTData.device({
                host: endpoint,
                //
                // Set the AWS region we will operate in.
                //
                region: AWS.config.region,
                //
                // Use the clientId created earlier.
                //
                clientId: clientId,
                //
                // Connect via secure WebSocket
                //
                protocol: 'wss',
                //
                // Set the maximum reconnect time to 8 seconds; this is a browser application
                // so we don't want to leave the user waiting too long for reconnection after
                // re-connecting to the network/re-opening their laptop/etc...
                //
                maximumReconnectTimeMs: 8000,
                //
                // Enable console debugging information (optional)
                //
                debug: false,
                //
                // IMPORTANT: the AWS access key ID, secret key, and sesion token must be
                // initialized with empty strings.
                //
                baseReconnectTimeMs: 1000,
                //
                // IMPORTANT: the AWS access key ID, secret key, and sesion token must be
                // initialized with empty strings.
                //
                accessKeyId: 'a',
                secretKey: 'a',
                sessionToken: ''
            });



            //
            // Attempt to authenticate to the Cognito Identity Pool.  Note that this
            // example only supports use of a pool which allows unauthenticated
            // identities.
            //
            var cognitoIdentity = new AWS.CognitoIdentity();
            AWS.config.credentials.get(function (err, data) {
                if (!err) {

                    var params = {
                        IdentityId: AWS.config.credentials.identityId
                    };
                    cognitoIdentity.getCredentialsForIdentity(params, function (err, data) {
                        if (!err) {

                            //
                            // Update our latest AWS credentials; the MQTT client will use these
                            // during its next reconnect attempt.
                            //
                            mqttClient.updateWebSocketCredentials(
                                data.Credentials.AccessKeyId,
                                data.Credentials.SecretKey,
                                data.Credentials.SessionToken);
                        } else {
                            console.log('error retrieving credentials: ' + err);
                            alert('error retrieving credentials: ' + err);
                        }
                    });
                } else {
                    console.log('error retrieving identity:' + err);
                    alert('error retrieving identity: ' + err);
                }

            });

            mqttClient.on('connect', mqttClientConnectHandler);
            mqttClient.on('reconnect', mqttClientReconnectHandler);
            mqttClient.on('message', mqttClientMessageHandler);
            mqttClient.on('close', mqttClientCloseHandler);

        };


        var mqttClientConnectHandler = function () {

            $rootScope.$emit('mqservice:connected');
        };

        var mqttClientReconnectHandler = function() {
            // console.log('reconnect');
            $rootScope.$emit('mqservice:reconnected');
        };

        var mqttClientMessageHandler = function (topic, payload) {

            // console.log('message: ' + topic + ':' + payload.toString());

            var _payload = {
                topic: topic,
                data: JSON.parse(payload.toString())
            };

            $rootScope.$emit('mqservice:message', _payload);
        };

        var mqttClientCloseHandler = function () {

            $rootScope.$emit('mqservice:closed');
        };

        window.isUndefined = function(value) {
            return typeof value === 'undefined' || typeof value === null;
        };

        var updatePublishData = function(publishData, publishTopic) {

            mqttClient.publish(publishTopic, publishData);
        };

        var hasConnection = function () {

            return mqttClient !== null;
        };

        var subscribe = function (topic) {
            mqttClient.subscribe(topic);
        };

        var unsubscribe = function (topic) {
            mqttClient.unsubscribe(topic);

        };

        var setClientId = function (mqttClientId) {

            clientId = mqttClientId;
        };

        return {
            init: init,
            publishData: updatePublishData,
            hasConnection: hasConnection,
            subscribe: subscribe,
            unsubscribe: unsubscribe,
            setClientId: setClientId
        }

    }]);

