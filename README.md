# semi-parser

__A collection of tools for roughly (but quickly) parsing CSS, HTML and JavaScript.__

▶&nbsp; __Version:__ 0.0.2  
▶&nbsp; __NPM:__ <https://www.npmjs.com/package/@0bdx/semi-parser>  
▶&nbsp; __Repo:__ <https://gitlab.com/0bdx/semi-parser>  
▶&nbsp; __Homepage:__ <https://0bdx.com/semi-parser>

@TODO add an overview

---

## __Installation__

`npm i @0bdx/semi-parser`

Require an [LTS](https://github.com/nodejs/Release) Node version (v14.0.0+).

## __Usage__

@TODO add the `redactJs()` description

```js
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

```

You can find the __`redactJs()`__ example in the
__src/redact-js/__ directory, and run it using:  
`npm run example-1`

---

## __Contributing__

### __Set up your dev environment__

1.  Check your __git__ version:  
    `git --version # should be 'git version 2.20.1' or greater`
2.  Check your __node__ version:  
    `node --version # should be 'v14.0.0' or greater`
3.  Check your __VS Code__ version:  
    `code --version # should be '1.74.3' or greater`
4.  Install and enable the [`dnamsons.kimbie-dark-plus`
    ](https://marketplace.visualstudio.com/items?itemName=dnamsons.kimbie-dark-plus)
    theme.  

### __Set up the repo locally__

Clone the repository, and `cd` into it.  
`git clone git@github.com:0bdx/semi-parser.git && cd semi-parser`  

Install Rollup, the only dependency.  
`npm i`  
3.10.1 adds 2 packages, 2.5 MB, 29 items.

Open `semi-parser` in VS Code.  
`code .`  

### __Handy dev commands__

Run all tests:  
`npm test`

Run examples:  
`npm run example-1`

Build:  
`npm run build`

Check what will be published:  
`npm publish --dry-run`

Publish and be damned:  
`npm publish`

