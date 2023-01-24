import redactJs from './redact-js.js';
import { equal } from 'assert';

// In this JavaScript source code, we'd like to replace the identifier
// `foo` with `ok`, without changing the comment, or the string 'foo',
const source = `let foo = 'foo'; console.log(foo); // displays "foo"`;
console.log(`source:\n    ${source}`);

// Define a simple regular expression which finds "foo" multiple times.
// The `g` flag makes exec() search repeatedly - tinyurl.com/mr2puud2
const rx = /foo/g;

// "foo" appears four times in `source`, ending at 7, 14, 32 and 51.
const endPositions = [];
while (rx.exec(source)) endPositions.push(rx.lastIndex);
equal(endPositions.join(), '7,14,32,51');

// Fill the string with dashes, and replace the comment with spaces.
const result = redactJs(source); // no 2nd argument, so default options
equal(result, "let foo = '---'; console.log(foo);                  ");

// "foo" only appears twice in `result`, ending at positions 7 and 32.
// Fill an array with the parts of `source` which do not contain "foo".
let parts = [], from = 0;
while (rx.exec(result)) {
    const endPos = rx.lastIndex;
    parts.push(source.slice(from, endPos - 3)); // 'foo' length is 3
    from = endPos;
}
parts.push(source.slice(from)); // the part after the final "foo"

// Join the parts into a string, with 'ok' placed between each part.
const replaced = parts.join('ok');
equal(replaced, `let ok = 'foo'; console.log(ok); // displays "foo"`);
console.log(`replaced:\n    ${replaced}`);
