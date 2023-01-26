/**
 * ### Asserts strict-equality in an extremely minimal way.
 * 
 *     // For example...
 *     equal(1, 2);
 *     // ...will throw an Error containing this message:
 *     actual:
 *     1
 *     !== expected:
 *     2
 * 
 * equal() is a private method, not exported as part of semi-parser's API.
 * Useful, because it removes the `import { equal } from 'assert'` dependency,
 * which is not available to browsers, and makes `tsc` harder to configure.
 *
 * @param   {any}  actual    The value you actually got
 * @param   {any}  expected  The value you were expecting
 *
 * @return  {void}           Does not return anything
 * @throws  Throws an `Error` exception if `actual !== expected`
 */
export default function equal(actual, expected) {
    if (actual !== expected) {
        throw Error(`actual:\n${actual}\n!== expected:\n${expected}\n`);
    }
}
