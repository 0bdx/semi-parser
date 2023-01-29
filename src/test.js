import repairJsImports from './repair-js-imports/repair-js-imports.js';
import repairJsImportsTest from './repair-js-imports/repair-js-imports.test.js';

import redactJs from './redact-js/redact-js.js';
import redactJsTest from './redact-js/redact-js.test.js';

console.log('Testing src/...');

repairJsImportsTest(repairJsImports);
redactJsTest(redactJs);
