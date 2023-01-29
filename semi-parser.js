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
 * ### Repairs `import` and `export` paths in JavaScript code, for web browsers.
 * 
 * @TODO discuss, and show examples
 * 
 * @param {string} source
 *     The JavaScript source code with `import` paths that browsers can't use
 * @param {Object} [repairMap={}]
 *     A plain object which maps invalid paths to valid paths (default is `{}`)
 * @return {string}
 *     JavaScript source code with browser-friendly `import` paths
 */
function repairJsImports(source, repairMap = {}) {

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
    const repairedParts = [];
    const redactedParts = redacted.split('port');
    for (let i=0, r=0, pl=redactedParts.length; r<pl; r++) {
        const start = i;
        i += redactedParts[r].length;
        repairedParts.push(source.slice(start, i));
        i += 4; // 'port'.length is 4
    }

    // console.log(redactedParts);
    // console.log(repairedParts);

    // Step through each part of the source code (apart from the first).
    for (let f=1, fl=repairedParts.length; f<fl; f++) {

        // Step backwards two characters, to make sure this "port" ends the
        // keywords "export" or "import".
        const prevThree = redactedParts[f-1].slice(-3);
        const prevTwo = prevThree.slice(-2);
        const isExport = prevTwo === 'ex';
        if (! isExport && prevTwo !== 'im') continue;

        // Step back one more character, to make sure this "export" or "import"
        // does not end a longer string, eg "Trimport".
        if (prevThree.length === 3 && ! /[\s;]/.test(prevThree[0])) continue;

        // Get the redacted and unredacted versions of the current part.
        const redactedPart = redactedParts[f];
        const repairedPart = repairedParts[f];

        // Get the begin and end positions of the path. Each tryMatching...()
        // function will return an object like `{ begin:22, end:44 }` if it
        // can find a match, or false if not.
        const place = isExport ? (
            matchExportBlock(redactedPart) ||
            matchExportWildcard(redactedPart)
        ) : (
            matchImportSideEffect(redactedPart) ||
            matchImportSimpleDefault(redactedPart)
        );
        if (! place) continue;

        // Get the code before and after the path, including the quotes.
        // Get the path - the content of a literal string, eg "foo.js" => foo.js
        const beginning = repairedPart.slice(0, place.begin);
        const ending = repairedPart.slice(place.end);
        const path = repairedPart.slice(place.begin, place.end);

        // Override automatic repairing, if the path appears in `repairMap`.
        const repairMapped = repairMap[path];
        if (repairMapped) {
            repairedParts[f] = `${beginning}${repairMapped}${ending}`;
            continue;
        }

        // If the path already begins '/', './', '../', 'http://' or 'https://',
        // and already has a '.js', '.mjs' or '.json' extension, do nothing.
        const doesBeginOk = beginsOk(path);
        const hasTypicalExt = typicalExt(path);
        if (doesBeginOk && hasTypicalExt) continue;

        // At this point, if the path does not begin '/', './', '../', 'http://'
        // or 'https://', treat it as unrepairable.
        if (! doesBeginOk) throw Error(`repairJsImports(): Unrepairable path ${
            repairedPart.slice(place.begin - 1, place.end + 1)}`);

        // Otherwise, the path needs to be repaired.
        const repairedPath = path.slice(-1) === '/' // ends in a forward-slash
            ? `${path}index.js`
            : /*fs.existsSync(resolve(dir, `.${dirname(url)}`, path))
                ? `${path}/index.js`
                :*/ `${path}.js`;

        // Insert the repaired path into this part of the source code.
        repairedParts[f] = `${beginning}${repairedPath}${ending}`;
    }

    // Return the reassembled source code.
    return repairedParts.join('port');
}


/* ---------------------------- Private Functions --------------------------- */

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

// Returns the position after the opening quote, and the position before the
// closing quote, if passed a `redacatedPart` containing a 'Block' export.
// Returns false if `redacatedPart` does not contain a 'Block' export.
//
// So, if `source` is 'export { x as v } from "mod";' the `redactedPart`
// will be ' {        } from "---";' and this function will return:
//     { begin:18, end:21 }
//
// See https://tinyurl.com/mrytr49k for more on re-exporting/aggregating.
function matchExportBlock(redactedPart) {
    const m = redactedPart.match(
        new RegExp(
            '^('       + // start the main capturing group m[1]
              '\\s*'   + // match zero or more spaces at the start
              '{'      + // match a literal opening curly bracket character
              '\\s+'   + // match one or more spaces between the curly brackets
              '}'      + // match a literal closing curly bracket character
              '\\s*'   + // match zero or more spaces after `}`
              'from'   + // match the keyword `from`
              '\\s*'   + // match zero or more spaces after `from`
            ')'        + // end the main capturing group
            `(['"])`   + // match the opening quote character m[2]
            '(-*)'     + // match zero or more hyphens m[3]
            `(['"])`     // match the closing quote character m[4]
        )
    );
    if (! m) return false; // not a 'Block' export, if the match fails
    const begin = m[1].length + 1; // (spc, {, spc, }, spc, from, spc) + quote
    const end = begin + m[3].length; // add the string content length
    return { begin, end };
}

