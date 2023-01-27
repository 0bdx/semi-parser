/**
 * https://www.npmjs.com/package/@0bdx/semi-parser
 * @version 0.0.5
 * @license Copyright (c) 2023 0bdx <hi@0bdx.com> (https://0bdx.com)
 * SPDX-License-Identifier: MIT
 */
/**
 * ### Redacts comments and literal strings, in JavaScript code.
 * 
 * By default, spaces replace comments, and hyphens replace string content:
 * 
 *     // For example...
 *     redactJs(`let a = "Apple"; /* Comment goes here *∕ let b = 'Banana'`)
 *     // ...will return...
 *              `let a = "-----";                         let b = '------'`
 * 
 * The `options` argument provides more flexibility:
 * 
 *     redactJs('let c = "Caper";', {fillApex:'_'})    == '________"-----"_'
 *     redactJs('let d = "Durian";',{fillApex:''})     == '"------"'
 *     redactJs('e({ f:"Fig" })',   {fillBlock:'*'})   == 'e({***"---"*})'
 *     redactJs('g() // Guava',     {fillComment:null})== 'g() // Guava'
 *     redactJs('h() // Hass Avo',  {fillComment:'/'}) == 'h() ///////////'
 *     redactJs('`Iceberg Lettuce`',{fillString:null}) == '`Iceberg Lettuce`'
 *     redactJs('j`Jack ${fruit}`', {fillString:'!'})  == 'j`!!!!!${fruit}`'
 *     redactJs("k('Kale') //Lime", {fillApex:'',fillComment:''}) == "'----'"
 *
 * @typedef {Object} RedactJsOptions
 * @property {string | null} [fillApex=null]
 *     Replaces each top-level character, unless `null` (default is `null`)
 * @property {string | null} [fillBlock=null]
 *     Replaces each character inside `{ ... }`, unless `null` (default is `null`)
 * @property {string | null} [fillComment=' ']
 *     Replaces each comment character, unless `null` (default is `' '`)
 * @property {string | null} [fillString='-']
 *     Replaces each character of string content, unless `null` (default is `'-'`)
 * 
 * @param {string} source
 *     The JavaScript source code to redact
 * @param {RedactJsOptions} [options={}]
 *     A plain object containing configuration (default is `{}`)
 * @return {string}
 *     The redacted code (not necessarily valid JavaScript)
 */
