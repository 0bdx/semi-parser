import equal from '../private-methods/equal.js';

/**
 * redactJs() unit tests.
 * 
 * @typedef {import('./redact-js').RedactJsOptions} RedactJsOptions
 * @param   {function(string, RedactJsOptions|void): string} rjs redactJs()
 *
 * @return  {void}
 * @throws  Throws an `Error` exception if a test fails
 */
export default function redactJsTest(rjs) {

    // Only contains top-level (apex) code.
    equal(rjs(''),
              '');
    equal(rjs('const foo = 123;'),
              'const foo = 123;');
    equal(rjs('const bar = 456;', { fillApex:'_' }),
              '________________');

    // Contains apex and block code.
    equal(rjs('var baz = { a:1 }'),
              'var baz = { a:1 }');
    equal(rjs('var baz = { a:1 }', { fillApex:'_' }),
              '__________{ a:1 }');
    equal(rjs('var baz = { a:1 }', { fillBlock:'+' }),
              'var baz = {+++++}');
    equal(rjs('var baz = { a:1 }', { fillApex:'^', fillBlock:'=' }),
              '^^^^^^^^^^{=====}');

    // Double quoted string.
    equal(rjs('""'),
              '""');
    equal(rjs('const keepStr = "KE\\"EP"', { fillString:null }),
              'const keepStr = "KE\\"EP"');
    equal(rjs('const foo = "FOO\\""'),
              'const foo = "-----"');
    equal(rjs('{ const bar = "BAR\\"" }', { fillString:'' }),
              '{ const bar = "" }');
    equal(rjs('const obj = { a:"A", b:"B" };', { fillString:'X', fillApex:'' }),
              '{ a:"X", b:"X" }');

    // Single quoted string.
    equal(rjs("''"),
              "''");
    equal(rjs("const keepStr = 'KE\\'EP'", { fillString:null, fillApex:'!' }),
              "!!!!!!!!!!!!!!!!'KE\\'EP'");
    equal(rjs("const foo = 'FOO\\''", { fillString:' ' }),
              "const foo = '     '");
    equal(rjs("{ a:'A', b:'B' }"),
              "{ a:'-', b:'-' }");

    // Single quotes and backticks inside double quotes.
    equal(rjs(`"'"`),
              `"-"`);
    equal(rjs(`const foo = "\`FOO'", bar = "B'A\`R"; `, { fillString:'*' }),
              `const foo = "*****", bar = "*****"; `);

    // Double quotes and backticks inside single quotes.
    equal(rjs(`'"'`, { fillString:'MULTI-CHAR' }),
              `'MULTI-CHAR'`);
    equal(rjs(`const foo = '"FOO\`', bar = 'B\`A"R'; `),
              `const foo = '-----', bar = '-----'; `);

    // Double quoted with backslash.
    const B = '\\';
    equal(rjs(`"${B}${B}"`), // pair of backslashes
            '"--"');
    equal(rjs(`"${B}n"`, { fillString:'1' }), // newline
            '"11"');
    equal(rjs(`"${B}""`), // escaped double quote
            '"--"');
    equal(rjs(`"${B}`, { fillString:'!' }), // invalid JS
            '"!!'); // AN EXTRA CHARACTER IS ADDED!

    // Single quoted with backslash.
    equal(rjs(`'${B}${B}${B}n${B}"'`, { fillString:' ' }),
              "'      '");
    equal(rjs(`'${B}`), // invalid JS
            "'--"); // AN EXTRA CHARACTER IS ADDED!

    // Simple template string.
    equal(rjs('``'),
              '``');
    equal(rjs("const keepStr = `KE\\`EP`", { fillString:null }),
              "const keepStr = `KE\\`EP`");
    equal(rjs('const $foo = `{$}\\``', { fillString:' ' }),
              'const $foo = `     `');
    equal(rjs('{ a:`A`, b:`B` }'),
              '{ a:`-`, b:`-` }');

    // Template string with backslash.
    equal(rjs('`\\n\\\``'),
              '`----`');
    equal(rjs('`\\', { fillString:'_' }), // invalid JS
            "`__"); // AN EXTRA CHARACTER IS ADDED!

    // Template string with one nest.
    equal(rjs('`${}`'),
              '`${}`');
    equal(rjs('const foo = `abc${123}def`; ', { fillApex:' ' }),
              '            `---${123}---`  ');
    equal(rjs('var s=`abc${ { a:"A", b:\'B\' } }def`', { fillString:' ' }),
              'var s=`   ${ { a:" ", b:\' \' } }   `');

    // Template string with multiple nests.
    equal(rjs('`${`${`${}`}`}`'),
              '`${`${`${}`}`}`'),
    equal(rjs('`abc${ { a:`A`, b:`uvw${ { x:`X`, y:2 } }xyz` } }def` "ok"'),
              '`---${ { a:`-`, b:`---${ { x:`-`, y:2 } }---` } }---` "--"');

    // Contains non-top-level code (code in curly brackets).
    equal(rjs(`const a = () => "A", b = () => { return 'B' };`),
              `const a = () => "-", b = () => { return '-' };`);
    equal(rjs(`let a = () => "A", b = () => { return 'B' };`, { fillApex:'*' }),
              `**************"-"************{ return '-' }*`);

    // Just a multi-line comment.
    equal(rjs('/**/'),
              '    ');
    equal(rjs('/* "foo" * / \'foo\' // `foo` */', { fillComment:null }),
              '/* "foo" * / \'foo\' // `foo` */');
    equal(rjs('/* "bar" * / \'bar\' // `bar` */', { fillComment:'x' }),
              'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
    equal(rjs('{ /* "baz" * / \'baz\' // `baz` */ }'),
              '{                                }');

    // Just a line comment.
    equal(rjs('//'),
              '  ');
    equal(rjs('//\n2nd line'),
              '  \n2nd line');
    equal(rjs('const one = 1; // 1st line\nconst two = 2;', { fillComment:'' }),
              'const one = 1; \nconst two = 2;');
    equal(rjs('// /* "foo" * / \'foo\' // `foo` */'),
              '                                 ');
    equal(rjs('while (false) { //*"b"*/\'b\'//`b`*/\n}', { fillComment:'9' }),
              'while (false) { 999999999999999999\n}');

    // Typical import code.
    equal(rjs([
        "import foo from 'foo';",
        'import { bar } from "./bar.js"',
        "import './baz/'",
        "export { default as htm } from 'htm';",
        'export * from "@react three/fiber"',
    ].join('\n')),
    [
        "import foo from '---';",
        'import { bar } from "--------"',
        "import '------'",
        "export { default as htm } from '---';",
        'export * from "------------------"',
    ].join('\n'));

    // Import code dotted with gotchas.
    equal(rjs([
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
    ].join('\n'), { fillComment:'\t', fillString:' ' }),
    [
        "import\t\t\t\t\t\t\t\t\t\t\tfoo\t\t\t\tfrom\t\t\t\t\t\t\t\t'   ';",
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
}
