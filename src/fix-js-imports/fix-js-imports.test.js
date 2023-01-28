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

    // Does not contain `import` or `export` statements.
    equal(f(''),
            '');
    equal(f('const foo = 123;'),
            'const foo = 123;');
    equal(f('IMPORT foo from "./foo";'), // not lowercase
            'IMPORT foo from "./foo";');

    // Contains a 'Side Effects' import - https://tinyurl.com/bdeu8ty9
    equal(f('import "./foo";'),
            'import "./foo.js";');

    console.log('fix-js-imports.test.js passed!');
}
