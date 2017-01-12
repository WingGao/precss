var resolve = require('postcss-partial-import/lib/resolve-id');

var tests = {
	'precss': {
		'basic': {
			message: 'supports basic usage'
		},
		'basic:var': {
			message: 'supports basic usage with variables',
			options: {
				variables: {
					variables: {
						pass: 'blue'
					}
				}
			}
		},
		'mixed': {
			message: 'supports mixed usage'
		},
		'import': {
			message: 'supports import usage',
			options: {
				'import': {
					resolve: function (id, base, options) {
						if (id.indexOf('./') === 0) {
							id = '**/' + id.substr(2);
						}
						// console.log('resolveX', id, base, options);
						//TODO mutile files exception
						return resolve(id, base, options);
					},
					// load: function (filename, importOptions) {
					// 	console.log('loadX', filename, importOptions);
					// }
					// extension: /\.(css|scss)$/
				}
			}
		}
	}
};

var debug = true;
var dir = './test/fixtures/';

var fs = require('fs');
var path = require('path');
var plugin = require('../');
var test = require('tape');

Object.keys(tests).forEach(function (name) {
	var parts = tests[name];

	test(name, function (t) {
		var fixtures = Object.keys(parts);

		t.plan(fixtures.length * 2);

		fixtures.forEach(function (fixture) {
			var message = parts[fixture].message;
			var options = parts[fixture].options;
			var warning = parts[fixture].warning || 0;
			var warningMsg = message + ' (# of warnings)';

			var baseName = fixture.split(':')[0];
			var testName = fixture.split(':').join('.');

			var inputPath = path.resolve(dir + baseName + '.css');
			var expectPath = path.resolve(dir + testName + '.expect.css');
			var actualPath = path.resolve(dir + testName + '.actual.css');

			var inputCSS = '';
			var expectCSS = '';

			try {
				inputCSS = fs.readFileSync(inputPath, 'utf8');
			} catch (error) {
				fs.writeFileSync(inputPath, inputCSS);
			}

			try {
				expectCSS = fs.readFileSync(expectPath, 'utf8');
			} catch (error) {
				fs.writeFileSync(expectPath, expectCSS);
			}

			plugin.process(inputCSS, options).then(function (result) {
				var actualCSS = result.css;

				if (debug) fs.writeFileSync(actualPath, actualCSS);

				t.equal(actualCSS, expectCSS, message);

				t.equal(result.warnings().length, warning, warningMsg);
			});
		});
	});
});
