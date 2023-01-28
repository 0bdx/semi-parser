import {
    fixJsImports,
    redactJs,
} from './semi-parser.js';
import fixJsImportsTest from './src/fix-js-imports/fix-js-imports.test.js';
import redactJsTest from './src/redact-js/redact-js.test.js';

console.log('Testing semi-parser.js...');

fixJsImportsTest(fixJsImports);
redactJsTest(redactJs);
