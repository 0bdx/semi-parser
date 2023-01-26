/**
 * https://www.npmjs.com/package/@0bdx/semi-parser
 * @version 0.0.5
 * @license Copyright (c) 2023 0bdx <hi@0bdx.com> (https://0bdx.com)
 * SPDX-License-Identifier: MIT
 */
/**
 * ### Redacts comments and literal strings, in JavaScript code.
 *
 * By default, spaces replace comments, and hyphens replace string content:
 *
 *     // For example...
 *     redactJs(`let a = "Apple"; /* Comment goes here *∕ let b = 'Banana'`)
 *     // ...will return...
 *              `let a = "-----";                         let b = '------'`
 *
 * The `options` argument provides more flexibility:
 *
 *     redactJs('let c = "Caper";', {fillApex:'_'})    == '________"-----"_'
 *     redactJs('let d = "Durian";',{fillApex:''})     == '"------"'
 *     redactJs('e({ f:"Fig" })',   {fillBlock:'*'})   == 'e({***"---"*})'
 *     redactJs('g() // Guava',     {fillComment:null})== 'g() // Guava'
 *     redactJs('h() // Hass Avo',  {fillComment:'/'}) == 'h() ///////////'
 *     redactJs('`Iceberg Lettuce`',{fillString:null}) == '`Iceberg Lettuce`'
 *     redactJs('j`Jack ${fruit}`', {fillString:'!'})  == 'j`!!!!!${fruit}`'
 *     redactJs("k('Kale') //Lime", {fillApex:'',fillComment:''}) == "'----'"
 *
 * @param {string} source The JavaScript source code to redact
 *
 * @param {object} [options={}]
 *     A plain object containing configuration (default is `{}`).
 * @param {string | null} [options.fillApex=null]
 *     Replaces each top-level character, unless `null` (default is `null`)
 * @param {string | null} [options.fillBlock=null]
 *     Replaces each character inside `{ ... }`, unless `null` (default is `null`)
 * @param {string | null} [options.fillComment=' ']
 *     Replaces each comment character, unless `null` (default is `' '`)
 * @param {string | null} [options.fillString='-']
 *     Replaces each character of string content, unless `null` (default is `'-'`)
 *
 * @return {string} The redacted code (not necessarily valid JavaScript)
 */
export function redactJs(source: string, options?: {
    fillApex?: string | null;
    fillBlock?: string | null;
    fillComment?: string | null;
    fillString?: string | null;
}): string;
