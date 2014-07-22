!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.jqueryAjaxRequest=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
(function (global){
var $, URI, stableStringify, _,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

$ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

_ = (typeof window !== "undefined" ? window. _ : typeof global !== "undefined" ? global. _ : null);

URI = _dereq_('uri-js');

stableStringify = _dereq_('json-stable-stringify');

module.exports = function(options) {
  var Request, appendToCacheKey, defaultFailHandler, injectData, onBeforeRequestStarts, onRequestEnded, retrieveCache, storeCache;
  defaultFailHandler = (options != null ? options.defaultFailHandler : void 0) || function() {};
  onBeforeRequestStarts = (options != null ? options.onBeforeRequestStarts : void 0) || function() {};
  onRequestEnded = (options != null ? options.onRequestEnded : void 0) || function() {};
  injectData = (options != null ? options.injectData : void 0) || function(d) {
    return d;
  };
  storeCache = (options != null ? options.storeCache : void 0) || function(key, value) {};
  retrieveCache = (options != null ? options.retrieveCache : void 0) || function(key, cb) {
    return cb(null);
  };
  appendToCacheKey = (options != null ? options.appendToCacheKey : void 0) || "";
  return Request = (function() {
    function Request(method, url) {
      var _ref;
      this.method = method;
      this.url = url;
      this._generateCacheKey = __bind(this._generateCacheKey, this);
      this._useCacheIfPossible = __bind(this._useCacheIfPossible, this);
      this._executeGetRequest = __bind(this._executeGetRequest, this);
      this._executePostRequest = __bind(this._executePostRequest, this);
      this._prepareToRequest = __bind(this._prepareToRequest, this);
      this._createErrorCallback = __bind(this._createErrorCallback, this);
      this._createSuccessCallback = __bind(this._createSuccessCallback, this);
      this.end = __bind(this.end, this);
      this.option = __bind(this.option, this);
      this.useCache = __bind(this.useCache, this);
      this.acceptsJSON = __bind(this.acceptsJSON, this);
      this.acceptsText = __bind(this.acceptsText, this);
      this.fail = __bind(this.fail, this);
      this.send = __bind(this.send, this);
      this.query = __bind(this.query, this);
      if (!((_ref = this.method) === "GET" || _ref === "POST")) {
        throw new Error("Method must be GET/POST");
      }
      if (!(_.isString(this.url))) {
        throw new Error("Url must be informed");
      }
      this._query = {};
      this.options = {
        acceptsJSON: true,
        background: false
      };
      this._json = void 0;
      this.onFail = defaultFailHandler;
      this._cacheKey = void 0;
      this._usedCache = false;
    }

    Request.post = function(url) {
      return new Request("POST", url);
    };

    Request.get = function(url) {
      return new Request("GET", url);
    };

    Request.put = function(url) {
      return new Request("PUT", url);
    };

    Request["delete"] = function(url) {
      return new Request("DELETE", url);
    };

    Request.del = function(url) {
      return new Request("DELETE", url);
    };

    Request.prototype.query = function(query) {
      if (!_.isObject(query)) {
        throw new Error("Query must be an object");
      }
      this._query = _.extend(this._query, query);
      return this;
    };

    Request.prototype.send = function(json) {
      if (!_.isObject(json)) {
        throw new Error("Json must be an object");
      }
      if (_.isArray(json)) {
        throw new Error("Json cant be an array");
      }
      this._json = json;
      return this;
    };

    Request.prototype.fail = function(fn) {
      if (!_.isFunction(fn)) {
        throw new Error("Function must be informed");
      }
      this.onFail = fn;
      return this;
    };

    Request.prototype.acceptsText = function() {
      this.options.acceptsJSON = false;
      return this;
    };

    Request.prototype.acceptsJSON = function() {
      this.options.acceptsJSON = true;
      return this;
    };

    Request.prototype.useCache = function() {
      this.options.useCache = true;
      return this;
    };

    Request.prototype.option = function(opt, value) {
      this.options[opt] = value;
      return this;
    };

    Request.prototype.end = function(userCallback) {
      var callback;
      if (!(userCallback === void 0 || _.isFunction(userCallback))) {
        throw new Error("Callback must be a function or not defined at all");
      }
      userCallback = userCallback || function() {};
      callback = this._createSuccessCallback(userCallback);
      if ("POST" === this.method) {
        return this._executePostRequest(callback);
      } else if ("GET" === this.method) {
        return this._executeGetRequest(callback);
      } else {
        throw new Error("Method " + this.method + " not supported");
      }
    };

    Request.prototype._createSuccessCallback = function(callback) {
      if (!_.isFunction(callback)) {
        throw new Error("Callback must be a function");
      }
      return (function(_this) {
        return function(data) {
          if (_this.options.useCache === true && (data != null) && !_this._usedCache) {
            storeCache(_this._generateCacheKey(), data);
          }
          onRequestEnded(_this);
          return callback.apply(null, arguments);
        };
      })(this);
    };

    Request.prototype._createErrorCallback = function() {
      return (function(_this) {
        return function() {
          onRequestEnded(_this);
          return _this.onFail.apply(null, [null, arguments[0], _this.options, arguments[2]]);
        };
      })(this);
    };

    Request.prototype._prepareToRequest = function() {
      if (!_.isEmpty(this._query)) {
        this.url = URI(this.url).query(this._query).toString();
      }
      return onBeforeRequestStarts(this);
    };

    Request.prototype._executePostRequest = function(callback) {
      this._prepareToRequest();
      return this._useCacheIfPossible((function(_this) {
        return function(result) {
          var ajaxOptions;
          if (result) {
            _this._usedCache = true;
            return callback(result);
          }
          ajaxOptions = {
            cache: false,
            type: _this.method,
            url: _this.url,
            data: JSON.stringify(injectData(_this._json || {})),
            success: callback,
            error: _this._createErrorCallback(),
            contentType: 'application/json',
            dataType: 'json',
            global: false
          };
          if (!_this.options.acceptsJSON) {
            delete ajaxOptions.dataType;
          }
          return $.ajax(ajaxOptions);
        };
      })(this));
    };

    Request.prototype._executeGetRequest = function(callback) {
      this._prepareToRequest();
      return this._useCacheIfPossible((function(_this) {
        return function(result) {
          var ajaxOptions;
          if (result) {
            _this._usedCache = true;
            return callback(result);
          }
          ajaxOptions = {
            cache: false,
            type: 'GET',
            url: _this.url,
            success: callback,
            error: _this._createErrorCallback(),
            contentType: 'application/json',
            dataType: 'json',
            global: false
          };
          if (!_this.options.acceptsJSON) {
            delete ajaxOptions.dataType;
          }
          return $.ajax(ajaxOptions);
        };
      })(this));
    };

    Request.prototype._useCacheIfPossible = function(callback) {
      if (this.options.useCache === true) {
        return retrieveCache(this._generateCacheKey(), callback);
      }
      return callback(null);
    };

    Request.prototype._generateCacheKey = function() {
      if (this._cacheKey == null) {
        this._cacheKey = "" + appendToCacheKey + "-" + this.method + "-" + this.url;
        if (!_.isEmpty(this._query)) {
          this._cacheKey = this._cacheKey + "-" + stableStringify(this._query);
        }
        if (!_.isEmpty(this._json)) {
          this._cacheKey = this._cacheKey + "-" + stableStringify(this._json);
        }
      }
      return this._cacheKey;
    };

    return Request;

  })();
};

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"json-stable-stringify":2,"uri-js":9}],2:[function(_dereq_,module,exports){
var json = typeof JSON !== 'undefined' ? JSON : _dereq_('jsonify');

module.exports = function (obj, opts) {
    if (!opts) opts = {};
    if (typeof opts === 'function') opts = { cmp: opts };
    var space = opts.space || '';
    if (typeof space === 'number') space = Array(space+1).join(' ');
    var cycles = (typeof opts.cycles === 'boolean') ? opts.cycles : false;
    var replacer = opts.replacer || function(key, value) { return value; };

    var cmp = opts.cmp && (function (f) {
        return function (node) {
            return function (a, b) {
                var aobj = { key: a, value: node[a] };
                var bobj = { key: b, value: node[b] };
                return f(aobj, bobj);
            };
        };
    })(opts.cmp);

    var seen = [];
    return (function stringify (parent, key, node, level) {
        var indent = space ? ('\n' + new Array(level + 1).join(space)) : '';
        var colonSeparator = space ? ': ' : ':';

        if (node && node.toJSON && typeof node.toJSON === 'function') {
            node = node.toJSON();
        }

        node = replacer.call(parent, key, node);

        if (node === undefined) {
            return;
        }
        if (typeof node !== 'object' || node === null) {
            return json.stringify(node);
        }
        if (isArray(node)) {
            var out = [];
            for (var i = 0; i < node.length; i++) {
                var item = stringify(node, i, node[i], level+1) || json.stringify(null);
                out.push(indent + space + item);
            }
            return '[' + out.join(',') + indent + ']';
        }
        else {
            if (seen.indexOf(node) !== -1) {
                if (cycles) return json.stringify('__cycle__');
                throw new TypeError('Converting circular structure to JSON');
            }
            else seen.push(node);

            var keys = objectKeys(node).sort(cmp && cmp(node));
            var out = [];
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                var value = stringify(node, key, node[key], level+1);

                if(!value) continue;

                var keyValue = json.stringify(key)
                    + colonSeparator
                    + value;
                ;
                out.push(indent + space + keyValue);
            }
            return '{' + out.join(',') + indent + '}';
        }
    })({ '': obj }, '', obj, 0);
};

var isArray = Array.isArray || function (x) {
    return {}.toString.call(x) === '[object Array]';
};

var objectKeys = Object.keys || function (obj) {
    var has = Object.prototype.hasOwnProperty || function () { return true };
    var keys = [];
    for (var key in obj) {
        if (has.call(obj, key)) keys.push(key);
    }
    return keys;
};

},{"jsonify":3}],3:[function(_dereq_,module,exports){
exports.parse = _dereq_('./lib/parse');
exports.stringify = _dereq_('./lib/stringify');

},{"./lib/parse":4,"./lib/stringify":5}],4:[function(_dereq_,module,exports){
var at, // The index of the current character
    ch, // The current character
    escapee = {
        '"':  '"',
        '\\': '\\',
        '/':  '/',
        b:    '\b',
        f:    '\f',
        n:    '\n',
        r:    '\r',
        t:    '\t'
    },
    text,

    error = function (m) {
        // Call error when something is wrong.
        throw {
            name:    'SyntaxError',
            message: m,
            at:      at,
            text:    text
        };
    },
    
    next = function (c) {
        // If a c parameter is provided, verify that it matches the current character.
        if (c && c !== ch) {
            error("Expected '" + c + "' instead of '" + ch + "'");
        }
        
        // Get the next character. When there are no more characters,
        // return the empty string.
        
        ch = text.charAt(at);
        at += 1;
        return ch;
    },
    
    number = function () {
        // Parse a number value.
        var number,
            string = '';
        
        if (ch === '-') {
            string = '-';
            next('-');
        }
        while (ch >= '0' && ch <= '9') {
            string += ch;
            next();
        }
        if (ch === '.') {
            string += '.';
            while (next() && ch >= '0' && ch <= '9') {
                string += ch;
            }
        }
        if (ch === 'e' || ch === 'E') {
            string += ch;
            next();
            if (ch === '-' || ch === '+') {
                string += ch;
                next();
            }
            while (ch >= '0' && ch <= '9') {
                string += ch;
                next();
            }
        }
        number = +string;
        if (!isFinite(number)) {
            error("Bad number");
        } else {
            return number;
        }
    },
    
    string = function () {
        // Parse a string value.
        var hex,
            i,
            string = '',
            uffff;
        
        // When parsing for string values, we must look for " and \ characters.
        if (ch === '"') {
            while (next()) {
                if (ch === '"') {
                    next();
                    return string;
                } else if (ch === '\\') {
                    next();
                    if (ch === 'u') {
                        uffff = 0;
                        for (i = 0; i < 4; i += 1) {
                            hex = parseInt(next(), 16);
                            if (!isFinite(hex)) {
                                break;
                            }
                            uffff = uffff * 16 + hex;
                        }
                        string += String.fromCharCode(uffff);
                    } else if (typeof escapee[ch] === 'string') {
                        string += escapee[ch];
                    } else {
                        break;
                    }
                } else {
                    string += ch;
                }
            }
        }
        error("Bad string");
    },

    white = function () {

// Skip whitespace.

        while (ch && ch <= ' ') {
            next();
        }
    },

    word = function () {

// true, false, or null.

        switch (ch) {
        case 't':
            next('t');
            next('r');
            next('u');
            next('e');
            return true;
        case 'f':
            next('f');
            next('a');
            next('l');
            next('s');
            next('e');
            return false;
        case 'n':
            next('n');
            next('u');
            next('l');
            next('l');
            return null;
        }
        error("Unexpected '" + ch + "'");
    },

    value,  // Place holder for the value function.

    array = function () {

// Parse an array value.

        var array = [];

        if (ch === '[') {
            next('[');
            white();
            if (ch === ']') {
                next(']');
                return array;   // empty array
            }
            while (ch) {
                array.push(value());
                white();
                if (ch === ']') {
                    next(']');
                    return array;
                }
                next(',');
                white();
            }
        }
        error("Bad array");
    },

    object = function () {

// Parse an object value.

        var key,
            object = {};

        if (ch === '{') {
            next('{');
            white();
            if (ch === '}') {
                next('}');
                return object;   // empty object
            }
            while (ch) {
                key = string();
                white();
                next(':');
                if (Object.hasOwnProperty.call(object, key)) {
                    error('Duplicate key "' + key + '"');
                }
                object[key] = value();
                white();
                if (ch === '}') {
                    next('}');
                    return object;
                }
                next(',');
                white();
            }
        }
        error("Bad object");
    };

value = function () {

// Parse a JSON value. It could be an object, an array, a string, a number,
// or a word.

    white();
    switch (ch) {
    case '{':
        return object();
    case '[':
        return array();
    case '"':
        return string();
    case '-':
        return number();
    default:
        return ch >= '0' && ch <= '9' ? number() : word();
    }
};

// Return the json_parse function. It will have access to all of the above
// functions and variables.

module.exports = function (source, reviver) {
    var result;
    
    text = source;
    at = 0;
    ch = ' ';
    result = value();
    white();
    if (ch) {
        error("Syntax error");
    }

    // If there is a reviver function, we recursively walk the new structure,
    // passing each name/value pair to the reviver function for possible
    // transformation, starting with a temporary root object that holds the result
    // in an empty key. If there is not a reviver function, we simply return the
    // result.

    return typeof reviver === 'function' ? (function walk(holder, key) {
        var k, v, value = holder[key];
        if (value && typeof value === 'object') {
            for (k in value) {
                if (Object.prototype.hasOwnProperty.call(value, k)) {
                    v = walk(value, k);
                    if (v !== undefined) {
                        value[k] = v;
                    } else {
                        delete value[k];
                    }
                }
            }
        }
        return reviver.call(holder, key, value);
    }({'': result}, '')) : result;
};

},{}],5:[function(_dereq_,module,exports){
var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
    escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
    gap,
    indent,
    meta = {    // table of character substitutions
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"' : '\\"',
        '\\': '\\\\'
    },
    rep;

function quote(string) {
    // If the string contains no control characters, no quote characters, and no
    // backslash characters, then we can safely slap some quotes around it.
    // Otherwise we must also replace the offending characters with safe escape
    // sequences.
    
    escapable.lastIndex = 0;
    return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
        var c = meta[a];
        return typeof c === 'string' ? c :
            '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
    }) + '"' : '"' + string + '"';
}

