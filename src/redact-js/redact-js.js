export default function redactJs(
    source,
    options = {},
) {
    // Set defaults for any missing options.
    setDefault('fillComment', ' ');
    setDefault('fillString', '-');
    function setDefault(n, d) { // name, default
        options[n] = typeof options[n] !== 'undefined' ? options[n] : d;
    }

    // Destructure the options.
    const { fillComment, fillString } = options;

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
                        src[i] = fillComment;
                        src[++i] = fillComment;
                        processBlockComment();
                        break;
                    } else if (src[i+1] === '/') {
                        src[i] = fillComment;
                        src[++i] = fillComment;
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
                    src[i] = fillString;
                    src[++i] = fillString;
                    break;
                case '`':
                    return;
                case '$':
                    if (src[i+1] === '{') {
                        i++; processBlock()
                    } else { src[i] = fillString }
                    break;
                default:
                    src[i] = fillString;
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

    function processSingleQuote() {
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

    function processBlockComment() {
        while (++i < len) {
            const isAsterisk = src[i] === '*';
            src[i] = fillComment;
            if (isAsterisk && src[i+1] === '/') {
                src[++i] = fillComment;
                return;
            }
        }
    }

    function processLineComment() {
        while (++i < len) {
            if (src[i] === '\n') return;
            src[i] = fillComment;
        }
    }

    return src.join('');
}
