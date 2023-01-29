import equal from '../private-methods/equal.js';
import throws from '../private-methods/throws.js';

/**
 * fixJsImports() unit tests.
 * 
 * @param   {function(string, Object|void): string} f fixJsImports()
 *
 * @return  {void}
 * @throws  Throws an `Error` exception if a test fails
 */
export default function fixJsImportsTest(f) {

    // Valid JS which does not contain `import` or `export`.
    equal(f(''),
    '');
    equal(f('const foo = 123;'),
    'const foo = 123;');

    // Invalid JS which does not contain `import` or `export`.
    equal(f('ort "./foo";'),
            'ort "./foo";');
    equal(f('port "./foo";'),
            'port "./foo";');
    equal(f('IMPORT "./foo";'),
            'IMPORT "./foo";');
    equal(f('zmport "./foo";'),
            'zmport "./foo";');
    equal(f('Trimport "./foo";'),
            'Trimport "./foo";');

    // Invalid JS which does contain `import` or `export`.
    equal(f('ort'),
            'ort');
    equal(f('port'),
            'port');
    equal(f('import'),
            'import');
    equal(f(';import'),
            ';import');
    equal(f('(import "./foo");'), // import is not allowed in (..)
            '(import "./foo");');
    equal(f('{ import "./foo" };'), // import is not allowed in {...} @TODO allow dynamic import()
            '{ import "./foo" };');

    // Various unrepairable imports.
    throws(()=>f('import "HTTP://example.com/foo";'),
        'fixJsImports(): Unrepairable path "HTTP://example.com/foo"');
    // @TODO more

    // 'Side Effect' import (https://tinyurl.com/bdeu8ty9) not modified.
    equal(f('import "./foo.js";'),
            'import "./foo.js";');
    equal(f("import '../foo-module/foo.mjs';"),
            "import '../foo-module/foo.mjs';");
    equal(f("import '/my-data.json' // import './single-line-comment'"),
            "import '/my-data.json' // import './single-line-comment'");

    // 'Side Effect' import is modified.
    equal(f("import '//';"),
            "import '//index.js';");
    equal(f("/**\n * Foo\n */\nimport '../utils/';\n"),
            "/**\n * Foo\n */\nimport '../utils/index.js';\n");
    equal(f('import/* this is fine */"/foo"'),
            'import/* this is fine */"/foo.js"');
    equal(f(`let a = 1; import '../foo'; import "./foo.test";`),
            `let a = 1; import '../foo.js'; import "./foo.test.js";`);
    equal(f('/* import "./multi-line-comment" */ import "./foo";'),
            '/* import "./multi-line-comment" */ import "./foo.js";');
    equal(f(`let a = 'import "./double-quoted-string"'; import "./foo";`),
            `let a = 'import "./double-quoted-string"'; import "./foo.js";`);
    equal(f("import // kept!\n'foo';", { foo:'../foo/main.js' }),
            "import // kept!\n'../foo/main.js';");
    equal(f('import "";', { '':'hackable.txt"; alert("hullo!"); "oops' }),
            'import "hackable.txt"; alert("hullo!"); "oops";');

    // Simple 'Default' import (https://tinyurl.com/33ptaacr) not modified.
    equal(f('import myDefault from "/modules/my-module.js";'),
            'import myDefault from "/modules/my-module.js";');
    equal(f('/*1*/import/*2*/foo/*3*/from"./foo.json"/*4*/;'),
            '/*1*/import/*2*/foo/*3*/from"./foo.json"/*4*/;');

    // Simple 'Default' import is modified.
    equal(f("import foo from '//foo/';", { '//foo/':'ftp://unexpected.cgi' }),
            "import foo from 'ftp://unexpected.cgi';");
    equal(f('/*1*/import/*2*/foo/*3*/from"https://example.com:1/foo"/*4*/;'),
            '/*1*/import/*2*/foo/*3*/from"https://example.com:1/foo.js"/*4*/;');
    equal(f(`let a = 1;   import  _ from '../foo'\n   import\t\t"/.";`),
            `let a = 1;   import  _ from '../foo.js'\n   import\t\t"/..js";`);

    console.log('fix-js-imports.test.js passed!');
}