function str(key, holder) {
    // Produce a string from holder[key].
    var i,          // The loop counter.
        k,          // The member key.
        v,          // The member value.
        length,
        mind = gap,
        partial,
        value = holder[key];
    
    // If the value has a toJSON method, call it to obtain a replacement value.
    if (value && typeof value === 'object' &&
            typeof value.toJSON === 'function') {
        value = value.toJSON(key);
    }
    
    // If we were called with a replacer function, then call the replacer to
    // obtain a replacement value.
    if (typeof rep === 'function') {
        value = rep.call(holder, key, value);
    }
    
    // What happens next depends on the value's type.
    switch (typeof value) {
        case 'string':
            return quote(value);
        
        case 'number':
            // JSON numbers must be finite. Encode non-finite numbers as null.
            return isFinite(value) ? String(value) : 'null';
        
        case 'boolean':
        case 'null':
            // If the value is a boolean or null, convert it to a string. Note:
            // typeof null does not produce 'null'. The case is included here in
            // the remote chance that this gets fixed someday.
            return String(value);
            
        case 'object':
            if (!value) return 'null';
            gap += indent;
            partial = [];
            
            // Array.isArray
            if (Object.prototype.toString.apply(value) === '[object Array]') {
                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }
                
                // Join all of the elements together, separated with commas, and
                // wrap them in brackets.
                v = partial.length === 0 ? '[]' : gap ?
                    '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' :
                    '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }
            
            // If the replacer is an array, use it to select the members to be
            // stringified.
            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }
            else {
                // Otherwise, iterate through all of the keys in the object.
                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }
            
        // Join all of the member texts together, separated with commas,
        // and wrap them in braces.

        v = partial.length === 0 ? '{}' : gap ?
            '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' :
            '{' + partial.join(',') + '}';
        gap = mind;
        return v;
    }
}

