import path from 'node:path';
import fse from '@zokugun/fs-extra-plus/sync';
import { globbySync } from 'globby';
import { expect, it } from 'vitest';
import yaml from 'yaml';
import { type Config, matchPair, type Position } from '../src/index.js';

function prepare(file: string) {
	const name = path.basename(file).slice(0, path.basename(file).lastIndexOf('.'));

	const content = fse.readFile(file, 'utf8');
	expect(content.fails).to.be.false;

	const data = yaml.parse(content.value!) as { text: string; config: Config; tests: Array<{ position: Position; result: Position }> };

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
