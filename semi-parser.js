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
    const src = source.split('');
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

/**
 * ### Fixes `import` paths in JavaScript source code, for web browsers.
 * 
 * @TODO discuss, and show examples
 * 
 * @param {string} source
 *     The JavaScript source code with `import` paths that browsers can't use
 * @param {Object} [pathMap={}]
 *     A plain object which maps invalid paths to valid paths (default is `{}`)
 * @return {string}
 *     JavaScript source code with browser-friendly `import` paths
 */
function fixJsImports(source, pathMap = {}) {

    // Use redactJs() to hide comments, string content and code inside blocks.
    // By default, redactJs() replaces all comments with spaces, and all string
    // content with dashes. The fillBlock:' ' option means that redactJs() will
    // replace code inside curly braces with spaces, so { a:1 } becomes {     }.
    // This will prevent `split('import')` from being fooled by the characters
    // "import" appearing in a comment, a string or a block.
    // @TODO allow dynamic import() which can appear inside blocks
    const redacted = redactJs(source, { fillBlock:' ' });

    // Split the source code into parts, where the delimiter is the 4 characters
    // "port". Each part (except for the first) will be a string which begins
    // with code immediately following "port".
    const fixedParts = [];
    const redactedParts = redacted.split('port');
    for (let i=0, r=0, pl=redactedParts.length; r<pl; r++) {
        const start = i;
        i += redactedParts[r].length;
        fixedParts.push(source.slice(start, i));
        i += 4; // 'port'.length is 4
    }

    // console.log(redactedParts);
    // console.log(fixedParts);

    // Step through each part of the source code (apart from the first).
    for (let f=1, fl=fixedParts.length; f<fl; f++) {

        // Step backwards two characters, to make sure this "port" ends the
        // keywords "export" or "import".
        const prevThree = fixedParts[f-1].slice(-3);
        const prevTwo = prevThree.slice(-2);
        const isImport = prevTwo === 'im';
        if (! isImport && prevTwo !== 'ex') continue;

        // Step back one more character, to make sure this "import" or "export"
        // does not end a longer string, eg "Trimport".
        // Note that `substr(-3, 1)` is deprecated.
        if (prevThree.length === 3 && ! /[\s;]/.test(prevThree[0])) continue;

        // Xx.
        const fixedPart = fixedParts[f];
        const redactedPart = redactedParts[f];

        // Find a 'Side Effect' import - https://tinyurl.com/bdeu8ty9 - eg:
        //     import "/modules/my-module.js";
        const matchSE = redactedPart.match(
            new RegExp(
                '^(\\s*)' + // start by matching zero or more spaces
                `(['"])`  + // match the opening quote character
                '(-*)'    + // match zero or more hyphens (from redactJs())
                `(['"])`    // match the closing quote character
            )
        );
        if (! matchSE) continue;
        const [ _, spc, q1, redactedPath, q2] = matchSE;

        // Get the path - the content of a literal string in `source`.
        const pathStart = spc.length + 1;
        const pathEnd = pathStart + redactedPath.length;
        const path = fixedPart.slice(pathStart, pathEnd);

        // If the path already begins '/', './', '../', 'http://' or 'https://',
        // and already has a '.js', '.mjs' or '.json' extension, do nothing.
        const doesBeginOk = beginsOk(path);
        const hasTypicalExt = typicalExt(path);
        if (doesBeginOk && hasTypicalExt) continue;

        // Otherwise, the path needs to be fixed.
        const fix = ! doesBeginOk
            ? pathMap[path]
            : path.slice(-1) === '/' // ends in a forward-slash
                ? `${path}index.js`
                : /*fs.existsSync(resolve(dir, `.${dirname(url)}`, path))
                    ? `${path}/index.js`
                    :*/ `${path}.js`;

        if (! fix) // pathMap[path] is undefined
            throw Error(`fixJsImports(): ${q1}${path}${q2} is not in pathMap`);

        // Insert the fixed path into this part of the source code.
        fixedParts[f] = `${spc}${q1}${fix}${fixedPart.slice(pathEnd)}`;
    }

    // Return the reassembled source code.
    return fixedParts.join('port');


    /* ---------------------------- Sub-functions --------------------------- */

    // Tests whether the start of a path appears to be valid for web browsers.
    // Based on part of the list here: https://stackoverflow.com/a/69037678
    function beginsOk(path) {
        const p0 = path[0];
        if (p0 === '/') return true; // eg '/foo.js' or '//example.com/foo.js'
        if (p0 === '.') {
            const p1 = path[1];
            if (p1 === '/') return true; // './foo.js'
            if (p1 === '.' && path[2] === '/') return true; // '../foo.js'
        } else if (p0 === 'h') {
            const p0_7 = path.slice(0, 7);
            if (p0_7 === 'http://') return true; // 'http://example.com/foo.js'
            if (p0_7 === 'https:/' && path[7] === '/') return true; // https://
        }
        return false;
    }

    // Tests whether a path has a typical JavaScript or JSON extension.
    function typicalExt(path) {
        return path.slice(-3) === '.js'
            || path.slice(-4) === '.mjs'
            || path.slice(-5) === '.json';
    }

}

export { fixJsImports, redactJs };
