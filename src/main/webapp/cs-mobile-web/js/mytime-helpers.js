
// Various Helper functions
var MyTimeHelpers = (function() {

  return {

    /**
     * Return object from array with given key.
     *
     * Searches for an object in an array with a given key. If
     * found the object is spliced from the original array
     * and returned.  The original array is modified.
     *
     * @param key
     * @param arr
     * @returns {*}
     */
    pluck: function (key, arr) {

      var i = 0,
        obj = false;

      while (i < arr.length && !obj) {

        if (arr[i].hasOwnProperty(key)) {
          obj = arr.splice(i, 1);
        }

        i++
      }

      return obj.length === 1 ? obj[0] : obj;
    },

    isArray: function (value) {

      return Object.prototype.toString.call(value) === '[object Array]';
    },

    isObject: function (value) {

      return Object.prototype.toString.call(value) === '[object Object]';
    },

    isFunction: function (value) {

      return Object.prototype.toString.call(value) === '[object Function]';
    },

    isString: function (value) {

      return Object.prototype.toString.call(value) === '[object String]';
    },

    isNumber: function (value) {

      return Object.prototype.toString.call(value) === '[object Number]';
    }
  }

})();
