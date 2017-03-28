angular.module('csWebApp', ['ui.bootstrap', 'ngRoute', 'ngTouch', 'ngScrollGlue', 'ng.deviceDetector', 'ngStorage'])
    .constant('appConfig', '')
    .filter('readMessages', function() {
        return function(items) {
            return items.filter(function(item) {
                return item.notificationState === "Read";
            });

        };
    })
    .filter('unreadMessages', function() {
        return function(items) {
            return items.filter(function(item) {
                return item.notificationState === "Unread";
            });
        };
    })
    .controller('msgController', ['$scope', '$rootScope', '$http', '$interval', 'Strophe', 'deviceDetector', '$sessionStorage',  function ($scope, $rootScope, $http, $interval, Strophe, deviceDetector, $sessionStorage) {
        var pollForMessages;
        Scope = $scope;
        $scope.stateHistory = [];
        $scope.state = "login";
        $scope.topic = "";
        $scope.phone = "";
        $scope.topic2 = "";
        $scope.messages = [];
        $scope.badge = "";
        $scope.user = {};
        $scope.faqLabels = [];
        $scope.faqArticles = [];
        $scope.faqText = "";
        $scope.notifications = [];
        $scope.unreadMessages = [];
        $scope.iconState = "down";
        $scope.csUser = {firstName: "", addrEmail: ""};
        $scope.sessionStorage = $sessionStorage;
        if($scope.sessionStorage.currentUser){
            $scope.user.addrEmail = $scope.sessionStorage.currentUser.userAttrs[0].value;
            $scope.user.firstName = $scope.sessionStorage.currentUser.userAttrs[1].value;
        }

        $scope.login = function () {

            $scope.loginObj = {

//                "companyGuid": "23BFDAA6-4CE5-4A98-93F0-2B4AC0174350",
//                "csApiKey": "C53A6A7B-FBB9-436E-BFB7-EF862FA24791",
                "companyGuid": "342D1075-57DC-E311-9403-005056875911",
                "csApiKey": "CA971207-15B8-4BEA-AA20-068878C38F33",
                "deviceId": "web",
                "deviceMake": deviceDetector.browser,
                "deviceModel": deviceDetector.device,
                "deviceOS": deviceDetector.os,
                "deviceVersion": "",
                "appVersion": "1.0",
                "sdkVersion": "2.3",
                "channel": "web",
                "userAttrs": [
                    {"type": "id", "name": "addrEmail", "value": $scope.user.addrEmail},
                    {"type": "info", "name": "firstName", "value": $scope.user.firstName}
                ]

            }
            $http.post("https://mytimetest.contactsolutions.com/sdkMobileV2/login.json", JSON.stringify($scope.loginObj)).then(function (response) {
                //console.log(response);
                $scope.sessionStorage.currentUser = $scope.loginObj;
                $scope.sessionGuid = response.data.sessionGuid;
                $scope.jid = response.data.userGuid + "@csdevmytweb201";
                $scope.connect = Strophe.auth($scope.jid.toLowerCase(), "mytime", $scope.on_xmpp_message);
                if($scope.loginDestination){
                    var loc = $scope.loginDestination;
                    if(loc === "resume-chat"){

                        $scope.resumeConversation($scope.resumeConversationID);

                    }else if(loc === "history"){
                        $scope.getConversationHistory();
                    }else if(loc === "notification"){
                        $scope.getNotifications();
                    }else if(loc === "welcome"){
                        $scope.changeState("welcome");
                    }
                }else{
                    $scope.changeState("welcome");
                }
                $scope.loginDestination = null;

            });

        };
        $scope.endConversation = function () {
          // $interval.cancel(pollForMessages);

            //send the End Chat message and logout of mytime so we kill the active session
            $scope.sendMessage("End Chat");
            var requestObj = {
                "sessionGuid": $scope.sessionGuid
            }
            $http.post("https://mytimetest.contactsolutions.com/sdkMobileV2/logout.json", JSON.stringify(requestObj))
                .then(function (response) {
                    $scope.conversationGuid = null;
                    $scope.sessionGuid = null;
                });
            $scope.connect.send($pres({type:'unavailable'}).t("unavailable"));
            $scope.topic = "";
            $scope.changeState("welcome");
        }
        $scope.goBack = function () {
            var previousState = $scope.stateHistory[$scope.stateHistory.length - 1];
            $scope.stateHistory.splice(-1, 1);
            $scope.state = previousState;
            $scope.$broadcast("state:" + previousState);

        }
        $scope.changeState = function (state) {
            $scope.$broadcast("state:" + state);
            var previousState = $scope.state;

            $scope.stateHistory.push(previousState);


            $scope.state = state;
            if (state === "login" && $scope.sessionGuid && $scope.conversationGuid) {
                $scope.changeState('chat');
            }
            if (state === "login" && $scope.sessionGuid && !$scope.conversationGuid) {
                $scope.changeState('chat');
                $scope.createConversation();
            }

        }
        //State Listeners
        $scope.$on("state:welcome", function () {
            $scope.getBadge();
        });
        $scope.$on("state:notification", function () {
           $scope.getNotifications();
        });
        $scope.$on("state:login", function () {
            if ($scope.sessionGuid) {
                $scope.changeState("welcome");
            }
        });

        $scope.$on("action:resume", function (event, data) {
            $scope.resumeConversationID = data.data.cid;
            $scope.resumeConversation(data.data.cid);

        });
        $scope.createConversation = function () {

            if ($scope.conversationGuid) {
                $scope.changeState('chat');
                return;
            }
            if (!$scope.sessionGuid) {
                $http.post("https://mytimetest.contactsolutions.com/sdkMobileV2/login.json", JSON.stringify($scope.loginObj)).then(function (response) {
                    //console.log(response);
                    $scope.sessionGuid = response.data.sessionGuid;
                    $scope.createConversation();
                    return;
                });
            }
            
            connect.send($pres().tree());
            
            $scope.messages = [];
            var tStamp = new Date();
            var requestObj = {
                "conversationGuid": null,
                "subject": $scope.topic,
                "userState": null,
                "stateData": null,
                "acr": null,
                "messages": [
                    {
                        "messageType": "Mobile",
                        "mimeType": "text/plain",
                        "locale": "en-US",
                        "messageText": $scope.topic,
                        "messageData": $scope.topic2,
                        "geoLocation": "+38.958287,-77.359462",
                        "encrypted": "0",
                        "createTstamp": tStamp
                    }
                ]
            }


            $http.post("https://mytimetest.contactsolutions.com/sdkMobileV2/session/" + $scope.sessionGuid + "/conversation.json", JSON.stringify(requestObj))
                .then(function (response) {
                    $scope.state = "chat";
                    $scope.conversationGuid = response.data.conversationGuid;
                    response.data.messages.forEach(function (message) {
                        if ($scope.topic !== "") {
                            $scope.messages.push(requestObj.messages[0]);
                        }
                        $scope.messages.push(message);
                    });

                    $("#chat-message").focus();
                    //pollForMessages  = $interval(function () {
                    //    $scope.getNewMessages();
                    //}, 4000);
                    $scope.getNewMessages();
                });

        };
        $scope.sendMessage = function (text) {
            var tStamp = new Date();
            if (!text) {
                text = $scope.message;
            }
            var requestObj = {
                "conversationData": {
                    "subject": "Main Menu",
                    "userState": "auto",
                    "stateData": null
                },
                "messagesFromUser": [
                    {
                        "messageType": "Mobile",
                        "mimeType": "text/plain",
                        "locale": "en-US",
                        "messageText": text,
                        "messageData": null,
                        "geoLocation": "+38.958287,-77.359462",
                        "encrypted": "0",
                        "createTstamp": tStamp
                    }
                ],
                "messagesToUser": null
            }
            $http.post("https://mytimetest.contactsolutions.com/sdkMobileV2/session/" + $scope.sessionGuid + "/conversation/" + $scope.conversationGuid + "/messaging.json", JSON.stringify(requestObj))
                .then(function (response) {
                    response.data.messagesFromUser.forEach(function (message) {
                        $scope.messages.push(message);
                    });
                    $scope.message = "";

                });
        }
        $scope.getNewMessages = function () {

            $http.get("https://mytimetest.contactsolutions.com/sdkMobileV2/session/" + $scope.sessionGuid + "/conversation/" + $scope.conversationGuid + ".json?userVisible=1&userViewed=0&viewer=user")
                .then(function (response) {
                    response.data.messages.forEach(function (message) {
                        $scope.messages.push(message);
                    });
                });

        };

        $scope.toggleIframe = function () {

            var container = $(".container.main");
            if (container.attr("style") === "height:40px;position:fixed;bottom:0;") {
                container.attr("style", "margin:0;height:400px;overflow:hidden;");
                $scope.iconState = "down";
            } else {

                container.attr("style", "height:40px;position:fixed;bottom:0;");
                $scope.iconState = "up";
            }


        };
        $scope.on_xmpp_message = function (message) {
            //console.log(message);
            $scope.getNewMessages();
            return true;
        };
        $scope.getConversationHistory = function () {

            $scope.conversations = [];
            if (!$scope.sessionGuid) {
                $http.post("https://mytimetest.contactsolutions.com/sdkMobileV2/login.json", JSON.stringify($scope.loginObj)).then(function (response) {
                    //console.log(response);
                    $scope.sessionGuid = response.data.sessionGuid;
                    $scope.getConversationHistory();
                    return;
                });
            }
            $http.get("https://mytimetest.contactsolutions.com/sdkMobileV2/session/" + $scope.sessionGuid + "/firstRecord/0/maxReturn/200/conversations.json")
                .then(function (response) {
                    response.data.forEach(function (conversation) {
                        $scope.conversations.push(conversation);
                    });
                    $scope.changeState("history");
                });

        };
        $scope.getNotifications = function (resume) {
            $scope.notifications = [];
            if (!$scope.sessionGuid) {
                $http.post("https://mytimetest.contactsolutions.com/sdkMobileV2/login.json", JSON.stringify($scope.loginObj)).then(function (response) {
                    //console.log(response);
                    $scope.sessionGuid = response.data.sessionGuid;
                    $scope.getNotifications();
                    return;
                });
            }

                    $http.get("https://mytimetest.contactsolutions.com/sdkMobileV2/session/" + $scope.sessionGuid + "/notification.json").then(function(response){
                        response.data.forEach(function (notification) {

                                $scope.notifications.push(notification);


                        });
                    });







                    //console.log("about to switch to notification state");

                    //console.log("after switch to notification state");
              //  });
        };

        $scope.getBadge = function () {
            $scope.badge = 0;
            if (!$scope.sessionGuid) {
                $http.post("https://mytimetest.contactsolutions.com/sdkMobileV2/login.json", JSON.stringify($scope.loginObj)).then(function (response) {
                    $scope.sessionGuid = response.data.sessionGuid;
                    $scope.getBadge();
                    return;
                });
            }
            $http.get("https://mytimetest.contactsolutions.com/sdkMobileV2/session/" + $scope.sessionGuid + "/badge.json?unread=1")
                .then(function (response) {
                    $scope.badge = response.data.message + response.data.alert;
                });
        };
        $scope.markAsRead = function(){
            this.notification.notificationState = "Read";


        };
        $scope.resumeConversation = function (convoGuid) {
            // check for session


            if(!$scope.sessionGuid){
                $scope.loginDestination = "resume-chat";
                $scope.changeState("login");
                return;
            }
            // if active conversation is selected from history
            if ($scope.conversationGuid == convoGuid ) {

                $scope.changeState("chat");
                $("#chat-message").focus();
                return;
            }            
            
            connect.send($pres().tree());
            $scope.conversationGuid = convoGuid;
            $scope.changeState("chat");
            $scope.messages = [];
            $http.get("https://mytimetest.contactsolutions.com/sdkMobileV2/session/" + $scope.sessionGuid + "/conversation/" + $scope.conversationGuid + ".json?userVisible=1&viewer=user")
                .then(function (response) {
                    //$scope.messages.push = "";
                    response.data.messages.forEach(function (message) {
                        $scope.messages.push(message);
                    });
                });
            $("#chat-message").focus();

        };
        
        $scope.archiveChat = function() {
            var conversationGuid = this.conversation.conversationGuid;
            this.conversation.archived = "1";
            if (!$scope.sessionGuid) {
                $http.post("https://mytimetest.contactsolutions.com/sdkMobileV2/login.json", JSON.stringify($scope.loginObj)).then(function (response) {
                    $scope.sessionGuid = response.data.sessionGuid;
                    $scope.archiveChat(conversationGuid);
                    return;
                });
            }
            $http.post("https://mytimetest.contactsolutions.com/sdkMobileV2/session/" + $scope.sessionGuid + "/conversation/"+conversationGuid+"/archive.json").then(function (response) {
            		$scope.conversations.splice()
                });
        };
        
        $scope.getFaqLabels = function() {
            $scope.faqLabels = [];
            if(!$scope.sessionGuid){
                $scope.loginDestination = "faqLabel";
                $scope.changeState("login");
                return;
            }
            $http.get("https://mytimetest.contactsolutions.com/sdkMobileV2/session/" + $scope.sessionGuid + "/kb/label.json")
                .then(function (response) {
                    response.data.forEach(function (faqLabel) {
                        $scope.faqLabels.push(faqLabel);
                    });
                    $scope.changeState("faqLabel");
                });
        };

        $scope.getFaqArticles = function() {
            $scope.faqArticles = [];
            $scope.labelText = this.faqLabel.labelText;
            var labelGuid = this.faqLabel.labelGuid;
            //console.log(this);
            if(!$scope.sessionGuid){
                $scope.loginDestination = "faqArticle";
                $scope.changeState("login");
                return;
            }
            $http.get("https://mytimetest.contactsolutions.com/sdkMobileV2/session/" + $scope.sessionGuid + "/kb/label/"+labelGuid+"/article.json")
                .then(function (response) {
                    response.data.forEach(function (faqArticle) {
                        $scope.faqArticles.push(faqArticle);
                    });
                    $scope.changeState("faqArticle");
                });
        };
        
        $scope.getFaqText = function() {
            $scope.title = this.faqArticle.title;
            $scope.details = this.faqArticle.details;
        	$scope.changeState("faqText");
        };
    }])
    .run(function ($rootScope, $timeout, $location) {
        $rootScope.handleAction = function () {

            var action = $rootScope.action;
            var payload = {};

            if (action === "resume") {
                payload.cid = $rootScope.getParameterByName('cid');
            }

            $timeout(function(){
                $rootScope.$broadcast("action:" + action, { data: payload });
            },2000);




        }
        $rootScope.getParameterByName = function (name) {
            name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
            var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                results = regex.exec(location.search);
            return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        };
        //$rootScope.$on('$locationChangeSuccess', function(event){
        //    var state = $rootScope.getParameterByName("mtstate");
        //    console.log(state);
        //    if(state.length > 0){
        //        if($rootScope.sessionGuid){
        //            if(state === "welcome"){
        //
        //                $rootScope.changeState("welcome");
        //
        //            }else if(state === "history"){
        //                $rootScope.getConversationHistory();
        //            }else if(state === "notification"){
        //                $rootScope.getNotifications();
        //
        //            }
        //        }
        //    }
        //})
        var mtaction = $rootScope.getParameterByName('mtaction');
        if (mtaction.length > 0) {

            $rootScope.action = mtaction;
            $rootScope.handleAction();
        }
        var mtstate = $rootScope.getParameterByName('mtstate');
        if(mtstate.length > 0){
            $rootScope.loginDestination = mtstate;
        }

    })
    .service('Strophe', function () {
        return {

            auth: function (login, password, callback) {

                connect = new Strophe.Connection('https://mytimetestxmpp.contactsolutions.com:443/http-bind/');

                connect.connect(login, password, function (status) {
                    if (status === Strophe.Status.CONNECTED) {
                        // we are in, addHandlers and stuff
                        connect.addHandler(callback, null, "message", "chat");
                        connect.send($pres().tree());
                    }
                });

                return connect;
            }
        };

    });
