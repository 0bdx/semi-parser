import {
    repairJsImports,
    redactJs,
} from './semi-parser.js';
import repairJsImportsTest from './src/repair-js-imports/repair-js-imports.test.js';
import redactJsTest from './src/redact-js/redact-js.test.js';

console.log('Testing semi-parser.js...');

repairJsImportsTest(repairJsImports);
redactJsTest(redactJs);