function redactJs(source, options = {}) {

    /* ------------------------------- Options ------------------------------ */

    // Set defaults for any missing options.
    setDefault('fillApex', null);
    setDefault('fillBlock', null);
    setDefault('fillComment', ' ');
    setDefault('fillString', '-');
    function setDefault(n, d) { // name, default
        options[n] = typeof options[n] !== 'undefined' ? options[n] : d;
    }

    // Destructure the options.
    const { fillBlock, fillComment, fillString, fillApex } = options;

    // Choose which functions to use, based on the `options` argument. Running
    // conditionals here avoids running conditionals many times inside loops.
    const apex        = fillApex === null ? passApex : subApex;
    const block       = fillBlock === null ? passBlock : subBlock;
    const lineComment = fillComment === null ? passLineComment : subLineComment;
    const mLComment   = fillComment === null ? passMLComment : subMLComment;
    const backTick    = fillString === null ? passBackTick : subBackTick;
    const doubleQuote = fillString === null ? passDoubleQuote : subDoubleQuote;
    const singleQuote = fillString === null ? passSingleQuote : subSingleQuote;


    /* ------------------------------- Process ------------------------------ */

    // Prepare for looping.
    let src = source.split('');
    const len = src.length;
    let i = -1;

    // Call apex(), which will completely process `source`. After it's
    // completed, convert the array of characters back into a string.
    apex();
    return src.join('');


    /* ---------------------------- Sub-functions --------------------------- */

    // Steps through the top-level of program scope. We are calling this the
    // 'apex'. Passes apex characters through unchanged (default behaviour).
    function passApex() {
        while (++i < len) {
            switch (src[i]) {
                case '`': backTick();
                    break;
                case '{': block();
                    break;
                case '"': doubleQuote();
                    break;
                case "'": singleQuote();
                    break;
                case '/':
                    if (src[i+1] === '*') {
                        mLComment();
                        break;
                    } else if (src[i+1] === '/') {
                        lineComment();
                        break;
                    }
            }
        }
    }

    // Steps through the top-level of program scope. We are calling this the
    // 'apex'. Substitutes apex characters with `options.fillApex`.
    function subApex() {
        while (++i < len) {
            switch (src[i]) {
                case '`': backTick();
                    break;
                case '{': block();
                    break;
                case '"': doubleQuote();
                    break;
                case "'": singleQuote();
                    break;
                case '/':
                    if (src[i+1] === '*') {
                        mLComment();
                        break;
                    } else if (src[i+1] === '/') {
                        lineComment();
                        break;
                    }
                default:
                    src[i] = fillApex;
            }
        }
    }

    // Steps through parts of the program inside curly brakets, below 'apex'.
    // Passes these blocks through unchanged (default behaviour).
    function passBlock() {
        while (++i < len) {
            switch (src[i]) {
                case '`': backTick();
                    break;
                case '{': block();
                    break;
                case '}':
                    return;
                case '"': doubleQuote();
                    break;
                case "'": singleQuote();
                    break;
                case '/':
                    if (src[i+1] === '*') {
                        mLComment();
                        break;
                    } else if (src[i+1] === '/') {
                        lineComment();
                        break;
                    }
            }
        }
    }

    // Steps through parts of the program inside curly brakets, below 'apex'.
    // Substitutes these blocks with `options.fillBlock`.
    function subBlock() {
        while (++i < len) {
            switch (src[i]) {
                case '`': backTick();
                    break;
                case '{': block();
                    break;
                case '}':
                    return;
                case '"': doubleQuote();
                    break;
                case "'": singleQuote();
                    break;
                case '/':
                    if (src[i+1] === '*') {
                        mLComment();
                        break;
                    } else if (src[i+1] === '/') {
                        lineComment();
                        break;
                    }
                default:
                    src[i] = fillBlock;
            }
        }
    }

    // Steps through single-line comments, and passes them through unchanged.
    // For this behaviour, set `options.fillComment` to `null`.
    function passLineComment() {
        ++i;
        while (++i < len) {
            if (src[i] === '\n') return;
        }
    }

    // Steps through single-line comments, and substitutes them with
    // `options.fillComment`, which is set to ' ' (space) by default.
    function subLineComment() {
        src[i] = fillComment;
        src[++i] = fillComment;
        while (++i < len) {
            if (src[i] === '\n') return;
            src[i] = fillComment;
        }
    }

    // Steps through multiline comments, and passes them through unchanged.
    // For this behaviour, set `options.fillComment` to `null`.
    function passMLComment() {
        ++i;
        while (++i < len) {
            if (src[i] === '*' && src[i+1] === '/') {
                return;
            }
        }
    }

    // Steps through multiline comments, and substitutes them with
    // `options.fillComment`, which is set to ' ' (space) by default.
    function subMLComment() {
        src[i] = fillComment;
        src[++i] = fillComment;
        while (++i < len) {
            const isAsterisk = src[i] === '*';
            src[i] = fillComment;
            if (isAsterisk && src[i+1] === '/') {
                src[++i] = fillComment;
                return;
            }
        }
    }

    // Steps through `template strings`, and passes them through unchanged.
    // For this behaviour, set `options.fillString` to `null`.
    function passBackTick() {
        while (++i < len) {
            switch (src[i]) {
                case '\\': // even if the next character is ` or $
                    ++i;
                    break;
                case '`':
                    return;
                case '$':
                    if (src[i+1] === '{') {
                        i++; block();
                    }
                    break;
            }
        }
    }

    // Steps through `template strings`, and substitutes them with
    // `options.fillString`, which is set to '-' (hyphen) by default.
    function subBackTick() {
        while (++i < len) {
            switch (src[i]) {
                case '\\': // even if the next character is ` or $
                    src[i] = fillString;
                    src[++i] = fillString;
                    break;
                case '`':
                    return;
                case '$':
                    if (src[i+1] === '{') {
                        i++; block();
                    } else { src[i] = fillString; }
                    break;
                default:
                    src[i] = fillString;
            }
        }
    }

    // Steps through "double-quoted strings", and passes them through unchanged.
    // For this behaviour, set `options.fillString` to `null`.
    function passDoubleQuote() {
        while (++i < len) {
            switch (src[i]) {
                case '\\': // even if the next character is "
                    ++i;
                    break;
                case '"':
                    return;
            }
        }
    }

    // Steps through "double-quoted strings", and substitutes them with
    // `options.fillString`, which is set to '-' (hyphen) by default.
    function subDoubleQuote() {
        while (++i < len) {
            switch (src[i]) {
                case '\\': // even if the next character is "
                    src[i] = fillString;
                    src[++i] = fillString;
                    break;
                case '"':
                    return;
                default:
                    src[i] = fillString;
            }
        }
    }

    // Steps through 'single-quoted strings', and passes them through unchanged.
    // For this behaviour, set `options.fillString` to `null`.
    function passSingleQuote() {
        while (++i < len) {
            switch (src[i]) {
                case '\\': // even if the next character is '
                    ++i;
                    break;
                case "'":
                    return;
            }
        }
    }

    // Steps through 'single-quoted strings', and substitutes them with
    // `options.fillString`, which is set to '-' (hyphen) by default.
    function subSingleQuote() {
        while (++i < len) {
            switch (src[i]) {
                case '\\': // even if the next character is '
                    src[i] = fillString;
                    src[++i] = fillString;
                    break;
                case "'":
                    return;
                default:
                    src[i] = fillString;
            }
        }
    }
}

export { redactJs };
