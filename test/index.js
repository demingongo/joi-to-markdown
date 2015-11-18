'use strict';

var file_system = require('fs');
var path_util = require('path');
var joi = require('joi');
var convertSchema = require('..').convertSchema;

describe('Testing all examples', function() {
  forEachExample(function(file_name, schema, table) {
    it(file_name, function() {
      convertSchema(schema).md.should.equal(table);
    });
  });
});


function forEachExample(iterator) {
  var examples_path = path_util.join(__dirname, '../examples');

  file_system.readdirSync(examples_path).forEach(function(file_name) {
    if (/\.md$/.test(file_name) === false) {
      return;
    }
    var file_path = path_util.join(examples_path, file_name);
    var str = file_system.readFileSync(file_path, 'utf8');
    var code_begins = '```js';
    var code_ends = '```';
    var i = str.indexOf(code_begins);
    if (i < 0) {
      throw new Error('No code block in ' + file_name);
    }
    str = str.substr(i + code_begins.length);
    i = str.indexOf(code_ends);
    if (i < 0) {
      throw new Error('No end of code block in ' + file_name);
    }
    var schema_str = str.substr(0, i).trim();
    if (/^[Jj]oi\./.test(schema_str) === false) {
      throw new Error('No joi schema in ' + file_name);
    }
    var table = str.substr(i + code_ends.length).trim();
    if (!table) {
      throw new Error('No table in ' + file_name);
    }
    var schema;
    var Joi = joi;
    try {
      schema = eval(schema_str);
    }
    catch (err) {
      throw new Error('Unable to eval schema in ' + file_name + '. Error: ' + err);
    }
    if (!schema || !schema.isJoi) {
      throw new Error('No schema in ' + file_name);
    }
    iterator(file_name, schema, table + '\n');
  });
}
