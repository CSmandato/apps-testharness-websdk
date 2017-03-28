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

var PostMessageService = function () {

  return {

    parent: function () {

      return window.opener != null ? window.opener : window.parent;
    },

    receive: function (message, targetOrigin, fn, args, useData) {

      // Copy the default args
      var holder = (function(args) { return args;})(args);

      // check which method we need to use for adding event listeners (Everybody else : IE)
      var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";

      // assign that method to a var so we can use it over and over if we want
      var eventer = window[eventMethod];

      // The message event name we have to listen for...once again (Everybody else : IE)
      var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";

      eventer(messageEvent, function (e) {

        var event = e || window.event;

        // If the event didn't originate from this origin (ignore query string)
        if (event.origin !== targetOrigin) {
          // ignore it
          return;
        }

        // if the message matches the one we passed in
        if (event.data) {

          // If we passed an object and that object has a property 'eventName'
          if (event.data.hasOwnProperty('message') && event.data.message === message) {

            // If the message contains data and we want to use
            // that data in our passed in function
            if (event.data.hasOwnProperty('data') && event.data.data !== null && event.data.data !== undefined && useData) {

              // Set args to data
              args = event.data.data;

              // Store the post message data for later processing
              // PostMessageData.setPostMessageData(event.data.message, args);
            }

            // If the args are an array
            if (Object.prototype.toString.call(args) === '[object Array]') {

              // execute the passed in function with the passed in array of args
              fn.apply(this, args);
            }
            else {

              // execute the passing function with the passed in argument or no argument;
              fn.call(this, args);
            }
          }

          // reassign the default args
          args = holder;
          return;
        }


        // if the message is a string and it matches the one we passed in
        if (Object.prototype.toString.call(e.message) === '[object String]') {

          // execute the passed in function with the passed in string
          fn.call(args);
        }
        else {

          // execute the passing function with the passed in argument;
          fn.call(args)
        }

        // reassign the default args
        args = holder;
      });
    },

    send: function (message, data, ref, origin) {

      var postMessage = {
        message: message,
        data: data
      };

      ref.postMessage(postMessage, origin);
    },

    removeEvent: function (eventName) {

      // check which method we need to use for adding event listeners (Everybody else : IE)
      var eventMethod = window.removeEventListener ? "removeEventListener" : "detachEvent";

      var messageEvent = eventMethod == "detachEvent" ? "onmessage" : "message";

      var eventer = window[eventMethod];

      eventer(messageEvent, eventName);
    }
  }
};

