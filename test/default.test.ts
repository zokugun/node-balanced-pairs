import fs from 'fs';
import path from 'path';
import { expect } from 'chai';
import { globbySync } from 'globby';
import yaml from 'yaml';
import { type Config, matchPair, type Position } from '../src/index.js';

describe('test', () => {
	function prepare(file: string) {
		const name = path.basename(file).slice(0, path.basename(file).lastIndexOf('.'));
		const data = yaml.parse(fs.readFileSync(file, 'utf8')) as { text: string; config: Config; tests: Array<{ position: Position; result: Position }> };

		for(const [index, test] of data.tests.entries()) {
			it(`${name} #${index}`, () => {
				const result = matchPair(data.text, test.position, data.config);

				expect(result).to.eql(test.result);
			});
		}
	}

	const files = globbySync('test/fixtures/*.yml');

	for(const file of files) {
		prepare(file);
	}
});
