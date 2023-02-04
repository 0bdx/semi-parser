import redactJs from '../redact-js/redact-js.js';

/**
 * ### Repairs `export` and `import` paths in JavaScript code, for web browsers.
 * 
 * @TODO discuss, and show examples
 * 
 * @TODO allow dynamic import() which can appear inside blocks
 * 
 * @param {string} source
 *     JavaScript code with `export` and `import` paths that browsers can't use
 * @param {Object} [repairMap={}]
 *     A plain object which maps invalid paths to valid paths (default is `{}`)
 * @return {string}
 *     JavaScript source code with browser-friendly `export` and `import` paths
 */
export default function repairJsImports(source, repairMap = {}) {

    // Use redactJs() to hide comments, string content and code inside blocks.
    // This will prevent `split()` from being fooled by the characters "export"
    // or "import" appearing in a comment, a string or a block.
    // By default, redactJs() replaces all comments with spaces, and all string
    // content with dashes. The fillBlock:' ' option means that redactJs() will
    // replace code inside curly braces with spaces, so { a:1 } becomes {     }.
    const redacted = redactJs(source, { fillBlock:' ' });

    // Split the source code into parts, where the delimiter is the 4 characters
    // "port". Each part (except for the first) will be a string which begins
    // with code immediately following "port".
    const redactedRxSplit = `;${redacted}`.split(/([\s;}])(export|import)/);

    // Short circuit, if `source` contains no "import" or "export" keywords in
    // in the top code level.
    if (redactedRxSplit.length === 1) return source;

    // Assemble the output of the split() above, into a more easily processable
    // array. redactedParts[0] will always be the code before the first "export"
    // or "import". Each item after that begins "export ..." or "import ...".
    const redactedParts = [
        (redactedRxSplit[0] + redactedRxSplit[1]) // code before 1st "ex/import"
            .slice(1)]; // remove the leading ';' added above
    for (let i=2, len=redactedRxSplit.length; i<len; i+=3)
        redactedParts.push(
            redactedRxSplit[i] +
            (redactedRxSplit[i+1]||'') +
            (redactedRxSplit[i+2]||'')
        );

    // Use `redactedParts` as a guide to split `source` into an array of parts,
    // ready to be repaired.
    const repairedParts = [];
    for (let i=0, r=0, pl=redactedParts.length; r<pl; r++) {
        const start = i;
        i += redactedParts[r].length;
        repairedParts.push(source.slice(start, i));
    }

    // Step through each part of the source code (apart from the first).
    for (let f=1, fl=repairedParts.length; f<fl; f++) {

        // Get the redacted code of the current part, after the "export" or
        // "import".
        const redactedPart = redactedParts[f].slice(6);

        // Get the begin and end positions of the path. Each tryMatching...()
        // function will return an object like `{ begin:22, end:44 }` if it
        // can find a match, or false if not.
        const place = redactedParts[f][0] === 'e' ? (
            matchExportOrImportNamed(redactedPart) ||
            matchExportWildcard(redactedPart)
        ) : (
            matchExportOrImportNamed(redactedPart) ||
            matchImportSideEffect(redactedPart) ||
            matchImportSimpleDefault(redactedPart) ||
            matchImportDefaultAndNamed(redactedPart) ||
            matchImportDefaultAndWildcard(redactedPart)
        );
        if (! place) continue;

        // Get the unredacted code of the current part, BEFORE the "export" or
        // "import".
        const repairedPart = repairedParts[f];

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
    return repairedParts.join('');
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

// Returns the position after the opening quote, and position before the closing
// quote, if passed a `redacatedPart` containing a 'Named' export or import.
// Returns false if `redacatedPart` does not contain one.
//
// If `source` is 'export { default as fn1, fn2 } from "/";' the `redactedPart`
// will be ' {                     } from "-";' and this function returns:
//     { begin:31, end:32 }
//
// And if `source` is 'import { x as v, foo } from "./mod";' the `redactedPart`
// will be ' {             } from "-----";' and this function will return:
//     { begin:23, end:28 }
//
// See https://tinyurl.com/mrytr49k for more on re-exporting/aggregating.
// See https://tinyurl.com/2p89u8wr for more on 'Named' imports.
function matchExportOrImportNamed(redactedPart) {
    const m = redactedPart.match(new RegExp(
        '^('            + // start the main capturing group m[1]
            '\\s*'      + // match zero or more spaces at the start
            '{'         + // match a literal opening curly bracket character
            `[-\\s'"]+` + // match one or more spaces, quotes or hyphens in {}
            '}'         + // match a literal closing curly bracket character
            '\\s*'      + // match zero or more spaces after `}`
            'from'      + // match the keyword `from`
            '\\s*'      + // match zero or more spaces after `from`
        ')'             + // end the main capturing group
        `(['"])`        + // match the opening quote character m[2]
        '(-*)'          + // match zero or more hyphens m[3]
        `(['"])`          // match the closing quote character m[4]
    ));
    if (! m) return false; // not a 'Named' export or import, if the match fails
    const begin = m[1].length + 7; // (spc, {, [- '"], }, spc, from, spc) + ['"]
    const end = begin + m[3].length; // add the string content length
    return { begin, end };
}

// Returns the position after the opening quote, and position before the closing
// quote, if passed a `redacatedPart` containing a 'Wildcard' export.
// Returns false if `redacatedPart` contains no 'Wildcard' export.
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
    const m = redactedPart.match(new RegExp(
        '^('         + // start the main capturing group m[1]
            '\\s*'   + // match zero or more spaces at the start
            '\\*'    + // match a literal asterisk character
            '\\s*'   + // match zero or more spaces after the asterisk
            '(?:'    + // start the optional "as foo" non capturing group
            'as'     + // match the keyword `as`
            '\\s+'   + // match one or more spaces after `as`
            '[_$A-Za-z][_$A-Za-z0-9]*' + // match the identifier
            '\\s+'   + // match one or more spaces after the identifier
            ')?'     + // end the optional "as foo" capturing group
            'from'   + // match the keyword `from`
            '\\s*'   + // match zero or more spaces after `from`
        ')'          + // end the main capturing group
        `(['"])`     + // match the opening quote character m[2]
        '(-*)'       + // match zero or more hyphens m[3]
        `(['"])`       // match the closing quote character m[4]
    ));
    if (! m) return false; // not a 'Wildcard' export, if the match fails
    const begin = m[1].length + 7;
    const end = begin + m[3].length; // add the string content length
    return { begin, end };
}

