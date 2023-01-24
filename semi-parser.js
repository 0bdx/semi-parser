/**
 * @license @0bdx/semi-parser
 * Copyright 2023 0bdx <hi@0bdx.com> (https://0bdx.com)
 * SPDX-License-Identifier: MIT
 */
function redactJs(
    source,
    options = {},
) {
    // Set defaults for any missing options.
    setDefault('stringFill', '-');
    function setDefault(n, d) { // name, default
        options[n] = typeof options[n] !== 'undefined' ? options[n] : d;
    }

    // Destructure the options.
    const { stringFill } = options;

    // Prepare for looping.
    let src = source.split('');
    const len = src.length;
    let i = -1;

    processProgram();

    function processProgram() {
        while (++i < len) {
            switch (src[i]) {
                case '`': processBackTick();
                    break;
                case '{': processBlock();
                    break;
                case '"': processDoubleQuote();
                    break;
                case "'": processSingleQuote();
                    break;
                case '/':
                    if (src[i+1] === '*') {
                        src[i] = ' ';
                        src[++i] = ' ';
                        processBlockComment();
                        break;
                    } else if (src[i+1] === '/') {
                        src[i] = ' ';
                        src[++i] = ' ';
                        processLineComment();
                        break;
                    }
            }
        }
    }

    function processBackTick() {
        while (++i < len) {
            switch (src[i]) {
                case '\\': // even if the next character is ` or $
                    src[i] = stringFill;
                    src[++i] = stringFill;
                    break;
                case '`':
                    return;
                case '$':
                    if (src[i+1] === '{') {
                        i++; processBlock();
                    } else { src[i] = stringFill; }
                    break;
                default:
                    src[i] = stringFill;
            }
        }
    }

    function processBlock() { // needed so we don't get lost in template strings
        while (++i < len) {
            switch (src[i]) {
                case '`': processBackTick();
                    break;
                case '{': processBlock();
                    break;
                case '}':
                    return;
                case '"': processDoubleQuote();
                    break;
                case "'": processSingleQuote();
                    break;
            }
        }
    }

    function processDoubleQuote() {
        while (++i < len) {
            switch (src[i]) {
                case '\\': // even if the next character is "
                    src[i] = stringFill;
                    src[++i] = stringFill;
                    break;
                case '"':
                    return;
                default:
                    src[i] = stringFill;
            }
        }
    }

    function processSingleQuote() {
        while (++i < len) {
            switch (src[i]) {
                case '\\': // even if the next character is '
                    src[i] = stringFill;
                    src[++i] = stringFill;
                    break;
                case "'":
                    return;
                default:
                    src[i] = stringFill;
            }
        }
    }

    function processBlockComment() {
        while (++i < len) {
            const isAsterisk = src[i] === '*';
            src[i] = ' ';
            if (isAsterisk && src[i+1] === '/') {
                src[++i] = ' ';
                return;
            }
        }
    }

    function processLineComment() {
        while (++i < len) {
            if (src[i] === '\n') return;
            src[i] = ' ';
        }
    }

    return src.join('');
}

export { redactJs };
