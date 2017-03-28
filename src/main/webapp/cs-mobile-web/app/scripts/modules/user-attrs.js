'use strict';

angular.module('MyTime.UserAttrs', [])
  .service('UserAttrsService', [function () {


    var userAttrs = [
        {
          type: "id",
          name: "addrEmail",
            value: null,
            validate: [empty, validateEmail]
        },
        {
          type: "info",
          name: "firstName",
            value: null,
            validate: [empty]
      }
    ];


    function empty (field) {

      return field === '' || field === null || field === undefined;
    }


    function validateEmail(email) {
      var re = /^(([a-zA-Z0-9_.-])+@([a-zA-Z0-9_.-])+\.([a-zA-Z])+([a-zA-Z])+)?$/;
      return re.test(email);
    }


    return {

      userAttrs: function (options) {

        options = options || null;
        var _userAttrs = [];

        angular.forEach(userAttrs, function(obj) {
          delete obj.validate;
          obj.value = options !== null && options.hasOwnProperty(obj.name) ? options[obj.name] : obj.value;
          _userAttrs.push(obj);
        });

        return _userAttrs;
        },

      validate: function (options) {
          
          if (!options.hasOwnProperty('firstName') || empty(options.firstName)) {
              return {
                  field: 'firstName',
                  message: 'The name field must be completed.'
              }
          }

        if (!options.hasOwnProperty('addrEmail') || empty(options.addrEmail)) {

          return {
            field: 'addrEmail',
            message: 'The email field is required.'
          }
        }


        if (!validateEmail(options.addrEmail)) {

          return {
            field: 'addrEmail',
            message: 'The email address format is invalid.'
          }
        }




        return true;
      }
    }
  }]);