import fnc from './space-js-strings-and-comments.js';
import assert from 'assert';

// Only contains code.
assert.equal(fnc(''),
                 '');
assert.equal(fnc('const foo = 123;'),
                 'const foo = 123;');

// Just double quoted string.
assert.equal(fnc('""'),
                 '""');
assert.equal(fnc('const foo = "FOO\\""'),
                 'const foo = "     "');
assert.equal(fnc('{ a:"A", b:"B" }'),
                 '{ a:" ", b:" " }');

// Just single quoted string.
assert.equal(fnc("''"),
                 "''");
assert.equal(fnc("const foo = 'FOO\\''"),
                 "const foo = '     '");
assert.equal(fnc("{ a:'A', b:'B' }"),
                 "{ a:' ', b:' ' }");

// Single quotes inside double quotes.
assert.equal(fnc(`"'"`),
                 `" "`);
assert.equal(fnc(`const foo = "'FOO'", bar = "B'A'R"; `),
                 `const foo = "     ", bar = "     "; `);

// Double quotes inside single quotes.
assert.equal(fnc(`'"'`),
                 `' '`);
assert.equal(fnc(`const foo = '"FOO"', bar = 'B"A"R'; `),
                 `const foo = '     ', bar = '     '; `);

// Double quoted with backslash.
const B = '\\';
assert.equal(fnc(`"${B}${B}"`), // pair of backslashes
                 '"  "');
assert.equal(fnc(`"${B}n"`), // newline
                 '"  "');
assert.equal(fnc(`"${B}""`), // escaped double quote
                 '"  "');
assert.equal(fnc(`"${B}`), // invalid JS
                 '"  '); // AN EXTRA CHARACTER IS ADDED!

// Single quoted with backslash.
assert.equal(fnc(`'${B}${B}${B}n${B}"'`),
                 "'      '");
assert.equal(fnc(`'${B}`), // invalid JS
                 "'  "); // AN EXTRA CHARACTER IS ADDED!

// Simple template string.
assert.equal(fnc('``'),
                 '``');
assert.equal(fnc('const $foo = `{$}\\``'),
                 'const $foo = `     `');
assert.equal(fnc('{ a:`A`, b:`B` }'),
                 '{ a:` `, b:` ` }');

// Template string with backslash.
assert.equal(fnc('`\\n\\\``'),
                 '`    `');
assert.equal(fnc('`\\'), // invalid JS
                 "`  "); // AN EXTRA CHARACTER IS ADDED!

// Template string with one nest.
assert.equal(fnc('`${}`'),
                 '`${}`');
assert.equal(fnc('const foo = `abc${123}def`'),
                 'const foo = `   ${123}   `');
assert.equal(fnc('`abc${ { a:"A", b:\'B\' } }def`'),
                 '`   ${ { a:" ", b:\' \' } }   `');

// Template string with multiple nests.
assert.equal(fnc('`${`${`${}`}`}`'),
                 '`${`${`${}`}`}`'),
assert.equal(fnc('`abc${ { a:`A`, b:`uvw${ { x:`X`, y:2 } }xyz` } }def` "ok"'),
                 '`   ${ { a:` `, b:`   ${ { x:` `, y:2 } }   ` } }   ` "  "');

// Just a block comment.
assert.equal(fnc('/**/'),
                 '    ');
assert.equal(fnc('/* "hid" * / \'hid\' // `hid` */'),
                 '                              ');

// Just a line comment.
assert.equal(fnc('//'),
                 '  ');
assert.equal(fnc('//\n2nd line'),
                 '  \n2nd line');
assert.equal(fnc('// /* "hid" * / \'hid\' // `hid` */'),
                 '                                 ');

// Typical import code.
assert.equal(
    fnc([
        "import foo from 'foo';",
        'import { bar } from "./bar.js"',
        "import './baz/'",
        "export { default as htm } from 'htm';",
        'export * from "@react three/fiber"',
    ].join('\n')),
    [
        "import foo from '   ';",
        'import { bar } from "        "',
        "import '      '",
        "export { default as htm } from '   ';",
        'export * from "                  "',
    ].join('\n'));

// Import code dotted with gotchas.
assert.equal(
    fnc([
        "import/* hullo */foo/**/from/**foo*/'foo';",
        'import{bar}from"./bar.js"',
        "import'./baz/'",
        "'export { default as htm } from \\'htm\\';'",
        'export',
        '    *',
        '    from',
        '    "@react three/fiber"',
        'const foo = {',
        '    export: bar,',
        "    from: 'bar'",
        '};',
    ].join('\n')),
    [
        "import           foo    from        '   ';",
        'import{bar}from"        "',
        "import'      '",
        "'                                       '",
        'export',
        '    *',
        '    from',
        '    "                  "',
        'const foo = {',
        '    export: bar,',
        "    from: '   '",
        '};',
    ].join('\n'));

console.log('space-js-strings-and-comments.test.js passed!');
