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

    // Use redactJs() to hide all comments and string content. By default,
    // redactJs() replaces comments with spaces, and string content with dashes.
    // This will prevent `split('import')` from being fooled by the characters
    // "import" appearing in a comment or a string.
    const redacted = redactJs(source);

    // Split the source code into parts, where the delimiter is the keyword
    // `import`. Each part (except for the first) will be a string which begins
    // with code immediately following an `import` keyword.
    const fixedParts = [];
    const redactedParts = redacted.split('import');
    for (let i=0, p=0, pl=redactedParts.length; p<pl; p++) {
        const start = i;
        i += redactedParts[p].length;
        fixedParts.push(source.slice(start, i));
        i += 6; // 'import'.length is 6
    }

    // console.log(redactedParts);
    // console.log(fixedParts);

    // Step through each part of the source code (apart from the first).
    for (let f=1, fl=fixedParts.length; f<fl; f++) {
        const fixedPart = fixedParts[f];
        const redactedPart = redactedParts[f];

        // Find a 'Side Effects' import - https://tinyurl.com/bdeu8ty9 - eg:
        //     import "/modules/my-module.js";
        const matchSE = redactedPart.match(
            new RegExp(
                '^(\\s*)' + // start by matching zero or more spaces
                `(['"])`  + // match the opening quote character
                '(.+)'    + // match at least one hyphen (from redactJs())
                `(['"])`    // match the closing quote character
            )
        );
        if (! matchSE) continue;
        const [ _, spc, q1, redactedPath, q2] = matchSE;

        // Get the path - the content of a literal string in `source`.
        const pathStart = spc.length + 1;
        const pathEnd = pathStart + redactedPath.length;
        const path = fixedPart.slice(pathStart, pathEnd);

        // If the path already has a '.js' extension, do nothing.
        // @TODO check that it begins './', '../' or 'http...'
        if (path.slice(-3) === '.js') continue;

        // Otherwise, the path does need to be fixed.
        const fix = path.slice(0, 2) !== './' && path.slice(0, 3) !== '../'
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
    return fixedParts.join('import');
}