module.exports = function (value, replacer, space) {
    var i;
    gap = '';
    indent = '';
    
    // If the space parameter is a number, make an indent string containing that
    // many spaces.
    if (typeof space === 'number') {
        for (i = 0; i < space; i += 1) {
            indent += ' ';
        }
    }
    // If the space parameter is a string, it will be used as the indent string.
    else if (typeof space === 'string') {
        indent = space;
    }

    // If there is a replacer, it must be a function or an array.
    // Otherwise, throw an error.
    rep = replacer;
    if (replacer && typeof replacer !== 'function'
    && (typeof replacer !== 'object' || typeof replacer.length !== 'number')) {
        throw new Error('JSON.stringify');
    }
    
    // Make a fake root object containing our value under the key of ''.
    // Return the result of stringifying the value.
    return str('', {'': value});
};

},{}],6:[function(_dereq_,module,exports){
_dereq_("./schemes/http");
_dereq_("./schemes/urn");
},{"./schemes/http":7,"./schemes/urn":8}],7:[function(_dereq_,module,exports){
(function () {
	var URI = _dereq_("../uri").URI;
	
	//RFC 2616
	URI.SCHEMES["http"] = {
		serialize : function (components, options) {
			//normalize the default port
			if (components.port === 80 || components.port === "") {
				components.port = undefined;
			}
			//normalize the empty path
			if (!components.path) {
				components.path = "/";
			}
			
			//NOTE: We do not parse query strings for HTTP URIs
			//as WWW Form Url Encoded query strings are part of the HTML4+ spec,
			//and not the HTTP spec. 
			
			return components;
		}
	};
}());
},{"../uri":9}],8:[function(_dereq_,module,exports){
(function () {
	var URI_NS = _dereq_("../uri"),
		URI = URI_NS.URI,
		pctEncChar = URI_NS.pctEncChar,
		NID$ = "(?:[0-9A-Za-z][0-9A-Za-z\\-]{1,31})",
		PCT_ENCODED$ = "(?:\\%[0-9A-Fa-f]{2})",
		TRANS$$ = "[0-9A-Za-z\\(\\)\\+\\,\\-\\.\\:\\=\\@\\;\\$\\_\\!\\*\\'\\/\\?\\#]",
		NSS$ = "(?:(?:" + PCT_ENCODED$ + "|" + TRANS$$ + ")+)",
		URN_SCHEME = new RegExp("^urn\\:(" + NID$ + ")$"),
		URN_PATH = new RegExp("^(" + NID$ + ")\\:(" + NSS$ + ")$"),
		URN_PARSE = /^([^\:]+)\:(.*)/,
		URN_EXCLUDED = /[\x00-\x20\\\"\&\<\>\[\]\^\`\{\|\}\~\x7F-\xFF]/g,
		UUID = /^[0-9A-Fa-f]{8}(?:\-[0-9A-Fa-f]{4}){3}\-[0-9A-Fa-f]{12}$/;
	
	//RFC 2141
	URI.SCHEMES["urn"] = {
		parse : function (components, options) {
			var matches = components.path.match(URN_PATH),
				scheme, schemeHandler;
			
			if (!matches) {
				if (!options.tolerant) {
					components.errors.push("URN is not strictly valid.");
				}
				
				matches = components.path.match(URN_PARSE);
			}
			
			if (matches) {
				scheme = "urn:" + matches[1].toLowerCase();
				schemeHandler = URI.SCHEMES[scheme];
				
				//in order to serialize properly, 
				//every URN must have a serializer that calls the URN serializer 
				if (!schemeHandler) {
					schemeHandler = URI.SCHEMES[scheme] = {};
				}
				if (!schemeHandler.serialize) {
					schemeHandler.serialize = URI.SCHEMES["urn"].serialize;
				}
				
				components.scheme = scheme;
				components.path = matches[2];
				
				if (schemeHandler.parse) {
					schemeHandler.parse(components, options);
				}
			} else {
				components.errors.push("URN can not be parsed.");
			}
	
			return components;
		},
		
		serialize : function (components, options) {
			var scheme = components.scheme || options.scheme,
				matches;
			
			if (scheme && scheme !== "urn") {
				var matches = scheme.match(URN_SCHEME);
				
				if (!matches) {
					matches = ["urn:" + scheme, scheme];
				}
				
				components.scheme = "urn";
				components.path = matches[1] + ":" + (components.path ? components.path.replace(URN_EXCLUDED, pctEncChar) : "");
			}
			
			return components;
		}
	};
	
	//RFC 4122
	URI.SCHEMES["urn:uuid"] = {
		parse : function (components, options) {
			if (!options.tolerant && (!components.path || !components.path.match(UUID))) {
				components.errors.push("UUID is not valid.");
			}
		},
		
		serialize : function (components, options) {
			//ensure UUID is valid
			if (!options.tolerant && (!components.path || !components.path.match(UUID))) {
				//invalid UUIDs can not have this scheme
				components.scheme = undefined;
			} else {
				//normalize UUID
				components.path = (components.path || "").toLowerCase();
			}
			
			return URI.SCHEMES["urn"].serialize(components, options);
		}
	};
}());
},{"../uri":9}],9:[function(_dereq_,module,exports){
/**
 * URI.js
 * 
 * @fileoverview An RFC 3986 compliant, scheme extendable URI parsing/validating/resolving library for JavaScript.
 * @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
 * @version 1.4.2
 * @see http://github.com/garycourt/uri-js
 * @license URI.js v1.4.2 (c) 2011 Gary Court. License: http://github.com/garycourt/uri-js
 */

/**
 * Copyright 2011 Gary Court. All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, are
 * permitted provided that the following conditions are met:
 * 
 *    1. Redistributions of source code must retain the above copyright notice, this list of
 *       conditions and the following disclaimer.
 * 
 *    2. Redistributions in binary form must reproduce the above copyright notice, this list
 *       of conditions and the following disclaimer in the documentation and/or other materials
 *       provided with the distribution.
 * 
 * THIS SOFTWARE IS PROVIDED BY GARY COURT ``AS IS'' AND ANY EXPRESS OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL GARY COURT OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
 * ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * 
 * The views and conclusions contained in the software and documentation are those of the
 * authors and should not be interpreted as representing official policies, either expressed
 * or implied, of Gary Court.
 */

/*jslint white: true, sub: true, undef: true, newcap: true, plusplus: true, bitwise: true, regexp: true, nomen: true, indent: 4 */
/*global exports:true, require:true, URI:true */

if (typeof exports === "undefined") {
	exports = {}; 
}
if (typeof _dereq_ !== "function") {
	_dereq_ = function (id) {
		"use strict";
		return exports;
	};
}
URI = (function () {
	"use strict";
	
	var	
		/**
		 * @param {...string} sets
		 * @return {string}
		 */
		mergeSet = function (sets) {
			var set = sets,
				x = 1,
				nextSet = arguments[x];
			
			while (nextSet) {
				set = set.slice(0, -1) + nextSet.slice(1);
				nextSet = arguments[++x];
			}
			
			return set;
		},
		
		/**
		 * @param {string} str
		 * @return {string}
		 */
		subexp = function (str) {
			return "(?:" + str + ")";
		},
	
		ALPHA$$ = "[A-Za-z]",
		CR$ = "[\\x0D]",
		DIGIT$$ = "[0-9]",
		DQUOTE$$ = "[\\x22]",
		HEXDIG$$ = mergeSet(DIGIT$$, "[A-Fa-f]"),  //case-insensitive
		LF$$ = "[\\x0A]",
		SP$$ = "[\\x20]",
		PCT_ENCODED$ = subexp("%" + HEXDIG$$ + HEXDIG$$),
		GEN_DELIMS$$ = "[\\:\\/\\?\\#\\[\\]\\@]",
		SUB_DELIMS$$ = "[\\!\\$\\&\\'\\(\\)\\*\\+\\,\\;\\=]",
		RESERVED$$ = mergeSet(GEN_DELIMS$$, SUB_DELIMS$$),
		UNRESERVED$$ = mergeSet(ALPHA$$, DIGIT$$, "[\\-\\.\\_\\~]"),
		SCHEME$ = subexp(ALPHA$$ + mergeSet(ALPHA$$, DIGIT$$, "[\\+\\-\\.]") + "*"),
		USERINFO$ = subexp(subexp(PCT_ENCODED$ + "|" + mergeSet(UNRESERVED$$, SUB_DELIMS$$, "[\\:]")) + "*"),
		DEC_OCTET$ = subexp(subexp("25[0-5]") + "|" + subexp("2[0-4]" + DIGIT$$) + "|" + subexp("1" + DIGIT$$ + DIGIT$$) + "|" + subexp("[1-9]" + DIGIT$$) + "|" + DIGIT$$),
		IPV4ADDRESS$ = subexp(DEC_OCTET$ + "\\." + DEC_OCTET$ + "\\." + DEC_OCTET$ + "\\." + DEC_OCTET$),
		H16$ = subexp(HEXDIG$$ + "{1,4}"),
		LS32$ = subexp(subexp(H16$ + "\\:" + H16$) + "|" + IPV4ADDRESS$),
		IPV6ADDRESS$ = subexp(mergeSet(UNRESERVED$$, SUB_DELIMS$$, "[\\:]") + "+"),  //FIXME
		IPVFUTURE$ = subexp("v" + HEXDIG$$ + "+\\." + mergeSet(UNRESERVED$$, SUB_DELIMS$$, "[\\:]") + "+"),
		IP_LITERAL$ = subexp("\\[" + subexp(IPV6ADDRESS$ + "|" + IPVFUTURE$) + "\\]"),
		REG_NAME$ = subexp(subexp(PCT_ENCODED$ + "|" + mergeSet(UNRESERVED$$, SUB_DELIMS$$)) + "*"),
		HOST$ = subexp(IP_LITERAL$ + "|" + IPV4ADDRESS$ + "|" + REG_NAME$),
		PORT$ = subexp(DIGIT$$ + "*"),
		AUTHORITY$ = subexp(subexp(USERINFO$ + "@") + "?" + HOST$ + subexp("\\:" + PORT$) + "?"),
		PCHAR$ = subexp(PCT_ENCODED$ + "|" + mergeSet(UNRESERVED$$, SUB_DELIMS$$, "[\\:\\@]")),
		SEGMENT$ = subexp(PCHAR$ + "*"),
		SEGMENT_NZ$ = subexp(PCHAR$ + "+"),
		SEGMENT_NZ_NC$ = subexp(subexp(PCT_ENCODED$ + "|" + mergeSet(UNRESERVED$$, SUB_DELIMS$$, "[\\@]")) + "+"),
		PATH_ABEMPTY$ = subexp(subexp("\\/" + SEGMENT$) + "*"),
		PATH_ABSOLUTE$ = subexp("\\/" + subexp(SEGMENT_NZ$ + PATH_ABEMPTY$) + "?"),  //simplified
		PATH_NOSCHEME$ = subexp(SEGMENT_NZ_NC$ + PATH_ABEMPTY$),  //simplified
		PATH_ROOTLESS$ = subexp(SEGMENT_NZ$ + PATH_ABEMPTY$),  //simplified
		PATH_EMPTY$ = subexp(""),  //simplified
		PATH$ = subexp(PATH_ABEMPTY$ + "|" + PATH_ABSOLUTE$ + "|" + PATH_NOSCHEME$ + "|" + PATH_ROOTLESS$ + "|" + PATH_EMPTY$),
		QUERY$ = subexp(subexp(PCHAR$ + "|[\\/\\?]") + "*"),
		FRAGMENT$ = subexp(subexp(PCHAR$ + "|[\\/\\?]") + "*"),
		HIER_PART$ = subexp(subexp("\\/\\/" + AUTHORITY$ + PATH_ABEMPTY$) + "|" + PATH_ABSOLUTE$ + "|" + PATH_ROOTLESS$ + "|" + PATH_EMPTY$),
		URI$ = subexp(SCHEME$ + "\\:" + HIER_PART$ + subexp("\\?" + QUERY$) + "?" + subexp("\\#" + FRAGMENT$) + "?"),
		RELATIVE_PART$ = subexp(subexp("\\/\\/" + AUTHORITY$ + PATH_ABEMPTY$) + "|" + PATH_ABSOLUTE$ + "|" + PATH_NOSCHEME$ + "|" + PATH_EMPTY$),
		RELATIVE$ = subexp(RELATIVE_PART$ + subexp("\\?" + QUERY$) + "?" + subexp("\\#" + FRAGMENT$) + "?"),
		URI_REFERENCE$ = subexp(URI$ + "|" + RELATIVE$),
		ABSOLUTE_URI$ = subexp(SCHEME$ + "\\:" + HIER_PART$ + subexp("\\?" + QUERY$) + "?"),
		
		GENERIC_REF$ = "^(" + SCHEME$ + ")\\:" + subexp(subexp("\\/\\/(" + subexp("(" + USERINFO$ + ")@") + "?(" + HOST$ + ")" + subexp("\\:(" + PORT$ + ")") + "?)") + "?(" + PATH_ABEMPTY$ + "|" + PATH_ABSOLUTE$ + "|" + PATH_ROOTLESS$ + "|" + PATH_EMPTY$ + ")") + subexp("\\?(" + QUERY$ + ")") + "?" + subexp("\\#(" + FRAGMENT$ + ")") + "?$",
		RELATIVE_REF$ = "^(){0}" + subexp(subexp("\\/\\/(" + subexp("(" + USERINFO$ + ")@") + "?(" + HOST$ + ")" + subexp("\\:(" + PORT$ + ")") + "?)") + "?(" + PATH_ABEMPTY$ + "|" + PATH_ABSOLUTE$ + "|" + PATH_NOSCHEME$ + "|" + PATH_EMPTY$ + ")") + subexp("\\?(" + QUERY$ + ")") + "?" + subexp("\\#(" + FRAGMENT$ + ")") + "?$",
		ABSOLUTE_REF$ = "^(" + SCHEME$ + ")\\:" + subexp(subexp("\\/\\/(" + subexp("(" + USERINFO$ + ")@") + "?(" + HOST$ + ")" + subexp("\\:(" + PORT$ + ")") + "?)") + "?(" + PATH_ABEMPTY$ + "|" + PATH_ABSOLUTE$ + "|" + PATH_ROOTLESS$ + "|" + PATH_EMPTY$ + ")") + subexp("\\?(" + QUERY$ + ")") + "?$",
		SAMEDOC_REF$ = "^" + subexp("\\#(" + FRAGMENT$ + ")") + "?$",
		AUTHORITY_REF$ = "^" + subexp("(" + USERINFO$ + ")@") + "?(" + HOST$ + ")" + subexp("\\:(" + PORT$ + ")") + "?$",
		
		URI_REF = new RegExp("(" + GENERIC_REF$ + ")|(" + RELATIVE_REF$ + ")"),
		NOT_SCHEME = new RegExp(mergeSet("[^]", ALPHA$$, DIGIT$$, "[\\+\\-\\.]"), "g"),
		NOT_USERINFO = new RegExp(mergeSet("[^\\%\\:]", UNRESERVED$$, SUB_DELIMS$$), "g"),
		NOT_HOST = new RegExp(mergeSet("[^\\%]", UNRESERVED$$, SUB_DELIMS$$), "g"),
		NOT_PATH = new RegExp(mergeSet("[^\\%\\/\\:\\@]", UNRESERVED$$, SUB_DELIMS$$), "g"),
		NOT_PATH_NOSCHEME = new RegExp(mergeSet("[^\\%\\/\\@]", UNRESERVED$$, SUB_DELIMS$$), "g"),
		NOT_QUERY = new RegExp(mergeSet("[^\\%]", UNRESERVED$$, SUB_DELIMS$$, "[\\:\\@\\/\\?]"), "g"),
		NOT_FRAGMENT = NOT_QUERY,
		ESCAPE = new RegExp(mergeSet("[^]", UNRESERVED$$, SUB_DELIMS$$), "g"),
		UNRESERVED = new RegExp(UNRESERVED$$, "g"),
		OTHER_CHARS = new RegExp(mergeSet("[^\\%]", UNRESERVED$$, RESERVED$$), "g"),
		PCT_ENCODEDS = new RegExp(PCT_ENCODED$ + "+", "g"),
		URI_PARSE = /^(?:([^:\/?#]+):)?(?:\/\/((?:([^\/?#@]*)@)?([^\/?#:]*)(?:\:(\d*))?))?([^?#]*)(?:\?([^#]*))?(?:#((?:.|\n)*))?/i,
		RDS1 = /^\.\.?\//,
		RDS2 = /^\/\.(\/|$)/,
		RDS3 = /^\/\.\.(\/|$)/,
		RDS4 = /^\.\.?$/,
		RDS5 = /^\/?(?:.|\n)*?(?=\/|$)/,
		NO_MATCH_IS_UNDEFINED = ("").match(/(){0}/)[1] === undefined,
		
		/**
		 * @param {string} chr
		 * @return {string}
		 */
		pctEncChar = function (chr) {
			var c = chr.charCodeAt(0), e;
 
			if (c < 16) {
				e = "%0" + c.toString(16).toUpperCase();
			}
			else if (c < 128) {
				e = "%" + c.toString(16).toUpperCase();
			}
			else if (c < 2048) {
				e = "%" + ((c >> 6) | 192).toString(16).toUpperCase() + "%" + ((c & 63) | 128).toString(16).toUpperCase();
			}
			else {
				e = "%" + ((c >> 12) | 224).toString(16).toUpperCase() + "%" + (((c >> 6) & 63) | 128).toString(16).toUpperCase() + "%" + ((c & 63) | 128).toString(16).toUpperCase();
			}
			
			return e;
		},
		
		/**
		 * @param {string} str
		 * @return {string}
		 */
		pctDecUnreserved = function (str) {
			var newStr = "", 
				i = 0,
				c, s;
	 
			while (i < str.length) {
				c = parseInt(str.substr(i + 1, 2), 16);
	 
				if (c < 128) {
					s = String.fromCharCode(c);
					if (s.match(UNRESERVED)) {
						newStr += s;
					} else {
						newStr += str.substr(i, 3);
					}
					i += 3;
				}
				else if ((c > 191) && (c < 224)) {
					newStr += str.substr(i, 6);
					i += 6;
				}
				else {
					newStr += str.substr(i, 9);
					i += 9;
				}
			}
	 
			return newStr;
		},
		
		/**
		 * @param {string} str
		 * @return {string}
		 */
		pctDecChars = function (str) {
			var newStr = "", 
				i = 0,
				c, c2, c3;
	 
			while (i < str.length) {
				c = parseInt(str.substr(i + 1, 2), 16);
	 
				if (c < 128) {
					newStr += String.fromCharCode(c);
					i += 3;
				}
				else if ((c > 191) && (c < 224)) {
					c2 = parseInt(str.substr(i + 4, 2), 16);
					newStr += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
					i += 6;
				}
				else {
					c2 = parseInt(str.substr(i + 4, 2), 16);
					c3 = parseInt(str.substr(i + 7, 2), 16);
					newStr += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
					i += 9;
				}
			}
	 
			return newStr;
		},
		
		/**
		 * @return {string}
		 */
		typeOf = function (o) {
			return o === undefined ? "undefined" : (o === null ? "null" : Object.prototype.toString.call(o).split(" ").pop().split("]").shift().toLowerCase());
		},
		
		/**
		 * @constructor
		 * @implements URIComponents
		 */
		Components = function () {
			this.errors = [];
		}, 
		
		/** @namespace */ 
		URI = exports;
	
	/**
	 * Components
	 */
	
	Components.prototype = {
		/**
		 * @type String
		 */
		
		scheme : undefined,
		
		/**
		 * @type String
		 */
		
		userinfo : undefined,
		
		/**
		 * @type String
		 */
		
		host : undefined,
		
		/**
		 * @type number
		 */
		
		port : undefined,
		
		/**
		 * @type string
		 */
		
		path : undefined,
		
		/**
		 * @type string
		 */
		
		query : undefined,
		
		/**
		 * @type string
		 */
		
		fragment : undefined,
		
		/**
		 * @type string
		 * @values "uri", "absolute", "relative", "same-document"
		 */
		
		reference : undefined,
		
		/**
		 * @type Array
		 */
		
		errors : undefined
	};
	
	/**
	 * URI
	 */
	
	/**
	 * @namespace
	 */
	
	URI.SCHEMES = {};
	
	/**
	 * @param {string} uriString
	 * @param {Options} [options]
	 * @returns {URIComponents}
	 */
	
	URI.parse = function (uriString, options) {
		var matches, 
			components = new Components(),
			schemeHandler;
		
		uriString = uriString ? uriString.toString() : "";
		options = options || {};
		
		if (options.reference === "suffix") {
			uriString = (options.scheme ? options.scheme + ":" : "") + "//" + uriString;
		}
		
		matches = uriString.match(URI_REF);
		
		if (matches) {
			if (matches[1]) {
				//generic URI
				matches = matches.slice(1, 10);
			} else {
				//relative URI
				matches = matches.slice(10, 19);
			}
		} 
		
		if (!matches) {
			if (!options.tolerant) {
				components.errors.push("URI is not strictly valid.");
			}
			matches = uriString.match(URI_PARSE);
		}
		
		if (matches) {
			if (NO_MATCH_IS_UNDEFINED) {
				//store each component
				components.scheme = matches[1];
				//components.authority = matches[2];
				components.userinfo = matches[3];
				components.host = matches[4];
				components.port = parseInt(matches[5], 10);
				components.path = matches[6] || "";
				components.query = matches[7];
				components.fragment = matches[8];
				
				//fix port number
				if (isNaN(components.port)) {
					components.port = matches[5];
				}
			} else {  //IE FIX for improper RegExp matching
				//store each component
				components.scheme = matches[1] || undefined;
				//components.authority = (uriString.indexOf("//") !== -1 ? matches[2] : undefined);
				components.userinfo = (uriString.indexOf("@") !== -1 ? matches[3] : undefined);
				components.host = (uriString.indexOf("//") !== -1 ? matches[4] : undefined);
				components.port = parseInt(matches[5], 10);
				components.path = matches[6] || "";
				components.query = (uriString.indexOf("?") !== -1 ? matches[7] : undefined);
				components.fragment = (uriString.indexOf("#") !== -1 ? matches[8] : undefined);
				
				//fix port number
				if (isNaN(components.port)) {
					components.port = (uriString.match(/\/\/(?:.|\n)*\:(?:\/|\?|\#|$)/) ? matches[4] : undefined);
				}
			}
			
			//determine reference type
			if (components.scheme === undefined && components.userinfo === undefined && components.host === undefined && components.port === undefined && components.path === undefined && components.query === undefined) {
				components.reference = "same-document";
			} else if (components.scheme === undefined) {
				components.reference = "relative";
			} else if (components.fragment === undefined) {
				components.reference = "absolute";
			} else {
				components.reference = "uri";
			}
			
			//check for reference errors
			if (options.reference && options.reference !== "suffix" && options.reference !== components.reference) {
				components.errors.push("URI is not a " + options.reference + " reference.");
			}
			
			//check if a handler for the scheme exists
			schemeHandler = URI.SCHEMES[(options.scheme || components.scheme || "").toLowerCase()];
			if (schemeHandler && schemeHandler.parse) {
				//perform extra parsing
				schemeHandler.parse(components, options);
			}
		} else {
			components.errors.push("URI can not be parsed.");
		}
		
		return components;
	};
	
	/**
	 * @private
	 * @param {URIComponents} components
	 * @returns {string|undefined}
	 */
	
	URI._recomposeAuthority = function (components) {
		var uriTokens = [];
		
		if (components.userinfo !== undefined) {
			uriTokens.push(components.userinfo.toString().replace(NOT_USERINFO, pctEncChar));
			uriTokens.push("@");
		}
		if (components.host !== undefined) {
			uriTokens.push(components.host.toString().toLowerCase().replace(NOT_HOST, pctEncChar));
		}
		if (typeof components.port === "number") {
			uriTokens.push(":");
			uriTokens.push(components.port.toString(10));
		}
		
		return uriTokens.length ? uriTokens.join("") : undefined;
	};
	
	/**
	 * @param {string} input
	 * @returns {string}
	 */
	
	URI.removeDotSegments = function (input) {
		var output = [], s;
		
		while (input.length) {
			if (input.match(RDS1)) {
				input = input.replace(RDS1, "");
			} else if (input.match(RDS2)) {
				input = input.replace(RDS2, "/");
			} else if (input.match(RDS3)) {
				input = input.replace(RDS3, "/");
				output.pop();
			} else if (input === "." || input === "..") {
				input = "";
			} else {
				s = input.match(RDS5)[0];
				input = input.slice(s.length);
				output.push(s);
			}
		}
		
		return output.join("");
	};
	
	/**
	 * @param {URIComponents} components
	 * @param {Options} [options]
	 * @returns {string}
	 */
	
	URI.serialize = function (components, options) {
		var uriTokens = [], 
			schemeHandler,
			authority,
			s;
		options = options || {};
		
		//check if a handler for the scheme exists
		schemeHandler = URI.SCHEMES[(options.scheme || components.scheme || "").toLowerCase()];
		if (schemeHandler && schemeHandler.serialize) {
			//perform extra serialization
			schemeHandler.serialize(components, options);
		}
		
		if (options.reference !== "suffix" && components.scheme) {
			uriTokens.push(components.scheme.toString().toLowerCase().replace(NOT_SCHEME, ""));
			uriTokens.push(":");
		}
		
		authority = URI._recomposeAuthority(components);
		if (authority !== undefined) {
			if (options.reference !== "suffix") {
				uriTokens.push("//");
			}
			
			uriTokens.push(authority);
			
			if (components.path && components.path.charAt(0) !== "/") {
				uriTokens.push("/");
			}
		}
		
		if (components.path !== undefined) {
			s = URI.removeDotSegments(components.path.toString().replace(/%2E/ig, "."));
			
			if (components.scheme) {
				s = s.replace(NOT_PATH, pctEncChar);
			} else {
				s = s.replace(NOT_PATH_NOSCHEME, pctEncChar);
			}
			
			if (authority === undefined) {
				s = s.replace(/^\/\//, "/%2F");  //don't allow the path to start with "//"
			}
			uriTokens.push(s);
		}
		
		if (components.query !== undefined) {
			uriTokens.push("?");
			uriTokens.push(components.query.toString().replace(NOT_QUERY, pctEncChar));
		}
		
		if (components.fragment !== undefined) {
			uriTokens.push("#");
			uriTokens.push(components.fragment.toString().replace(NOT_FRAGMENT, pctEncChar));
		}
		
		return uriTokens
			.join('')  //merge tokens into a string
			.replace(PCT_ENCODEDS, pctDecUnreserved)  //undecode unreserved characters
			//.replace(OTHER_CHARS, pctEncChar)  //replace non-URI characters
			.replace(/%[0-9A-Fa-f]{2}/g, function (str) {  //uppercase percent encoded characters
				return str.toUpperCase();
			})
		;
	};
	
	/**
	 * @param {URIComponents} base
	 * @param {URIComponents} relative
	 * @param {Options} [options]
	 * @param {boolean} [skipNormalization]
	 * @returns {URIComponents}
	 */
	
	URI.resolveComponents = function (base, relative, options, skipNormalization) {
		var target = new Components();
		
		if (!skipNormalization) {
			base = URI.parse(URI.serialize(base, options), options);  //normalize base components
			relative = URI.parse(URI.serialize(relative, options), options);  //normalize relative components
		}
		options = options || {};
		
		if (!options.tolerant && relative.scheme) {
			target.scheme = relative.scheme;
			//target.authority = relative.authority;
			target.userinfo = relative.userinfo;
			target.host = relative.host;
			target.port = relative.port;
			target.path = URI.removeDotSegments(relative.path);
			target.query = relative.query;
		} else {
			if (relative.userinfo !== undefined || relative.host !== undefined || relative.port !== undefined) {
				//target.authority = relative.authority;
				target.userinfo = relative.userinfo;
				target.host = relative.host;
				target.port = relative.port;
				target.path = URI.removeDotSegments(relative.path);
				target.query = relative.query;
			} else {
				if (!relative.path) {
					target.path = base.path;
					if (relative.query !== undefined) {
						target.query = relative.query;
					} else {
						target.query = base.query;
					}
				} else {
					if (relative.path.charAt(0) === "/") {
						target.path = URI.removeDotSegments(relative.path);
					} else {
						if ((base.userinfo !== undefined || base.host !== undefined || base.port !== undefined) && !base.path) {
							target.path = "/" + relative.path;
						} else if (!base.path) {
							target.path = relative.path;
						} else {
							target.path = base.path.slice(0, base.path.lastIndexOf("/") + 1) + relative.path;
						}
						target.path = URI.removeDotSegments(target.path);
					}
					target.query = relative.query;
				}
				//target.authority = base.authority;
				target.userinfo = base.userinfo;
				target.host = base.host;
				target.port = base.port;
			}
			target.scheme = base.scheme;
		}
		
		target.fragment = relative.fragment;
		
		return target;
	};
	
	/**
	 * @param {string} baseURI
	 * @param {string} relativeURI
	 * @param {Options} [options]
	 * @returns {string}
	 */
	
	URI.resolve = function (baseURI, relativeURI, options) {
		return URI.serialize(URI.resolveComponents(URI.parse(baseURI, options), URI.parse(relativeURI, options), options, true), options);
	};
	
	/**
	 * @param {string|URIComponents} uri
	 * @param {Options} options
	 * @returns {string|URIComponents}
	 */
	
	URI.normalize = function (uri, options) {
		if (typeof uri === "string") {
			uri = URI.serialize(URI.parse(uri, options), options);
		} else if (typeOf(uri) === "object") {
			uri = URI.parse(URI.serialize(uri, options), options);
		}
		
		return uri;
	};
	
	/**
	 * @param {string|URIComponents} uriA
	 * @param {string|URIComponents} uriB
	 * @param {Options} options
	 */
	
	URI.equal = function (uriA, uriB, options) {
		if (typeof uriA === "string") {
			uriA = URI.serialize(URI.parse(uriA, options), options);
		} else if (typeOf(uriA) === "object") {
			uriA = URI.serialize(uriA, options);
		}
		
		if (typeof uriB === "string") {
			uriB = URI.serialize(URI.parse(uriB, options), options);
		} else if (typeOf(uriB) === "object") {
			uriB = URI.serialize(uriB, options);
		}
		
		return uriA === uriB;
	};
	
	/**
	 * @param {string} str
	 * @returns {string}
	 */
	
	URI.escapeComponent = function (str) {
		return str && str.toString().replace(ESCAPE, pctEncChar);
	};
	
	/**
	 * @param {string} str
	 * @returns {string}
	 */
	
	URI.unescapeComponent = function (str) {
		return str && str.toString().replace(PCT_ENCODEDS, pctDecChars);
	};
	
	//export API
	exports.pctEncChar = pctEncChar;
	exports.pctDecChars = pctDecChars;
	exports.Components = Components;
	exports.URI = URI;
	
	//name-safe export API
	exports["pctEncChar"] = pctEncChar;
	exports["pctDecChars"] = pctDecChars;
	exports["Components"] = Components;
	exports["URI"] = {
		"SCHEMES" : URI.SCHEMES,
		"parse" : URI.parse,
		"removeDotSegments" : URI.removeDotSegments,
		"serialize" : URI.serialize,
		"resolveComponents" : URI.resolveComponents,
		"resolve" : URI.resolve,
		"normalize" : URI.normalize,
		"equal" : URI.equal,
		"escapeComponent" : URI.escapeComponent,
		"unescapeComponent" : URI.unescapeComponent
	};
	
	//load all schemes
	_dereq_("./schemes");
	
	return URI;
}());
},{"./schemes":6}]},{},[1])
(1)
});