// Create a module object attached to the window
// to facilitate communication with our iFrame
var MyTimeSupportModule = function () {

  var devices = {
    IPAD: 1,
    IPHONE: 2,
    ANDROID: 4,
    DESKTOP: 8,
    WINDOWS_MOBILE: 16,
    BLACKBERRY: 32
  };

  var config = {
    mytimeDomain: '',
    mytimePath: '/cs-mobile-web/app/index.html',
    mytimeWindowName: 'MyTime Chat',
    ready: false,
    mobile: true,
    device: null,
    browser: null,
    windowName: null
  };

  var readyQueue = [];

  var appContainer, appFrame, appFrameBody;

  var deviceHeight = null,
    deviceWidth = null;

  var deviceType = null;
  var postMessageWindow = null;
  var previousConvo;
  var autoLoginUser = null;

  var pms = new PostMessageService();

  var isMobile = {
    Android: function() {

      var device = navigator.userAgent.match(/Android/i);

      if (device) {
        deviceType = devices.ANDROID;
        config.device = 'Android';
      }

      return device;
    },
    BlackBerry: function() {

      var device = navigator.userAgent.match(/BlackBerry/i);

      if (device) {
        deviceType = devices.BLACKBERRY;
        config.device = 'BlackBerry';
      }

      return device;
    },
    iOS: function() {
      var device = navigator.userAgent.match(/iPhone|iPad|iPod/i);

      if (device) {
        deviceType = navigator.userAgent.match(/iPad/i) ? devices.IPAD : devices.IPHONE;
        config.device = 'iOS';
      }

      return device;
    },
    Opera: function() {
      var device =navigator.userAgent.match(/Opera Mini/i);

      if (device) {
        deviceType = devices.ANDROID;
        config.device = 'Opera Mini';
      }

      return device;
    },
    Windows: function() {
      var device =navigator.userAgent.match(/IEMobile/i);

      if (device) {
        deviceType = devices.WINDOWS_MOBILE;
        config.device = 'IEMobile';
      }

      return device;
    },
    any: function() {
      return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
  };

  // Test user agent string
  function _testUserAgent() {

    if (isMobile.any()) {

      config.mobile = true;
    } else {
      deviceType = devices.DESKTOP;
      config.device = 'browser';
      config.mobile = false;
    }

  }

  // Reset the module to it's initialized state
  function _resetSupportModule() {

    if (!config.mobile) {
      $('#cs-iframe-container').remove();
    }
    else {
      postMessageWindow.close();
    }

    config.ready = false;
    postMessageWindow = null;
    _clearQueue();
  }

  // Create our iframe and container
  function _createSupportModuleDOMBinding() {

    var container = document.createElement('div'),
      iframe = document.createElement('iframe');

    container.setAttribute('id', "cs-iframe-container");
    iframe.setAttribute('id', 'mt-frame');
    iframe.setAttribute('src', config.mytimeDomain.concat(config.mytimePath));
    iframe.setAttribute('frameborder', '0');

    container.appendChild(iframe);
    $('body').append(container);

    appContainer = $('#cs-iframe-container'),
      appFrame = document.getElementById('mt-frame').contentWindow,
      appFrameBody = $('#mt-frame').contents().find('body');
  }

  // Get Parameter from url
  function _getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  }

  // Open the chat window interface
  function _openChatWindow() {

    var appleDeviceMask = devices.IPAD || devices.IPHONE,
      androidDeviceMask = devices.ANDROID,
      desktopMask = devices.DESKTOP;

    if (appleDeviceMask & deviceType === 1 || appleDeviceMask & deviceType === 2) {

      postMessageWindow = window.open('', config.mytimeWindowName);

      if (postMessageWindow.location == "about:blank") {
        postMessageWindow.location = config.mytimeDomain.concat(config.mytimePath);
      }

    } else if (androidDeviceMask & deviceType) {

      postMessageWindow = window.open('', config.mytimeWindowName);

      if (postMessageWindow.location == "about:blank") {
        postMessageWindow.location = config.mytimeDomain.concat(config.mytimePath);
      }
    }
    else if (desktopMask & deviceType) {
      _createSupportModuleDOMBinding();
      appContainer.show('open');
      $('#mt-frame').addClass('open');
      postMessageWindow = appFrame;
    }

    postMessageWindow.focus();
  }

  // Send request for previous conversation
  function _resumePreviousConversation(previousConvo) {

    // Set state
    previousConvo['state'] = 'ASV_CONVERSATION';

    // Send message
    pms.send(
      'MyTimeResumeConversation',
      previousConvo,
      postMessageWindow,
      config.mytimeDomain
    );
  }

  // Send state to the app window
  function _sendStateMessage(state) {
    pms.send(
      'MyTimeState',
      {state: state},
      postMessageWindow,
      config.mytimeDomain
    );

  }

  // Helper for responsive
  function _addPaddingToApp() {
    if ($(window).width() <= 768) {
      appFrameBody.css({
        paddingBottom: 60 + 'px'
      })

      return;
    };

    if ($(window).width() > 768) {
      appFrameBody.css({
        paddingBottom: 0 + 'px'
      })

      return;
    };
  }

  // check for previous conversation from email link
  function _hasPreviousConversation() {

    var _mtaction = _getParameterByName('mtaction');
    var _cid = _getParameterByName('cid');

    if (_mtaction.length > 0 && _cid.length > 0) {

      return {
        mtaction: _mtaction,
        cid: _cid
      }
    }

    return false;
  }

  // Send the device config we aggregate from our testUserAgent call
  function _sendDeviceConfig() {

    // Send device config to chat window
    pms.send(
      'MyTimeDeviceConfig',
      {
        mobile: config.mobile,
        device: config.device,
        browser: config.browser
      },
      postMessageWindow,
      config.mytimeDomain
    );
  }

  // Send config to the app window
  function _sendAutoLoginMessage(user) {

    // Send device config to chat window
    pms.send(
      'MyTimeAutoLogin',
      user,
      postMessageWindow,
      config.mytimeDomain
    );
  }

  // Sets the ready property in the config
  function _setMyTimeReady() {

    config.ready = true;
  }

  // Executes a queued function
  function _execQueueFn(obj) {

    if (Object.prototype.toString(obj.args) === '[object Array]') {

      obj.fn.apply(this, obj.args);
      return;
    }

    obj.fn.call(this, obj.args);
  }

  // Exectues all functions in queue
  function _execQueue() {

    if (readyQueue.length === 0) return false;

    readyQueue.forEach(function (qFn) {

      _execQueueFn(qFn);
    });

    _clearQueue();
  }

  // Clears the queued functions
  function _clearQueue() {

    readyQueue = [];
  }

  // checks config for ready property.  IF window is not ready
  // it will queue functions to be called when the chat window is ready.
  // if the chat window is ready it will execute the function passed to it.
  function _isReady(fn, args) {

    if (!config.ready) {

      readyQueue.push({fn: fn, args: args});
      return;
    }

    _execQueueFn({fn: fn, args: args});
  }

  function _logEvent(e) {
    console.log(e);
  }

  // listens for postMessage close from iframe
  // and closes the iframe
  function _setListeners() {

    // pms.receive('MyTimeLoaded', config.mytimeDomain, _logEvent, null, true);
    pms.receive('MyTimeLoaded', config.mytimeDomain, _sendDeviceConfig, null, true);
    pms.receive('MyTimeLoaded', config.mytimeDomain, _setMyTimeReady, null, true);
    pms.receive('MyTimeLoaded', config.mytimeDomain, _execQueue, null, true);
    pms.receive('MyTimeClose', config.mytimeDomain, _resetSupportModule, null, true);
  }

  // Removes events set by _setListeners
  function _removeEventListeners() {

    pms.removeEvent('MyTimeLoaded');
    pms.removeEvent('MyTimeClose');
  }

  // Create the resume previous conversation popup
  function _createPopup() {

    var popupContainer = document.createElement('div');
    popupContainer.setAttribute('id', 'mytimeResumeConversation');
    popupContainer.class = 'mytime-popup-container';

    var popupMessage = document.createElement('h4');
    popupMessage.appendChild(document.createTextNode('Resume previous conversation?'));

    var yesBtn = document.createElement('button');
    yesBtn.setAttribute('id', 'resumeConversation');
    yesBtn.class = 'btn btn-primary';
    yesBtn.appendChild(document.createTextNode('Yes'));

    var noBtn = document.createElement('button');
    noBtn.setAttribute('id', 'cancelConversation');
    noBtn.class = "btn btn-default";
    noBtn.appendChild(document.createTextNode('No'));


    popupContainer.appendChild(popupMessage);
    popupContainer.appendChild(yesBtn);
    popupContainer.appendChild(noBtn);


    $('body').append(popupContainer);
    $('#mytimeResumeConversation').css({
      top: ($(window).height() - $(popupContainer).width()) / 2,
      left: ($(window).width() - $(popupContainer).width()) / 2
    });

    $('mytimeResumeConversation').show();
  }

  // Not used
  function _getDeviceHeightAndWidth() {

    deviceHeight = $(window).outerHeight();
    deviceWidth = $(window).outerWidth();
  }

  // Not used
  function _setFrameSize() {

    var ua = navigator.userAgent.toLowerCase();
    var isAndroid = ua.indexOf("android") > -1; // Detect Android devices
    if (isAndroid) {

      //window.orientation is different for iOS and Android
      if (window.orientation == 0 || window.orientation == 180) { //Landscape Mode
        $('#cs-iframe-container, #mt-frame').css({
          width: 300 + 'px',
          height: 400 + 'px'
        });
      }
      else if (window.orientation == 90 || window.orientation == -90) { //Portrait Mode
        $('#cs-iframe-container, #mt-frame').css({
          height: SupportModule.deviceHeight(),
          width: SupportModule.deviceWidth()
        })
      }
    }
    else {
      if (window.orientation == 90 || window.orientation == -90) { //Landscape Mode
        $('#cs-iframe-container, #mt-frame').css({
          width: 300 + 'px',
          height: 400 + 'px'
        });
      }
      else if (window.orientation == 0 || window.orientation == 180) { //Portrait Mode
        $('#cs-iframe-container, #mt-frame').css({
          height: SupportModule.deviceHeight(),
          width: SupportModule.deviceWidth()
        })
      }
    }
  }

  // Sets the path to the location of the mytime module
  function _setMyTimePath(path) {

    config.mytimePath = path;
  }

  // sets the domain of the mytime module
  function _setMyTimeDomain(domain) {

    config.mytimeDomain = domain;
  }

  // Sets the window name for the mytime module
  function _setMyTimeWindowName(name) {

    config.mytimeWindowName = name;
  }

  function _checkAutoLoginUser() {

    if (autoLoginUser) {
      _sendAutoLoginMessage(autoLoginUser);
    }
  }

  function _setAutoLoginUser(userObj) {

    autoLoginUser = userObj;
  }

  function _setWindowName(name) {
    config.windowName = name;
    window.name = name;
  }

  function _registerPML(event, fn, args, useData) {

    pms.receive(event, config.mytimeDomain, fn, args, useData);
  }

  function _unregisterPML(event) {

    pms.removeEvent(event);
  }

  function _logoutMyTime() {

    if (!postMessageWindow) {
      var savedWindow = window.open('', config.mytimeWindowName);
      if (savedWindow != undefined && savedWindow != null) {
        postMessageWindow = savedWindow;
      }
    }

    pms.send('MyTimeLogout', null, postMessageWindow, config.mytimeDomain);
  }

  return {
    init: function () {

      // Listen for MyTimeClose message from iframe if applicable
      _setListeners();

      // What are we viewing this site from
      _testUserAgent();

      // Were we passed a previous conversation
      this.hasPreviousConversation();

    },
    setMyTimePath: function (path) {

      _setMyTimePath(path);
    },
    setMyTimeDomain: function (domain) {

      _setMyTimeDomain(domain);
    },
    setWindowName: function (name) {
      _setWindowName(name);
    },
    setMyTimeWindowName: function (name) {

      _setMyTimeWindowName(name);
    },
    hasPreviousConversation: function () {

      previousConvo = _hasPreviousConversation();
      var that = this;

      if (Object.prototype.toString.call(previousConvo) === '[object Object]') {

        $('#previous-conversation').css({
          display: 'inline-block'
        })

        // Do we want a popup and is this a desktop device
        if (config.popupDesktop && config.mobile !== true) {

          // yes do popup
          _createPopup();

          $('#resumeConversation').on('click', function () {
            that.resumePreviousConversation();
            $('#mytimeResumeConversation').remove();
          });

          $('#cancelConversation').on('click', function () {
            $('#mytimeResumeConversation').remove();
          });

        }

        // do we want a popup and is this a mobile device
        else if (config.popupMobile && config.mobile === true) {

          // yes create popup
          _createPopup();

          $('#resumeConversation').on('click', function () {
            that.resumePreviousConversation();
            $('#mytimeResumeConversation').remove();
          });

          $('#cancelConversation').on('click', function () {
            $('#mytimeResumeConversation').remove();
          });
        }

        // we don't want a popup but if we are desktop then open the
        // iframe
        else {

          that.resumePreviousConversation();
        }
      }
    },
    addPaddingToApp: function () {

      _addPaddingToApp();
    },
    openMainHelp: function () {

      if (postMessageWindow == null || postMessageWindow == undefined) {

        config.ready = false;
        _openChatWindow();
        _isReady(_sendStateMessage, 'ASV_MENU');
        _isReady(_checkAutoLoginUser, null);
      }
      else {
        _sendStateMessage('ASV_MENU');
        postMessageWindow.focus();
      }
    },
    openHistory: function () {

      if (postMessageWindow == null || postMessageWindow == undefined) {

        config.ready = false;
        _openChatWindow();
        _isReady(_sendStateMessage, 'ASV_HISTORY');
        _isReady(_checkAutoLoginUser, null);
      }
      else {
        _sendStateMessage('ASV_HISTORY');
        postMessageWindow.focus();
      }
    },
    openNotifications: function () {

      if (postMessageWindow == null || postMessageWindow == undefined) {

        config.ready = false;

        _openChatWindow();
        _isReady(_sendStateMessage, 'ASV_NOTIFICATIONS');
        _isReady(_checkAutoLoginUser, null);
      }
      else {
        _sendStateMessage('ASV_NOTIFICATIONS');
        postMessageWindow.focus();
      }
    },
    openSelfService: function () {

      if (postMessageWindow == null || postMessageWindow == undefined) {

        config.ready = false;

        _openChatWindow();
        _isReady(_sendStateMessage, 'ASV_SELF_SERVICE:NEW');
        _isReady(_checkAutoLoginUser, null);
      }
      else {
        _sendStateMessage('ASV_SELF_SERVICE:NEW');
        postMessageWindow.focus();
      }
    },
    openSelfServingContent: function () {

      if (postMessageWindow == null || postMessageWindow == undefined) {

        config.ready = false;

        _openChatWindow();
        _isReady(_sendStateMessage, 'ASV_SELF_SERVING_CONTENT:NEW');
        _isReady(_checkAutoLoginUser, null);
      }
      else {
        _sendStateMessage('ASV_SELF_SERVING_CONTENT:NEW');
        postMessageWindow.focus();
      }
    },
    resumePreviousConversation: function () {

      if (postMessageWindow == null || postMessageWindow == undefined) {

        config.ready = false;
        _openChatWindow();
        _isReady(_resumePreviousConversation, previousConvo);
      }
      else {
        _isReady(_resumePreviousConversation, previousConvo);
        postMessageWindow.focus();
      }
    },
    sendAutoLoginMessage: function (user) {

      autoLoginUser = user;

      if (postMessageWindow == null || postMessageWindow == undefined) {

        config.ready = false;

        _openChatWindow();
        _isReady(_sendAutoLoginMessage, user);
      }
      else {
        _isReady(_sendAutoLoginMessage, user);
        postMessageWindow.focus();
      }
    },
    setAutoLoginUser: function (user) {
      _setAutoLoginUser(user);
    },
    registerPML: function (event, fn, args, useData) {
      _registerPML(event, fn, args, useData);
    },
    unregisterPML: function (event) {
      _unregisterPML(event);
    },
    getDevice: function () {

      return config.device
    },
    getAppWindow: function () {

      return postMessageWindow;
    },
    getDeviceHeightAndWidth: function () {

      _getDeviceHeightAndWidth();
    },
    deviceHeight: function () {
      return deviceHeight;
    },
    deviceWidth: function () {
      return deviceWidth;
    },
    setFrameSize: function () {
      _setFrameSize();
    },
    logoutMyTime: function() {

      _logoutMyTime();
    }
  }
};

