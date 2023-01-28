import fixJsImports from './fix-js-imports/fix-js-imports.js';
import fixJsImportsTest from './fix-js-imports/fix-js-imports.test.js';

import redactJs from './redact-js/redact-js.js';
import redactJsTest from './redact-js/redact-js.test.js';

console.log('Testing src/...');

fixJsImportsTest(fixJsImports);
redactJsTest(redactJs);