// Returns the position after the opening quote, and position before the closing
// quote, if passed a `redacatedPart` containing a 'Side Effect' import.
// Returns false if `redacatedPart` contains no 'Side Effect' import.
//
// So, if `source` is '    import "/modules/my-module.js";' the `redactedPart`
// will be ' "---------------------";' and this function will return:
//     { begin:2, end:23 }
//
// See https://tinyurl.com/bdeu8ty9 for more on 'Side Effect' imports.
function matchImportSideEffect(redactedPart) {
    const m = redactedPart.match(new RegExp(
        '^(\\s*)' + // start by matching zero or more spaces
        `(['"])`  + // match the opening quote character
        '(-*)'    + // match zero or more hyphens, substituted by redactJs()
        `(['"])`    // match the closing quote character
    ));
    if (! m) return false; // not a 'Side Effect' import, if the match fails
    const begin = m[1].length + 7; // space length, `+ 1` for the opening quote
    const end = begin + m[3].length; // add the string content length
    return { begin, end };
}

// Returns the position after the opening quote, and position before the closing
// quote, if passed a `redacatedPart` containing a simple 'Default' import.
// Returns false if `redacatedPart` contains no simple 'Default' import.
//
// So, if `source` is 'import myDefault from "my-module/";' the `redactedPart`
// will be ' myDefault from "----------";' and this function will return:
//     { begin:17, end:27 }
//
// See https://tinyurl.com/33ptaacr for more on 'Default' import.
function matchImportSimpleDefault(redactedPart) {
    const m = redactedPart.match(new RegExp(
        '^('       + // start the main capturing group
            '\\s*' + // match zero or more spaces at the start
            '[_$A-Za-z][_$A-Za-z0-9]*' + // match the identifier
            '\\s+' + // match one or more spaces after the identifier
            'from' + // match the keyword `from`
            '\\s*' + // match zero or more spaces after `from`
        ')'        + // end the main capturing group
        `(['"])`   + // match the opening quote character
        '(-*)'     + // match zero or more hyphens, substituted by redactJs()
        `(['"])`     // match the closing quote character
    ));
    if (! m) return false; // not a simple 'Default' import, if the match fails
    const begin = m[1].length + 7; // (spc, identifier, spc, from, spc) + quote
    const end = begin + m[3].length; // add the string content length
    return { begin, end };
}

