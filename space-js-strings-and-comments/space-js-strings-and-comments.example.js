import spaceJsStringsAndComments from './space-js-strings-and-comments.js';

// Get some JavaScript source code. We would like to replace the identifier
// `foo` with `ok`, without changing the block comment, or the string "foo",
const source = '/* Set foo to be "foo": */ let foo = "foo"; console.log(foo);';

// Define a simple regular expression, which can find "foo" multiple times.
// The `g` flag means exec() will keep searching forwards - tinyurl.com/mr2puud2
const rx = /foo/g;

// "foo" appears five times in `source`, ending at index positions:
// 10, 21, 34, 41 and 59.
while (rx.exec(source)) console.log(rx.lastIndex);

// Use spaceJsStringsAndComments() to replace all comments and string-literals with spaces.
// It becomes: '                           let foo = "   "; console.log(foo);'.
const result = spaceJsStringsAndComments(source);

// "foo" only appears twice in `result`, ending at index positions 34 and 59.
// Fill an array with the parts of `source` which do not contain "foo".
const parts = [];
let from = 0;
while (rx.exec(result)) {
    const endPos = rx.lastIndex;
    parts.push(source.slice(from, endPos - 3)); // 'foo' is 3 characters long
    from = endPos;
}
parts.push(source.slice(from)); // the part after the final "foo"

// Join the parts into a string, with 'ok' placed between each part.
// `replaced` is: '/* Set foo to be "foo": */ let ok = "foo"; console.log(ok);'
const replaced = parts.join('ok');
console.log(replaced);
