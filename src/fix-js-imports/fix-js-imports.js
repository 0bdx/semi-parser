import redactJs from '../redact-js/redact-js.js';

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
export default function fixJsImports(source, pathMap = {}) {

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
