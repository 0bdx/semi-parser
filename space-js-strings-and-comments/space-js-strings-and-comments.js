export default function spaceJsStringsAndComments(source) {
    const src = source.split('');
    const len = src.length;
    let i = -1;

    processProgram();

    function processProgram() {
        while (++i < len) {
            switch (src[i]) {
                case '`': processBackTick(); break;
                case '{': processBlock(); break;
                case '"': processDoubleQuote(); break;
                case "'": processSingleQuote(); break;
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
                case '\\': src[i] = ' '; src[++i] = ' '; break; // even if the next character is ` or {
                case '`': return;
                case '$':
                    if (src[i+1] === '{') {
                        i++; processBlock()
                    } else { src[i] = ' ' }
                    break;
                default: src[i] = ' ';
            }
        }
    }

    function processBlock() { // needed so we don't get lost in template strings
        while (++i < len) {
            switch (src[i]) {
                case '`': processBackTick(); break;
                case '{': processBlock(); break;
                case '}': return;
                case '"': processDoubleQuote(); break;
                case "'": processSingleQuote(); break;
            }
        }
    }

    function processDoubleQuote() {
        while (++i < len) {
            switch (src[i]) {
                case '\\': src[i] = ' '; src[++i] = ' '; break; // even if the next character is "
                case '"': return;
                default: src[i] = ' ';
            }
        }
    }

    function processSingleQuote() {
        while (++i < len) {
            switch (src[i]) {
                case '\\': src[i] = ' '; src[++i] = ' '; break; // even if the next character is '
                case "'": return;
                default: src[i] = ' ';
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