// Returns the position after the opening quote, and the position before the
// closing quote, if passed a `redacatedPart` containing a 'Wildcard' export.
// Returns false if `redacatedPart` does not contain a 'Wildcard' export.
//
// So, if `source` is 'export * from "module-name";' the `redactedPart`
// will be ' * from "-----------";' and this function will return:
//     { begin:9, end:20 }
//
// And if `source` is 'export * as ns from "module-name";' the `redactedPart`
// will be ' * as ns from "-----------";' and this function will return:
//     { begin:15, end:26 }
//
// See https://tinyurl.com/mrytr49k for more on re-exporting/aggregating.
function matchExportWildcard(redactedPart) {
    const m = redactedPart.match(
        new RegExp(
            '^('       + // start the main capturing group m[1]
              '\\s*'   + // match zero or more spaces at the start
              '\\*'    + // match a literal asterisk character
              '\\s*'   + // match zero or more spaces after the asterisk
              '(?:'    + // start the optional "as foo" non capturing group
                'as'   + // match the keyword `as`
                '\\s+' + // match one or more spaces after `as`
                '[_$A-Za-z][_$A-Za-z0-9]*' + // match the identifier
                '\\s+' + // match one or more spaces after the identifier
              ')?'     + // end the optional "as foo" capturing group
              'from'   + // match the keyword `from`
              '\\s*'   + // match zero or more spaces after `from`
            ')'        + // end the main capturing group
            `(['"])`   + // match the opening quote character m[2]
            '(-*)'     + // match zero or more hyphens m[3]
            `(['"])`     // match the closing quote character m[4]
        )
    );
    if (! m) return false; // not a 'Wildcard' export, if the match fails
    const begin = m[1].length + 1;
    const end = begin + m[3].length; // add the string content length
    return { begin, end };
}

// Returns the position after the opening quote, and the position before the
// closing quote, if passed a `redacatedPart` containing a 'Side Effect' import.
// Returns false if `redacatedPart` does not contain a 'Side Effect' import.
//
// So, if `source` is '    import "/modules/my-module.js";' the `redactedPart`
// will be ' "---------------------";' and this function will return:
//     { begin:2, end:23 }
//
// See https://tinyurl.com/bdeu8ty9 for more on 'Side Effect' imports.
function matchImportSideEffect(redactedPart) {
    const m = redactedPart.match(
        new RegExp(
            '^(\\s*)' + // start by matching zero or more spaces
            `(['"])`  + // match the opening quote character
            '(-*)'    + // match zero or more hyphens, substituted by redactJs()
            `(['"])`    // match the closing quote character
        )
    );
    if (! m) return false; // not a 'Side Effect' import, if the match fails
    const begin = m[1].length + 1; // space length, `+ 1` for the opening quote
    const end = begin + m[3].length; // add the string content length
    return { begin, end };
}

// Like tryMatchingSideEffect(), but for a simple 'Default' import.
// Returns false if `redacatedPart` does not contain a 'Default' import.
//
// So, if `source` is 'import myDefault from "my-module/";' the `redactedPart`
// will be ' myDefault from "----------";' and this function will return:
//     { begin:17, end:27 }
//
// See https://tinyurl.com/33ptaacr for more on 'Default' imports.
function matchImportSimpleDefault(redactedPart) {
    const m = redactedPart.match(
        new RegExp(
            '^('     + // start the main capturing group
              '\\s*' + // match zero or more spaces at the start
              '[_$A-Za-z][_$A-Za-z0-9]*' + // match the identifier
              '\\s+' + // match one or more spaces after the identifier
              'from' + // match the keyword `from`
              '\\s*' + // match zero or more spaces after `from`
            ')'      + // end the main capturing group
            `(['"])` + // match the opening quote character
            '(-*)'   + // match zero or more hyphens, substituted by redactJs()
            `(['"])`   // match the closing quote character
        )
    );
    if (! m) return false; // not a 'Default' import, if the match fails
    const begin = m[1].length + 1; // (spc, identifier, spc, from, spc) + quote
    const end = begin + m[3].length; // add the string content length
    return { begin, end };
}

export { redactJs, repairJsImports };
