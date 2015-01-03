// Generated by CoffeeScript 1.7.1
(function() {
  var Stream, checkType, eq, lookup, match, operator, queryStream, valOp, valOpMatch;

  Stream = require('stream');

  lookup = function(needle, haystack) {
    var key, keys, val, _i, _len;
    keys = needle.split('.');
    val = haystack;
    for (_i = 0, _len = keys.length; _i < _len; _i++) {
      key = keys[_i];
      if (val === void 0) {
        return;
      }
      val = val[key];
    }
    return val;
  };

  eq = function(a, b) {
    if (b instanceof RegExp) {
      return b.test(a);
    } else if (Array.isArray(a)) {
      return a.indexOf(b) !== -1;
    } else {
      return b === a;
    }
  };

  checkType = function(val, typeId) {
    switch (typeId) {
      case 1:
        return typeof val === 'number';
      case 2:
        return typeof val === 'string';
      case 3:
        return typeof val === 'object';
      case 4:
        return val instanceof Array;
      case 8:
        return typeof val === 'boolean';
      case 10:
        return typeof val === 'object' && !val;
      default:
        return false;
    }
  };

  match = function(predicate, haystack) {
    var matchCount, matches, n, v;
    matches = 0;
    matchCount = Object.keys(predicate).length;
    for (n in predicate) {
      v = predicate[n];
      if (n[0] === '$') {
        matches += operator(n, v, haystack);
      } else if (v && (v.constructor === Object || (typeof v === 'object' && !(v instanceof RegExp)))) {
        if (valOpMatch(lookup(n, haystack), v, haystack)) {
          matches++;
        }
      } else {
        if (eq(lookup(n, haystack), v)) {
          matches++;
        }
      }
    }
    return matches === matchCount;
  };

  valOpMatch = function(val, predicate, haystack) {
    var matchCount, matches, n, v;
    matchCount = Object.keys(predicate).length;
    matches = 0;
    for (n in predicate) {
      v = predicate[n];
      if (n[0] === '$') {
        if (valOp(n, val, v, haystack)) {
          matches++;
        }
      }
    }
    return matches === matchCount;
  };

  valOp = function(op, val, args, haystack) {
    var matchCount, matches, part, v, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m;
    switch (op) {
      case '$in':
        matchCount = 0;
        matches = 0;
        for (_i = 0, _len = args.length; _i < _len; _i++) {
          part = args[_i];
          if (eq(val, part)) {
            matches++;
          }
        }
        return matches > 0;
      case '$nin':
        return !valOp('$in', val, args, haystack);
      case '$all':
        matchCount = args.length;
        matches = 0;
        if (val) {
          for (_j = 0, _len1 = args.length; _j < _len1; _j++) {
            part = args[_j];
            for (_k = 0, _len2 = val.length; _k < _len2; _k++) {
              v = val[_k];
              if (eq(v, part)) {
                matches++;
                break;
              }
            }
          }
        }
        return matches === matchCount;
      case '$elemMatch':
        return match(args, val);
      case '$or':
        matches = 0;
        for (_l = 0, _len3 = args.length; _l < _len3; _l++) {
          part = args[_l];
          if (valOpMatch(val, part, haystack)) {
            matches++;
          }
        }
        return matches > 0;
      case '$and':
        matchCount = args.length;
        matches = 0;
        for (_m = 0, _len4 = args.length; _m < _len4; _m++) {
          part = args[_m];
          if (valOpMatch(val, part, haystack)) {
            matches++;
          }
        }
        return matches === matchCount;
      case '$not':
        return !valOpMatch(val, args, haystack);
      case '$gt':
        return val > args;
      case '$gte':
        return val >= args;
      case '$ne':
        return val !== args;
      case '$lt':
        return val < args;
      case '$lte':
        return val <= args;
      case '$mod':
        return (val % args[0]) === args[1];
      case '$size':
        return val instanceof Array && val.length === args;
      case '$exists':
        if (args) {
          return val !== void 0;
        } else {
          return val === void 0;
        }
        break;
      case '$type':
        return checkType(val, args);
      default:
        return false;
    }
  };

  operator = function(op, predicate, haystack) {
    var matchCount, matches, part, _i, _j, _len, _len1;
    switch (op) {
      case '$or':
        matches = 0;
        for (_i = 0, _len = predicate.length; _i < _len; _i++) {
          part = predicate[_i];
          if (match(part, haystack)) {
            matches++;
          }
        }
        return matches > 0;
      case '$and':
        matchCount = predicate.length;
        matches = 0;
        for (_j = 0, _len1 = predicate.length; _j < _len1; _j++) {
          part = predicate[_j];
          if (match(part, haystack)) {
            matches++;
          }
        }
        return matches === matchCount;
      case '$not':
        return !match(predicate, haystack);
      default:
        return false;
    }
  };

  queryStream = function(query) {
    var s;
    s = new Stream;
    s.writable = true;
    s.readable = true;
    s.write = function(buf) {
      if (match(query, buf)) {
        return s.emit('data', buf);
      }
    };
    s.end = function(buf) {
      if (arguments.length) {
        s.write(buf);
      }
      s.writeable = false;
      return s.emit('end');
    };
    s.destroy = function() {
      return s.writeable = false;
    };
    return s;
  };

  module.exports = queryStream;

  module.exports.match = function(haystack, predicate) {
    return match(predicate, haystack);
  };

}).call(this);