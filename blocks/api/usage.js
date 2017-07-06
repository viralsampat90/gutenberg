/**
 * External dependencies
 */
import { without } from 'lodash';

/**
 * Internal dependencies
 */
import { getBlockType, getBlockTypes } from './registration';

let recentBlockNames = [];
const maxRecent = 8;

// TODO: replace storage of recent blocks in this module with calls to an API
export function getRecent() {
	if ( 0 === recentBlockNames.length ) {
		recentBlockNames = getBlockTypes()
			.filter( blockType => 'common' === blockType.category )
			.map( blockType => blockType.name );
	}
	return recentBlockNames.map( getBlockType );
}

export function recordUsage( blockType ) {
	recentBlockNames = [
		blockType.name,
		...without( recentBlockNames, blockType.name ),
	].slice( 0, maxRecent );
}
