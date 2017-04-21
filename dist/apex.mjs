var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};





















var get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

















var set = function set(object, property, value, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent !== null) {
      set(parent, property, value, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    desc.value = value;
  } else {
    var setter = desc.set;

    if (setter !== undefined) {
      setter.call(receiver, value);
    }
  }

  return value;
};

// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE
// codemirror-mode-apex by Maura C. Warner (lines 285-EOF)
// the rest of this code is from CodeMirror's clike.js

(function (mod) {
  if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) == "object" && (typeof module === "undefined" ? "undefined" : _typeof(module)) == "object") // CommonJS
    mod(require("../../lib/codemirror"));else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);else // Plain browser env
    mod(CodeMirror);
})(function (CodeMirror) {
  "use strict";

  function Context(indented, column, type, info, align, prev) {
    this.indented = indented;
    this.column = column;
    this.type = type;
    this.info = info;
    this.align = align;
    this.prev = prev;
  }
  function pushContext(state, col, type, info) {
    var indent = state.indented;
    if (state.context && state.context.type == "statement" && type != "statement") indent = state.context.indented;
    return state.context = new Context(indent, col, type, info, null, state.context);
  }
  function popContext(state) {
    var t = state.context.type;
    if (t == ")" || t == "]" || t == "}") state.indented = state.context.indented;
    return state.context = state.context.prev;
  }

  function typeBefore(stream, state, pos) {
    if (state.prevToken == "variable" || state.prevToken == "variable-3") return true;
    if (/\S(?:[^- ]>|[*\]])\s*$|\*$/.test(stream.string.slice(0, pos))) return true;
    if (state.typeAtEndOfLine && stream.column() == stream.indentation()) return true;
  }

  function isTopScope(context) {
    for (;;) {
      if (!context || context.type == "top") return true;
      if (context.type == "}" && context.prev.info != "namespace") return false;
      context = context.prev;
    }
  }

  CodeMirror.defineMode("apex", function (config, parserConfig) {
    var indentUnit = config.indentUnit,
        statementIndentUnit = parserConfig.statementIndentUnit || indentUnit,
        dontAlignCalls = parserConfig.dontAlignCalls,
        keywords = parserConfig.keywords || {},
        types = parserConfig.types || {},
        builtin = parserConfig.builtin || {},
        blockKeywords = parserConfig.blockKeywords || {},
        defKeywords = parserConfig.defKeywords || {},
        atoms = parserConfig.atoms || {},
        hooks = parserConfig.hooks || {},
        multiLineStrings = parserConfig.multiLineStrings,
        indentStatements = parserConfig.indentStatements !== false,
        indentSwitch = parserConfig.indentSwitch !== false,
        namespaceSeparator = parserConfig.namespaceSeparator,
        isPunctuationChar = parserConfig.isPunctuationChar || /[\[\]{}\(\),;\:\.]/,
        numberStart = parserConfig.numberStart || /[\d\.]/,
        number = parserConfig.number || /^(?:0x[a-f\d]+|0b[01]+|(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?)(u|ll?|l|f)?/i,
        isOperatorChar = parserConfig.isOperatorChar || /[+\-*&%=<>!?|\/]/,
        isIdentifierChar = parserConfig.isIdentifierChar || /[\w\$_\xa1-\uffff]/;

    var curPunc, isDefKeyword;

    function tokenBase(stream, state) {
      var ch = stream.next();
      if (hooks[ch]) {
        var result = hooks[ch](stream, state);
        if (result !== false) return result;
      }
      if (ch == '"' || ch == "'") {
        state.tokenize = tokenString(ch);
        return state.tokenize(stream, state);
      }
      if (isPunctuationChar.test(ch)) {
        curPunc = ch;
        return null;
      }
      if (numberStart.test(ch)) {
        stream.backUp(1);
        if (stream.match(number)) return "number";
        stream.next();
      }
      if (ch == "/") {
        if (stream.eat("*")) {
          state.tokenize = tokenComment;
          return tokenComment(stream, state);
        }
        if (stream.eat("/")) {
          stream.skipToEnd();
          return "comment";
        }
      }
      if (isOperatorChar.test(ch)) {
        while (!stream.match(/^\/[\/*]/, false) && stream.eat(isOperatorChar)) {}
        return "operator";
      }
      stream.eatWhile(isIdentifierChar);
      if (namespaceSeparator) while (stream.match(namespaceSeparator)) {
        stream.eatWhile(isIdentifierChar);
      }var cur = stream.current();
      if (contains(keywords, cur)) {
        if (contains(blockKeywords, cur)) curPunc = "newstatement";
        if (contains(defKeywords, cur)) isDefKeyword = true;
        return "keyword";
      }
      if (contains(types, cur)) return "variable-3";
      if (contains(builtin, cur)) {
        if (contains(blockKeywords, cur)) curPunc = "newstatement";
        return "builtin";
      }
      if (contains(atoms, cur)) return "atom";
      return "variable";
    }

    function tokenString(quote) {
      return function (stream, state) {
        var escaped = false,
            next,
            end = false;
        while ((next = stream.next()) != null) {
          if (next == quote && !escaped) {
            end = true;break;
          }
          escaped = !escaped && next == "\\";
        }
        if (end || !(escaped || multiLineStrings)) state.tokenize = null;
        return "string";
      };
    }

    function tokenComment(stream, state) {
      var maybeEnd = false,
          ch;
      while (ch = stream.next()) {
        if (ch == "/" && maybeEnd) {
          state.tokenize = null;
          break;
        }
        maybeEnd = ch == "*";
      }
      return "comment";
    }

    function maybeEOL(stream, state) {
      if (parserConfig.typeFirstDefinitions && stream.eol() && isTopScope(state.context)) state.typeAtEndOfLine = typeBefore(stream, state, stream.pos);
    }

    // Interface

    return {
      startState: function startState(basecolumn) {
        return {
          tokenize: null,
          context: new Context((basecolumn || 0) - indentUnit, 0, "top", null, false),
          indented: 0,
          startOfLine: true,
          prevToken: null
        };
      },

      token: function token(stream, state) {
        var ctx = state.context;
        if (stream.sol()) {
          if (ctx.align == null) ctx.align = false;
          state.indented = stream.indentation();
          state.startOfLine = true;
        }
        if (stream.eatSpace()) {
          maybeEOL(stream, state);return null;
        }
        curPunc = isDefKeyword = null;
        var style = (state.tokenize || tokenBase)(stream, state);
        if (style == "comment" || style == "meta") return style;
        if (ctx.align == null) ctx.align = true;

        if (curPunc == ";" || curPunc == ":" || curPunc == "," && stream.match(/^\s*(?:\/\/.*)?$/, false)) while (state.context.type == "statement") {
          popContext(state);
        } else if (curPunc == "{") pushContext(state, stream.column(), "}");else if (curPunc == "[") pushContext(state, stream.column(), "]");else if (curPunc == "(") pushContext(state, stream.column(), ")");else if (curPunc == "}") {
          while (ctx.type == "statement") {
            ctx = popContext(state);
          }if (ctx.type == "}") ctx = popContext(state);
          while (ctx.type == "statement") {
            ctx = popContext(state);
          }
        } else if (curPunc == ctx.type) popContext(state);else if (indentStatements && ((ctx.type == "}" || ctx.type == "top") && curPunc != ";" || ctx.type == "statement" && curPunc == "newstatement")) {
          pushContext(state, stream.column(), "statement", stream.current());
        }

        if (style == "variable" && (state.prevToken == "def" || parserConfig.typeFirstDefinitions && typeBefore(stream, state, stream.start) && isTopScope(state.context) && stream.match(/^\s*\(/, false))) style = "def";

        if (hooks.token) {
          var result = hooks.token(stream, state, style);
          if (result !== undefined) style = result;
        }

        if (style == "def" && parserConfig.styleDefs === false) style = "variable";

        state.startOfLine = false;
        state.prevToken = isDefKeyword ? "def" : style || curPunc;
        maybeEOL(stream, state);
        return style;
      },

      indent: function indent(state, textAfter) {
        if (state.tokenize != tokenBase && state.tokenize != null || state.typeAtEndOfLine) return CodeMirror.Pass;
        var ctx = state.context,
            firstChar = textAfter && textAfter.charAt(0);
        if (ctx.type == "statement" && firstChar == "}") ctx = ctx.prev;
        if (parserConfig.dontIndentStatements) while (ctx.type == "statement" && parserConfig.dontIndentStatements.test(ctx.info)) {
          ctx = ctx.prev;
        }if (hooks.indent) {
          var hook = hooks.indent(state, ctx, textAfter);
          if (typeof hook == "number") return hook;
        }
        var closing = firstChar == ctx.type;
        var switchBlock = ctx.prev && ctx.prev.info == "switch";
        if (parserConfig.allmanIndentation && /[{(]/.test(firstChar)) {
          while (ctx.type != "top" && ctx.type != "}") {
            ctx = ctx.prev;
          }return ctx.indented;
        }
        if (ctx.type == "statement") return ctx.indented + (firstChar == "{" ? 0 : statementIndentUnit);
        if (ctx.align && (!dontAlignCalls || ctx.type != ")")) return ctx.column + (closing ? 0 : 1);
        if (ctx.type == ")" && !closing) return ctx.indented + statementIndentUnit;

        return ctx.indented + (closing ? 0 : indentUnit) + (!closing && switchBlock && !/^(?:case|default)\b/.test(textAfter) ? indentUnit : 0);
      },

      electricInput: indentSwitch ? /^\s*(?:case .*?:|default:|\{\}?|\})$/ : /^\s*[{}]$/,
      blockCommentStart: "/*",
      blockCommentEnd: "*/",
      lineComment: "//",
      fold: "brace"
    };
  });

  function words(str) {
    var obj = {},
        words = str.split(" ");
    for (var i = 0; i < words.length; ++i) {
      obj[words[i]] = true;
    }return obj;
  }
  function contains(words, word) {
    if (typeof words === "function") {
      return words(word);
    } else {
      return words.propertyIsEnumerable(word);
    }
  }

  function def(mimes, mode) {
    if (typeof mimes == "string") mimes = [mimes];
    var words = [];
    function add(obj) {
      if (obj) for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) words.push(prop);
      }
    }
    add(mode.keywords);
    add(mode.types);
    add(mode.builtin);
    add(mode.atoms);
    if (words.length) {
      mode.helperType = mimes[0];
      CodeMirror.registerHelper("hintWords", mimes[0], words);
    }

    for (var i = 0; i < mimes.length; ++i) {
      CodeMirror.defineMIME(mimes[i], mode);
    }
  }
  def("text/x-apex", {
    name: "apex",
    keywords: words( // From Java
    "abstract assert break catch class const continue default " + "do else enum extends final finally float for if implements " + "instanceof interface new package private protected public " + "return static super this throw try while " +
    // Apex only
    "global continue decimal default future tolabel webservice " + "virtual with sharing test " +
    // SOQL
    "and AND as AS asc ASC bulk BULK by BY commit COMMIT delete " + "DELETE from FROM insert INSERT last_90_days last_month " + "last_n_days last_week LAST_90_DAYS LAST_MONTH LAST_N_DAYS " + "LAST_WEEK like LIKE limit LIMIT merge MERGE not NOT on ON " + "or OR rollback ROLLBACK select SELECT set SET sort SORT " + "this_week THIS_WEEK today TODAY tomorrow TOMORROW undelete " + "UNDELETE update UPDATE upsert UPSERT where WHERE yesterday " + "YESTERDAY using USING convertcurrency CONVERTCURRENCY after " + "AFTER before BEFORE count COUNT excludes EXCLUDES first FIRST " + "includes INCLUDES last LAST order ORDER"),
    types: words("byte short int long float double boolean void Boolean Byte " + "Character Double Float Integer Long Number Object Short String " + "Void blob Blob RestContext System system"),
    blockKeywords: words("catch class do else finally for if try while"),
    defKeywords: words("class interface package enum"),
    typeFirstDefinitions: true,
    atoms: words("true false null nulls TRUE FALSE NULL NULLS"),
    hooks: {
      "@": function _(stream) {
        stream.eatWhile(/[\w\$_]/);
        return "meta";
      }
    },
    modeProps: { fold: ["brace"] }
  });
});
