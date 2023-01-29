import equal from '../private-methods/equal.js';

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
    equal(f('import "/foo"'),
            'import "/foo.js"');
    equal(f(`let a = 1; import '../foo'; import "./foo.test";`),
            `let a = 1; import '../foo.js'; import "./foo.test.js";`);
    equal(f('/* import "./multi-line-comment" */ import "./foo";'),
            '/* import "./multi-line-comment" */ import "./foo.js";');
    equal(f(`let a = 'import "./double-quoted-string"'; import "./foo";`),
            `let a = 'import "./double-quoted-string"'; import "./foo.js";`);
    equal(f("import 'foo';", { foo:'../foo/main.js' }),
            "import '../foo/main.js';");
    equal(f('import "";', { '':'hackable.txt"; alert("hullo!"); "oops' }),
            'import "hackable.txt"; alert("hullo!"); "oops";');

    console.log('fix-js-imports.test.js passed!');
}
