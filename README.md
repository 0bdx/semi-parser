# semi-parser

__A collection of tools for roughly (but quickly) parsing CSS, HTML and JavaScript.__

▶&nbsp; __Version:__ 0.0.1  
▶&nbsp; __NPM:__ <https://www.npmjs.com/package/@0bdx/semi-parser>  
▶&nbsp; __Repo:__ <https://gitlab.com/0bdx/semi-parser>  
▶&nbsp; __Homepage:__ <https://0bdx.com/semi-parser/>

@TODO add an overview

---

## __Installation__

`npm i @0bdx/semi-parser`

Require an [LTS](https://github.com/nodejs/Release) Node version (v14.0.0+).

## __Usage__

@TODO add the `redactJs()` description

```js
import { redactJs } from 'semi-parser';

// In this JavaScript source code, we would like to replace the identifier
// `foo` with `ok`, without changing the block comment, or the string "foo",
const source = '/* Set foo to be "foo": */ let foo = "foo"; console.log(foo);';

// Define a simple regular expression, which can find "foo" multiple times.
// The `g` flag means exec() will keep searching forwards - tinyurl.com/mr2puud2
const rx = /foo/g;

// "foo" appears five times in `source`, ending at index positions:
// 10, 21, 34, 41 and 59.
while (rx.exec(source)) console.log(rx.lastIndex);

// Use redactJs() to fill strings with dashes, and replace comments with spaces.
// `result` is '                           let foo = "---"; console.log(foo);'.
const result = redactJs(source);

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
// `replaced` is '/* Set foo to be "foo": */ let ok = "foo"; console.log(ok);'
const replaced = parts.join('ok');
console.log(replaced);

```

You can find the __`redactJs()`__ example in the
__space-js-strings-and-comments/__ directory, and run it using:  
`npm run example-1`

---

## __Contributing__

### __Handy Dev Commands__

Run all tests:  
`npm test`

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

