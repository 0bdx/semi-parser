import rjs from './redact-js.js';
import assert from 'assert';

// Only contains code.
assert.equal(rjs(''),
                 '');
assert.equal(rjs('const foo = 123;'),
                 'const foo = 123;');

// Just double quoted string.
assert.equal(rjs('""'),
                 '""');
assert.equal(rjs('const foo = "FOO\\""'),
                 'const foo = "     "');
assert.equal(rjs('{ a:"A", b:"B" }'),
                 '{ a:" ", b:" " }');

// Just single quoted string.
assert.equal(rjs("''"),
                 "''");
assert.equal(rjs("const foo = 'FOO\\''"),
                 "const foo = '     '");
assert.equal(rjs("{ a:'A', b:'B' }"),
                 "{ a:' ', b:' ' }");

// Single quotes inside double quotes.
assert.equal(rjs(`"'"`),
                 `" "`);
assert.equal(rjs(`const foo = "'FOO'", bar = "B'A'R"; `),
                 `const foo = "     ", bar = "     "; `);

// Double quotes inside single quotes.
assert.equal(rjs(`'"'`),
                 `' '`);
assert.equal(rjs(`const foo = '"FOO"', bar = 'B"A"R'; `),
                 `const foo = '     ', bar = '     '; `);

// Double quoted with backslash.
const B = '\\';
assert.equal(rjs(`"${B}${B}"`), // pair of backslashes
                 '"  "');
assert.equal(rjs(`"${B}n"`), // newline
                 '"  "');
assert.equal(rjs(`"${B}""`), // escaped double quote
                 '"  "');
assert.equal(rjs(`"${B}`), // invalid JS
                 '"  '); // AN EXTRA CHARACTER IS ADDED!

// Single quoted with backslash.
assert.equal(rjs(`'${B}${B}${B}n${B}"'`),
                 "'      '");
assert.equal(rjs(`'${B}`), // invalid JS
                 "'  "); // AN EXTRA CHARACTER IS ADDED!

// Simple template string.
assert.equal(rjs('``'),
                 '``');
assert.equal(rjs('const $foo = `{$}\\``'),
                 'const $foo = `     `');
assert.equal(rjs('{ a:`A`, b:`B` }'),
                 '{ a:` `, b:` ` }');

// Template string with backslash.
assert.equal(rjs('`\\n\\\``'),
                 '`    `');
assert.equal(rjs('`\\'), // invalid JS
                 "`  "); // AN EXTRA CHARACTER IS ADDED!

// Template string with one nest.
assert.equal(rjs('`${}`'),
                 '`${}`');
assert.equal(rjs('const foo = `abc${123}def`'),
                 'const foo = `   ${123}   `');
assert.equal(rjs('`abc${ { a:"A", b:\'B\' } }def`'),
                 '`   ${ { a:" ", b:\' \' } }   `');

// Template string with multiple nests.
assert.equal(rjs('`${`${`${}`}`}`'),
                 '`${`${`${}`}`}`'),
assert.equal(rjs('`abc${ { a:`A`, b:`uvw${ { x:`X`, y:2 } }xyz` } }def` "ok"'),
                 '`   ${ { a:` `, b:`   ${ { x:` `, y:2 } }   ` } }   ` "  "');

// Just a block comment.
assert.equal(rjs('/**/'),
                 '    ');
assert.equal(rjs('/* "hid" * / \'hid\' // `hid` */'),
                 '                              ');

// Just a line comment.
assert.equal(rjs('//'),
                 '  ');
assert.equal(rjs('//\n2nd line'),
                 '  \n2nd line');
assert.equal(rjs('// /* "hid" * / \'hid\' // `hid` */'),
                 '                                 ');

// Typical import code.
assert.equal(
    rjs([
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
    rjs([
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

console.log('redact-js.test.js passed!');
