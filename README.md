# semi-parser

__A collection of tools for roughly (but quickly) parsing CSS, HTML and JavaScript.__

∅&nbsp; __Version:__ 0.0.6  
∅&nbsp; __NPM:__ <https://www.npmjs.com/package/@0bdx/semi-parser>  
∅&nbsp; __Repo:__ <https://github.com/0bdx/semi-parser>  
∅&nbsp; __Homepage:__ <https://0bdx.com/semi-parser>

@TODO add an overview

---

## __Installation__

`npm i @0bdx/semi-parser`

Require an [LTS](https://github.com/nodejs/Release) Node version (v14.0.0+).

## __Usage__

@TODO add the `redactJs()` description

```js
import { equal } from 'assert';
import { redactJs } from '@0bdx/semi-parser';

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

```

You can find the __`redactJs()`__ example in the
__src/redact-js/__ directory, and run it using:  
`npm run example-1`

---

## __Contributing__

### __Set up your development machine__

1.  Check your __Git__ version:  
    `git --version # should be 'git version 2.20.1' or greater`
2.  Check your __Node__ version:  
    `node --version # should be 'v14.0.0' or greater`
3.  Check your global __TypeScript__ version:  
    `tsc --version # should be 'Version 4.9.4' or greater`  
    There are no actual __.ts__ files in this project, but TypeScript can infer
    types from the JavaScript code and JSDoc comments.
    - VS Code uses `tsserver` to highlight errors in __src/__ JavaScript files
    - `tsc` is needed to generate the __semi-parser.d.ts__ type declaration

### __Set up VS Code__

1.  Check your __VS Code__ version:  
    `code --version # should be '1.74.3' or greater`
2.  Install and enable the [`jeremyljackson.vs-docblock`
    ](https://marketplace.visualstudio.com/items?itemName=jeremyljackson.vs-docblock)
    extension.
3.  Install and enable the [`dnamsons.kimbie-dark-plus`
    ](https://marketplace.visualstudio.com/items?itemName=dnamsons.kimbie-dark-plus)
    theme.  

### __Set up the repo locally__

Clone the repository, and `cd` into it.  
`git clone git@github.com:0bdx/semi-parser.git && cd semi-parser`  

Install Rollup, the only dependency.  
`npm i`  
Rollup 3.10.1 adds 2 packages, 2.5 MB, 29 items.

Open `semi-parser` in VS Code.  
`code .`  

### __Handy dev commands__

Run all tests on the in-development source code:  
`npm test`

Run each example, one by one:  
`npm run example:1`  
`npm run example:2`  

Or run all the examples:  
`npm run examples`

Build __semi-parser.js__ and __semi-parser.d.ts__:  
`npm run build:production`  
`npm run build:typings`

Run all tests on the built __semi-parser.js__ file:  
`npm run preflight:test`

Check that __semi-parser.js__ uses all types correctly:  
`npm run preflight:types`  

Or run all the build and preflight steps in one line, eg before committing:  
`npm run build && npm run preflight`

Display what will be published:  
`npm publish --dry-run`

Publish to [npmjs.com/package/@0bdx/semi-parser](
https://www.npmjs.com/package/@0bdx/semi-parser):  
`npm publish`
