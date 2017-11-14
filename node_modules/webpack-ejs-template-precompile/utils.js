/*
 * EJS Embedded JavaScript templates
 * Copyright 2112 Matthew Eernisse (mde@fleegix.org)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

/**
 * Private utility functions
 * @module utils
 * @private
 */

'use strict';

/*
日志模块
*/
var log4js = require("log4js");
var pwd = process.cwd();
var path = require('path');
var fs = require('fs');
var crypto = require('crypto');
log4js.configure({
    appenders: [
        { type: 'console' },
        {
            type: 'file',
            filename: path.resolve(pwd, "build.log"),
            category: 'file'
        }
    ]
});
var logger = log4js.getLogger();
var loggerbuild = log4js.getLogger("file");
var regExpChars = /[|\\{}()[\]^$+*?.]/g;
exports.log = {
        setLevel: function(level) {
            logger.setLevel(level);
            loggerbuild.setLevel(level);
        },
        trace: function(text) {
            // logger.trace(text);
            loggerbuild.trace(text);
        },
        debug: function(text) {
            //logger.debug(text);
            loggerbuild.debug(text);
        },
        info: function(text) {
            //logger.info(text);
            try {
                loggerbuild.info(text);
            } catch (ex) {

            }
        },
        warn: function(text) {
            //logger.warn(text);
            loggerbuild.warn(text);
        },
        error: function(text) {
            //logger.error(text);
            loggerbuild.error(text);
        },
        fatal: function(text) {
            // logger.fatal(text);
            loggerbuild.fatal(text);
        }
    }
    /**
     * Escape characters reserved in regular expressions.
     *
     * If `string` is `undefined` or `null`, the empty string is returned.
     *
     * @param {String} string Input string
     * @return {String} Escaped string
     * @static
     * @private
     */
exports.escapeRegExpChars = function(string) {
    // istanbul ignore if
    if (!string) {
        return '';
    }
    return String(string).replace(regExpChars, '\\$&');
};

