import { redactJs } from './semi-parser.js';
import redactJsTest from './src/redact-js/redact-js.test.js';

console.log('Testing semi-parser.js...');

redactJsTest(redactJs);
