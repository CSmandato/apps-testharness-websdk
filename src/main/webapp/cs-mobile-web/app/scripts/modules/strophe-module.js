'use strict';



angular.module('MyTime.StropheModule', [])
  .factory('csXMPPConnectionFactory', [
    '$rootScope',
    function ($rootScope) {

      return {
        new: function (stropheUrl)
        {

          return new Strophe.Connection(stropheUrl);
        },

        attach: function (strphoeUrl, conversationGuid)
        {

          throw 'csXMPPConnectionFactory: "attach" not implemented.';
        },

        connect: function (connection, login, password)
        {

          connection.connect(login, password, function (status) {

            // What to do on state messages from server
            switch (status) {

              case Strophe.Status.CONNECTING:

                $rootScope.$broadcast('strophe:connecting');
                return true;

              case Strophe.Status.CONNECTED:

                $rootScope.$broadcast('strophe:connected');
                return true;

              case Strophe.Status.DISCONNECTING:

                $rootScope.$broadcast('strophe:disconnecting');
                return true;

              case Strophe.Status.DISCONNECTED:

                $rootScope.$broadcast('strophe:disconnected');
                return true;

              case Strophe.Status.ERROR:

                $rootScope.$broadcast('strophe:error');
                return true;

              case Strophe.Status.CONNFAIL:

                $rootScope.$broadcast('strophe:connfail');
                return true;

              case Strophe.Status.AUTHFAIL:

                $rootScope.$broadcast('strophe:authfail');
                return true;

              case Strophe.Status.ATTACHED:

                $rootScope.$broadcast('strophe:attached');
                return true;

              case Strophe.Status.AUTHENTICATING:

                $rootScope.$broadcast('strophe:authenticating');
                return true;

              default:
                return true;
            }
          });
        },

        disconnect: function(connection)
        {
          if (connection) {
            // connection.options.sync = true; // Switch to using synchronous requests since this is typically called onUnload.
            connection.flush();
            connection.disconnect();
          }
        }
      }

  }])
  .factory('csXMPPStanzaFactory', [
    function() {

      // Adds attributes to a node
      var addNodeAttributes = function (node, attributes) {

        angular.forEach(attributes, function (obj) {

          if (Object.prototype.toString.call(obj) === '[object Object]') {

            var keys = Object.keys(obj);

            angular.forEach(keys, function (key) {

              node.setAttribute(key, obj[key])
            })
          }
        })
      };

      // Builds an XML node
      var buildNode = function (data) {

        var nameObj = MyTimeHelpers.pluck('name', data);
        var valueObj = MyTimeHelpers.pluck('value', data);

        if (nameObj === false) {
          throw 'MissingArgument: buildNode requires a {name: "name"} object.'
        }

        var node = Strophe.xmlElement(nameObj.name);

        if (data.length > 0) {
          addNodeAttributes(node, data);
        }

        if (valueObj) {
          node.appendChild(Strophe.xmlTextNode(valueObj.value))
        }

        return node;
      }

      // Recursively builds stanza
      var buildStanza = function (attrs) {

        var node = false;

        // build a node with current attrs
        node = buildNode(attrs);

        // loop through current attrs looking for more nodes to build
        angular.forEach(attrs, function(value) {

          if ( Object.prototype.toString.call(value) === '[object Array]') {

            angular.forEach(value, function (v) {

              node.appendChild(buildStanza(value))
            })
          }
        });

        return node;
      }


      return {

        // Builds a custom stanza
        build: function (name, attrs)
        {
          attrs.unshift({name: name});
          return buildStanza(attrs);
        },

        // Builds a stanza with <msg> as the root
        msg: function (attrs)
        {
          return this.build('message', attrs)
        },

        // Builds a stanza with <iq> as the root
        iq: function (attrs)
        {
          return this.build('iq', attrs)
        },

        // Builds a stanza with <presence> as the root
        pres: function (attrs)
        {
          return this.build('presence', attrs)
        },

        // Convenience method for building a stanza from the
        // above types
        createStanza: function (type, attrs)
        {

          // Check if we have a function by this name
          if (!this.hasOwnProperty(type)) {
            throw 'IllegalArgument: csXMPPStanzaFactory does not contain ' + type;
          }

          // Check if they want to build a custom stanza
          if (type == 'build') {

            if (!attrs.hasOwnProperty('name')) {
              throw 'MissingArgument: csXMPPStanzaFactory type "build" requires a name';
            }

            var name = attrs.name;
            delete attrs.name;

            return this[type].call(this, name, attrs);
          }

          // create one of the other stanza types

          return this[type].call(this, attrs);

        }
      }
  }])
  .service('csStropheService', [
    'csXMPPStanzaFactory',
    'csXMPPConnectionFactory',
    'SystemConfigService',
    '$rootScope',
      'awsMqttService',
    function(csXMPPStanzaFactory, csXMPPConnectionFactory, SystemConfigService, $rootScope, awsMqttService) {

      this.connection = false;
      this.agentJid = false;
      this.handlerRefs = {};

      this.setConnection = function (connection)
      {
        this.connection = connection
      };

      this.agentTyping = function (message)
      {

        if ($(message).find('composing').length > 0) {
          $rootScope.$broadcast('agent:composing:message');
        }
        else if ($(message).find('paused').length > 0) {
          $rootScope.$broadcast('agent:paused:message');
        }

        return true;
      };

      this.setAgentJid = function (agentJid)
      {
        this.agentJid = agentJid + '@' + SystemConfigService.get('xmppServer');
      };

      this.hasConnection = function ()
      {
        return this.connection && this.connection.hasOwnProperty('connected') && this.connection.connected;
      };

      this.connect = function (login, password)
      {

        var self = this;

        // Create new Strophe connection object
        this.setConnection(csXMPPConnectionFactory.new(SystemConfigService.getSystemConfigProperty('stropheUrl')));

        if (self.connection != false) {

          // Try to connect
          csXMPPConnectionFactory.connect(self.connection, login, password);
        }

      };

      this.disconnect = function ()
      {
        csXMPPConnectionFactory.disconnect(this.connection)
      };

      this.addHandler = function (handlerName, handler, ns, name, type, id, from, options)
      {

        if (!handler || !MyTimeHelpers.isFunction(handler)) {
          throw 'csXMPPConnectionFactory: handler function required.'
        }

        ns = ns || null;
        name = name || null;
        type = type || null;
        id = id || null;
        from = from || null;
        options = options || null;

        this.handlerRefs[handlerName] = this.connection.addHandler(handler, ns, name, type, id, from, options)
      };

      this.removeHandler = function (handlerName)
      {

        this.connection.deleteHandler(this.handlerRefs[handlerName]);
      };

      this.send = function (stanza)
      {
        /*var connection = this.connection;
        if (this.hasConnection()) {
          connection.send(stanza)
        }*/

        // awsMqttService.publishData(stanza);

      };

      this.sendPresence = function (presObj)
      {
        // this.send(csXMPPStanzaFactory.createStanza('pres', presObj))

        this.send(presObj);
      };

      this.sendMessage = function (msgObj)
      {
        this.send(csXMPPStanzaFactory.createStanza('msg', msgObj))
      };

      this.sendIQ = function (iqObj)
      {
        this.send(csXMPPStanzaFactory.createStanza('iq', iqObj))
      };

      this.sendCustom =function (customObj)
      {
        this.send(csXMPPStanzaFactory.createStanza('build', customObj))
        return this;
      };

      this.sendAvailable = function (user, conversationGuid)
      {
        /*var attrs = [
          [
            {name: 'show'},
            {value: 'chat'}
          ],
          [
            {name: 'status'},
            {value: angular.toJson({
              companyGuid: user.companyGuid,
              entityGuid: conversationGuid,
              entityType: 'conversation',
              status: [
                {"name": "appstate", "value": "foreground"}
              ]
            })
            }
          ]
        ];*/

        var attrs = {
          userGuid : user.userGuid,
          resource : "chat",
          presenceState : "available",
          show : "chat",
          "companyGuid" : user.companyGuid,
          "conversationGuid" : conversationGuid,
      }

        this.sendPresence(attrs);
        return this;
      };

      this.sendOpenConversation = function (user, conversationGuid)
      {
        var attrs = [
            [
              {name: 'show'},
              {value: 'chat'}
            ],
            [
              {name: 'status'},
              {value: angular.toJson({
                  companyGuid: user.companyGuid,
                  entityGuid: conversationGuid,
                  entityType: 'conversation',
                  status: [
                    {"name": "screen", "value": "self service"},
                    {"name": "appstate", "value": "foreground"}
                  ]
                })
              }
            ]
          ];
        this.sendPresence(attrs);
        return this;
      };

      this.sendRequestAgent = function (user, conversationGuid)
      {

        var attrs = [
          [
            {name: 'show'},
            {value: 'away'}
          ],
          [
            {name: 'status'},
            {value: angular.toJson({
              companyGuid: user.companyGuid,
              entityGuid: conversationGuid,
              entityType: 'conversation',
              status: [
                {"name":"screen", "value": "live chat"}
              ]
            })
            }
          ]
        ];
        this.sendPresence(attrs);
        return this;
      };

      this.sendIdle = function (user, conversationGuid)
      {

        var attrs = [
          [
            {name: 'show'},
            {value: 'away'}
          ],
          [
            {name: 'status'},
            {value: angular.toJson({
              companyGuid: user.companyGuid,
              entityGuid: conversationGuid,
              entityType: 'conversation',
              status: []
            })}
          ]
        ];
        this.sendPresence(attrs);
        return this;
      };

      this.sendInactive = function (user, conversationGuid)
      {

        var attrs = [
          [
            {name: 'show'},
            {value: 'xa'}
          ],
          [
            {name: 'status'},
            {value: angular.toJson({
              companyGuid: user.companyGuid,
              entityGuid: conversationGuid,
              entityType: 'conversation',
              status: []
            })}
          ]
        ];
        this.sendPresence(attrs);
        return this;
      };

      this.sendLeaveScreen = function (user, conversationGuid)
      {
        var attrs = [
          {type: "unavailable"},
          [
            {name: 'show'},
            {value: 'away'}
          ],
          [
            {name: 'status'},
            {value: angular.toJson({
              companyGuid: user.companyGuid,
              entityGuid: conversationGuid,
              entityType: 'conversation',
              status: [
                {"name":"action", "value": "back"}
              ]
            })}
          ]
        ];

        this.sendPresence(attrs);
        return this;
      };

      this.sendAppInBackground = function (user, conversationGuid)
      {

        var attrs = [
          {type: "unavailable"},
          [
            {name: 'status'},
            {value: angular.toJson({
              companyGuid: user.companyGuid,
              entityGuid: conversationGuid,
              entityType: 'conversation',
              status: [
                {"name":"action", "value": "back"}
              ]
            })}
          ]
        ];
        this.sendPresence(attrs);
        return this;
      };

      this.sendEndChat = function (user, conversationGuid)
      {
        var attrs = [
          {type: "unavailable"},
          [
            {name: 'status'},
            {value: angular.toJson({
              companyGuid: user.companyGuid,
              entityGuid: conversationGuid,
              entityType: 'conversation',
              status: [
                {"name":"action", "value": "end chat"}
              ]
            })}
          ]
        ];
        this.sendPresence(attrs);
        return this;
      };

      this.sendTyping = function (user, conversationGuid)
      {

        var agentJid = this.agentJid;
        var attrs = [
          {to: agentJid},
          {type: "chat"},
          [
            {name: "composing"},
            {xmlns: "http://jabber.org/protocol/chatstates"}
          ],
          [
            {name: 'body'},
            {value: angular.toJson(
              {
                conversationGuid: conversationGuid
              }
            )}
          ]
        ];

        /*<message type="chat" from="0A0B6848-4D83-1A0F-814D-8D1421BC003C@csdevmytweb201" to="0A0B6848-4B99-19DC-814B-99895BCE031F@csdevmytweb201">
            <composing xmlns="http://jabber.org/protocol/chatstates"></composing>
            <body>{"conversationGuid" : "0A0B6848-4F58-13AA-814F-8A948E2F27A2"}</body>
        </message>*/

        this.sendMessage(attrs);
        return this;
      };

      this.sendPauseTyping = function (user, conversationGuid)
      {
        var agentJid = this.agentJid;
        var attrs = [
          {to: agentJid},
          {type: "chat"},
          [
            {name: "paused"},
            {xmlns: "http://jabber.org/protocol/chatstates"}
          ],
          [
            {name: 'body'},
            {value: angular.toJson(
              {
                conversationGuid: conversationGuid
              }
            )}
          ]
        ];

        this.sendMessage(attrs);
        return this;
      }

  }]);