var _ENCODE_HTML_RULES = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&#34;',
        "'": '&#39;'
    },
    _MATCH_HTML = /[&<>\'"]/g;

function encode_char(c) {
    return _ENCODE_HTML_RULES[c] || c;
};

/**
 * Stringified version of constants used by {@link module:utils.escapeXML}.
 *
 * It is used in the process of generating {@link ClientFunction}s.
 *
 * @readonly
 * @type {String}
 */

var escapeFuncStr =
    'var _ENCODE_HTML_RULES = {\n' +
    '      "&": "&amp;"\n' +
    '    , "<": "&lt;"\n' +
    '    , ">": "&gt;"\n' +
    '    , \'"\': "&#34;"\n' +
    '    , "\'": "&#39;"\n' +
    '    }\n' +
    '  , _MATCH_HTML = /[&<>\'"]/g;\n' +
    'function encode_char(c) {\n' +
    '  return _ENCODE_HTML_RULES[c] || c;\n' +
    '};\n';

/**
 * Escape characters reserved in XML.
 *
 * If `markup` is `undefined` or `null`, the empty string is returned.
 *
 * @implements {EscapeCallback}
 * @param {String} markup Input string
 * @return {String} Escaped string
 * @static
 * @private
 */

exports.escapeXML = function(markup) {
    return markup == undefined ?
        '' :
        String(markup)
        .replace(_MATCH_HTML, encode_char);
};
exports.escapeXML.toString = function() {
    return Function.prototype.toString.call(this) + ';\n' + escapeFuncStr
};

/**
 * Copy all properties from one object to another, in a shallow fashion.
 *
 * @param  {Object} to   Destination object
 * @param  {Object} from Source object
 * @return {Object}      Destination object
 * @static
 * @private
 */
exports.shallowCopy = function(to, from) {
    from = from || {};
    for (var p in from) {
        to[p] = from[p];
    }
    return to;
};

/**
 * Simple in-process cache implementation. Does not implement limits of any
 * sort.
 *
 * @implements Cache
 * @static
 * @private
 */
exports.cache = {
    _data: {},
    set: function(key, val) {
        this._data[key] = val;
    },
    get: function(key) {
        return this._data[key];
    },
    reset: function() {
        this._data = {};
    }
};

exports.isArray = function(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
}


exports.extend = function() {
    var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {},
        i = 1,
        length = arguments.length,
        deep = false,
        toString = Object.prototype.toString,
        hasOwn = Object.prototype.hasOwnProperty,
        push = Array.prototype.push,
        slice = Array.prototype.slice,
        trim = String.prototype.trim,
        indexOf = Array.prototype.indexOf,
        class2type = {
            "[object Boolean]": "boolean",
            "[object Number]": "number",
            "[object String]": "string",
            "[object Function]": "function",
            "[object Array]": "array",
            "[object Date]": "date",
            "[object RegExp]": "regexp",
            "[object Object]": "object"
        },
        jQuery = {
            isFunction: function(obj) {
                return jQuery.type(obj) === "function"
            },
            isArray: Array.isArray ||
                function(obj) {
                    return jQuery.type(obj) === "array"
                },
            isWindow: function(obj) {
                return obj != null && obj == obj.window
            },
            isNumeric: function(obj) {
                return !isNaN(parseFloat(obj)) && isFinite(obj)
            },
            type: function(obj) {
                return obj == null ? String(obj) : class2type[toString.call(obj)] || "object"
            },
            isPlainObject: function(obj) {
                if (!obj || jQuery.type(obj) !== "object" || obj.nodeType) {
                    return false
                }
                try {
                    if (obj.constructor && !hasOwn.call(obj, "constructor") && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
                        return false
                    }
                } catch (e) {
                    return false
                }
                var key;
                for (key in obj) {}
                return key === undefined || hasOwn.call(obj, key)
            }
        };
    if (typeof target === "boolean") {
        deep = target;
        target = arguments[1] || {};
        i = 2;
    }
    if (typeof target !== "object" && !jQuery.isFunction(target)) {
        target = {}
    }
    if (length === i) {
        target = this;
        --i;
    }
    for (i; i < length; i++) {
        if ((options = arguments[i]) != null) {
            for (name in options) {
                src = target[name];
                copy = options[name];
                if (target === copy) {
                    continue
                }
                if (deep && copy && (jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)))) {
                    if (copyIsArray) {
                        copyIsArray = false;
                        clone = src && jQuery.isArray(src) ? src : []
                    } else {
                        clone = src && jQuery.isPlainObject(src) ? src : {};
                    }
                    // WARNING: RECURSION
                    target[name] = extend(deep, clone, copy);
                } else if (copy !== undefined) {
                    target[name] = copy;
                }
            }
        }
    }
    return target;
}
var CONST_Version = "0.0.001";

exports.newVersion = function(version) {
    //version+1
    if (version == null) {
        version = "0.0.0";
    }
    var vs = version.split('.');
    if (vs.length != 3) {
        version = "0.0.0";
        vs = version.split('.');
    }
    if (parseInt(vs[2]) >= 10000) {
        vs[2] = 0;
        vs[1] = parseInt(vs[1]) + 1;
    } else {
        vs[2] = parseInt(vs[2]) + 1;
    }
    if (parseInt(vs[1]) >= 10000) {
        vs[1] = 0;
        vs[0] = parseInt(vs[0]) + 1;
    } else {
        vs[1] = parseInt(vs[1]) + 1;
    }
    version = vs.join('.');
    return version;
}
var ticks = new Date().getTime();
exports.pathNewVersion = function(path) {
    if (path.indexOf('?') > 0) {
        if (path.indexof("mt=") > 0) {
            path += "&mt=" + ticks;
        }
    } else {
        path += "?mt=" + ticks;
    }

}
exports.md5 = function(str) {
    var md5sum = crypto.createHash('md5');
    md5sum.update(str);
    str = md5sum.digest('hex');
    return str;
};
exports.compareFile = function(path1, path2) {
    var content1 = fs.readFileSync(path1).toString();
    var content2 = fs.readFileSync(path2).toString();
    return exports.md5(content1) == exports.md5(content2);
}
exports.removeBom = function(buff) {
    if (buff.length >= 3 &&
        buff[0].toString(16).toLowerCase() == "ef" &&
        buff[1].toString(16).toLowerCase() == "bb" &&
        buff[2].toString(16).toLowerCase() == "bf") {
        buff = buff.slice(3);
    }
    return buff.toString();
}