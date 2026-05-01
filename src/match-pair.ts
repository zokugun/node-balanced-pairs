import { type Config, toWorkingConfig } from './config.js';
import { IndexScanner } from './scanners/index.js';
import { PositionScanner } from './scanners/position.js';
import type { LineTransformer } from './types/line-transformer.js';
import type { Pair } from './types/pair.js';
import type { Position } from './types/position.js';

function matchPair(text: string, position: number, config: Config): number | null;
function matchPair(text: string | string[], position: Position, config: Config, transform?: LineTransformer): Position | null;
function matchPair(text: string | string[], position: number | Position, config: Config, transform?: LineTransformer): number | Position | null {
	const useIndex = typeof position === 'number';
	const scanner = useIndex ? new IndexScanner(position, Array.isArray(text) ? text.join('\n') : text) : new PositionScanner(position, text, transform);

	if(scanner.isEOF()) {
		return null;
	}

	const cfg = toWorkingConfig(config);

	let pair = scanner.matchOpen(cfg.pairs);
	if(!pair) {
		return null;
	}

	scanner.advance();

	const stack: Pair[] = [];
	let newPair: Pair | null;

	while(!scanner.isEOF()) {
		if(pair.isBlock) {
			scanner.skipComments(cfg.comments);

			if(scanner.isEOF()) {
				return null;
			}
		}

		if(scanner.skipEscape(pair)) {
			continue;
		}
		else if(scanner.matchClose(pair)) {
			if(stack.length === 0) {
				if(useIndex) {
					return (scanner as IndexScanner).index();
				}
				else {
					return (scanner as PositionScanner).position();
				}
			}
			else {
				pair = stack.pop()!;
			}
		}
		else if((newPair = scanner.matchOpen(cfg.pairs))) {
			stack.push(pair);

			pair = newPair;
		}

		scanner.advance();
	}

	return null;
}

export { matchPair };