// Returns the position after the opening quote, and position before the closing
// quote, if passed a `redacatedPart` containing a 'Default + Named' import.
// Returns false if `redacatedPart` contains no 'Default + Named' import.
//
// If `source` is 'import defaultFn, { fn1, fn2 } from "fns"' the `redactedPart`
// will be ' defaultFn, {          } from "---"' and this function will return:
//     { begin:31, end:34 }
//
// See https://tinyurl.com/33ptaacr for more on 'Default' import.
function matchImportDefaultAndNamed(redactedPart) {
    const m = redactedPart.match(new RegExp(
        '^('       + // start the main capturing group
            '\\s*' + // match zero or more spaces at the start
            '[_$A-Za-z][_$A-Za-z0-9]*' + // match the default identifier
            '\\s*' + // match zero or more spaces after the default identifier
            ','    + // match the comma
            '\\s*' + // match zero or more spaces after the comma
            '{'         + // match a literal opening curly bracket character
            `[-\\s'"]+` + // match one or more spaces, quotes or hyphens in {}
            '}'         + // match a literal closing curly bracket character
            '\\s*' + // match zero or more spaces after the 'Named' block
            'from' + // match the keyword `from`
            '\\s*' + // match zero or more spaces after `from`
        ')'        + // end the main capturing group
        `(['"])`   + // match the opening quote character
        '(-*)'     + // match zero or more hyphens, substituted by redactJs()
        `(['"])`     // match the closing quote character
    ));
    if (! m) return false; // not a 'Default + Named' import, if the match fails
    const begin = m[1].length + 7;
    const end = begin + m[3].length; // add the string content length
    return { begin, end };
}

// Returns the position after the opening quote, and position before the closing
// quote, if passed a `redacatedPart` containing a 'Default + Wildcard' import.
// Returns false if `redacatedPart` contains no 'Default + Wildcard' import.
//
// And if `source` is 'import myDefault, * as z from "/z/";' the `redactedPart`
// will be ' myDefault, * as z from "---";' and this function will return:
//     { begin:25, end:28 }
//
// See https://tinyurl.com/33ptaacr for more on 'Default' import.
function matchImportDefaultAndWildcard(redactedPart) {
    const m = redactedPart.match(new RegExp(
        '^('       + // start the main capturing group
            '\\s+' + // match one or more spaces at the start
            '[_$A-Za-z][_$A-Za-z0-9]*' + // match the default identifier
            '\\s*' + // match zero or more spaces after the default identifier
            ','    + // match the comma
            '\\s*' + // match zero or more spaces after the comma
            '\\*'  + // match the asterisk
            '\\s*' + // match zero or more spaces after the asterisk
            'as'   + // match the `as` keyword
            '\\s+' + // match one or more spaces after the `as` keyword
            '[_$A-Za-z][_$A-Za-z0-9]*' + // match the wildcard identifier
            '\\s+' + // match one or more spaces after the wildcard identifier
            'from' + // match the keyword `from`
            '\\s*' + // match zero or more spaces after `from`
        ')'        + // end the main capturing group
        `(['"])`   + // match the opening quote character
        '(-*)'     + // match zero or more hyphens, substituted by redactJs()
        `(['"])`     // match the closing quote character
    ));
    if (! m) return false; // not a 'Default + Wildcard' import, if match fails
    const begin = m[1].length + 7;
    const end = begin + m[3].length; // add the string content length
    return { begin, end };
}
