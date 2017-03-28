'use strict';



// Register Module
angular.module('MyTime.DeviceConfig', []);



// Register Services
angular.module('MyTime.DeviceConfig')
  .service('DeviceConfigService', [function() {


    var deviceConfig = {
      mobile: false,
      device: null,
      browser: null
    };

    function _configPropExists(prop) {

      return deviceConfig.hasOwnProperty(prop);
    }


    return {

      get: function(configProp) {

        if (_configPropExists(configProp)) {
          return deviceConfig[configProp];
        }

        throw 'InvalidArgument: Device config property does not exist: ' + configProp;
      },

      setAll: function (configObj) {

        deviceConfig = configObj;
      },

      set: function(prop, value) {

        if (_configPropExists(prop)) {
          deviceConfig[prop] = value
        }

        throw 'InvalidArgument: Device config property does not exist: ' + configProp;
      }
    }
  }]);