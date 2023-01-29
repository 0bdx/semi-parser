import equal from '../private-methods/equal.js';
import repairJsImports from './repair-js-imports.js';

// @TODO describe
const source = `
    import "./import";
`;
console.log(`source:\n    ${source}`);

// @TODO describe
const result = repairJsImports(source); // no 2nd argument, so no mapping
console.log(`result:\n    ${result}`);
equal(result, `
    import "./import.js";
`);
