import equal from '../private-methods/equal.js';
import throws from '../private-methods/throws.js';

/**
 * repairJsImports() unit tests.
 * 
 * @param   {function(string, Object|void): string} f repairJsImports()
 *
 * @return  {void}
 * @throws  Throws an `Error` exception if a test fails
 */
export default function repairJsImportsTest(f) {

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
    equal(f('foo;import ok; export ok'),
            'foo;import ok; export ok');
    equal(f('export "./foo";'),
            'export "./foo";');
    equal(f('export foo from "./foo";'),
            'export foo from "./foo";');
    equal(f('import * from "./foo";'),
            'import * from "./foo";');
    equal(f('{ import "./foo" };'), // import is not allowed in {...} @TODO allow dynamic import()
            '{ import "./foo" };');
    equal(f('(import "./foo" );'), // repairJsImports() ignores this, because it sees the '('
            '(import "./foo" );');
    equal(f('( import "./foo" );'), // @TODO import is not actually allowed in (..), so maybe disallow this?
            '( import "./foo.js" );');

    // Various unrepairable imports.
    throws(()=>f('import "HTTP://example.com/foo";'),
        'repairJsImports(): Unrepairable path "HTTP://example.com/foo"');
    // @TODO more

    // 'Named' export (https://tinyurl.com/mrytr49k) not modified.
    equal(f('export { x as v } from "http://0bdx.com/mod.js";'),
            'export { x as v } from "http://0bdx.com/mod.js";');

    // 'Named' export is modified.
    equal(f('let a=1;export*from"../foo";'),
            'let a=1;export*from"../foo.js";');
    equal(f('function noop(){}export { x as v } from "./mod";'),
            'function noop(){}export { x as v } from "./mod.js";');
    equal(f('export{x}from"../tool-kit/";'),
            'export{x}from"../tool-kit/index.js";');
    equal(f("export {\n  default as fn1,\n  fn2,\n} from '/bar';\n"),
            "export {\n  default as fn1,\n  fn2,\n} from '/bar.js';\n");

    // 'Wildcard' export (https://tinyurl.com/mrytr49k) not modified.
    equal(f('export * from "./foo.js";'),
            'export * from "./foo.js";');
    equal(f("export * as ns from 'pointless';", { pointless:'pointless' }),
            "export * as ns from 'pointless';");

    // 'Wildcard' export is modified.
    equal(f("export * from '//';"),
            "export * from '//index.js';");
    equal(f("export * as ns from 'uses-repairMap';", { 'uses-repairMap':'ok!' }),
            "export * as ns from 'ok!';");
    equal(f('// Ok:\nexport*as $ from"https://foo.example.com:123/foo"'),
            '// Ok:\nexport*as $ from"https://foo.example.com:123/foo.js"');

    // 'Side Effect' import (https://tinyurl.com/bdeu8ty9) not modified.
    equal(f('import "./foo.js";'),
            'import "./foo.js";');
    equal(f("import '../foo-module/foo.mjs';"),
            "import '../foo-module/foo.mjs';");
    equal(f("import '/my-data.json' // import './single-line-comment'"),
            "import '/my-data.json' // import './single-line-comment'");

    // 'Side Effect' import is modified.
    equal(f("{}import'//';"),
            "{}import'//index.js';");
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

    // 'Named' import (https://tinyurl.com/2p89u8wr) not modified.
    equal(f('import { x as v } from "http://0bdx.com/mod.js";'),
            'import { x as v } from "http://0bdx.com/mod.js";');

    // 'Named' import is modified.
    equal(f('import { "string-name" as alias } from "./mod";'),
            'import { "string-name" as alias } from "./mod.js";');
    equal(f('import{x}from"../tool-kit/";'),
            'import{x}from"../tool-kit/index.js";');
    equal(f("import {\n  default as fn1,\n  fn2,\n} from '/bar';\n"),
            "import {\n  default as fn1,\n  fn2,\n} from '/bar.js';\n");

    // Simple 'Default' import (https://tinyurl.com/33ptaacr) not modified.
    equal(f('import myDefault from "/modules/my-module.js";'),
            'import myDefault from "/modules/my-module.js";');
    equal(f("import n from'/n.js'"),
            "import n from'/n.js'");

    // Simple 'Default' import is modified.
    equal(f("import foo from '//foo/';", { '//foo/':'ftp://unexpected.cgi' }),
            "import foo from 'ftp://unexpected.cgi';");
    equal(f('/*1*/import/*2*/foo/*3*/from"https://example.com:1/foo"/*4*/;'),
            '/*1*/import/*2*/foo/*3*/from"https://example.com:1/foo.js"/*4*/;');
    equal(f(`let a = 1;   import  _ from '../foo'\n   import\t\t"/.";`),
            `let a = 1;   import  _ from '../foo.js'\n   import\t\t"/..js";`);

    // 'Default + Named' import (https://tinyurl.com/33ptaacr) not modified.
    equal(f('import defaultFn, { fn1, fn2 } from "fns"', { fns:'fns' }),
            'import defaultFn, { fn1, fn2 } from "fns"');

    // 'Default + Named' import is modified.
//     equal(f('import defaultExport, { export1 } from "./"; export defaultexport, { export2 } from "./"'),
    equal(f('import defaultExport, { export1, export2 } from "./"'),
            'import defaultExport, { export1, export2 } from "./index.js"');
    equal(f('import foo,{"export-1"as export1}from"https://-.com/ok"'),
            'import foo,{"export-1"as export1}from"https://-.com/ok.js"');

    // 'Default + Wildcard' import (https://tinyurl.com/33ptaacr) not modified.
    equal(f('/*1*/import/*2*/foo/*3*/from"./foo.json"/*4*/;'),
            '/*1*/import/*2*/foo/*3*/from"./foo.json"/*4*/;');

    // 'Default + Wildcard' import is modified.
    equal(f('import myDefault, * as myModule from "/modules/";'),
            'import myDefault, * as myModule from "/modules/index.js";');
    equal(f("import _,* as $ from './n'"),
            "import _,* as $ from './n.js'");

    console.log('repair-js-imports.test.js passed!');
}
