/**
 * ### @TODO describe
 *
 * @param   {function():any}  actual  The function which throws an exception
 * @param   {any}  expected  The message you expect the exception to contain
 *
 * @return  {void}  Does not return anything
 * @throws  Throws an `Error` exception if `actual !== expected`
 */
export default function equal(actual, expected) {
    try {
        actual();
    } catch (err) {
        if (err.message !== expected) {
            throw Error(`actual message:\n${err.message
                }\n!== expected message:\n${expected}\n`);
        }
        return;
    }
    throw Error(`expected message:\n${expected}\nbut no exception was thrown\n`);
}
