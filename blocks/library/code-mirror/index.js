/**
 * External dependencies
 */
import CodeMirror from 'react-codemirror';
require( 'codemirror/mode/css/css' );
require( 'codemirror/mode/diff/diff' );
require( 'codemirror/mode/elm/elm' );
require( 'codemirror/mode/javascript/javascript' );
require( 'codemirror/mode/markdown/markdown' );
require( 'codemirror/mode/pegjs/pegjs' );
require( 'codemirror/mode/php/php' );
require( 'codemirror/lib/codemirror.css' );

/**
 * Internal dependencies
 */
import { registerBlockType, query } from '../../api';
const { prop } = query;

registerBlockType( 'core/code-mirror', {
	title: wp.i18n.__( 'Code Editor' ),
	icon: 'text',
	category: 'formatting',

	attributes: {
		content: prop( 'code', 'textContent' ),
	},

	edit( { attributes, setAttributes } ) {
		return (
			<div>
				<select
					onChange={ ( { target: { value } } ) => setAttributes( { language: value } ) }
					value={ attributes.language }
				>
					{ [ 'css', 'diff', 'elm', 'javascript', 'markdown', 'pegjs', 'php' ].map( language => (
						<option key={ language } value={ language }>
							{ language }
						</option>
					) ) }
				</select>
				<CodeMirror
					value={ attributes.content }
					onChange={ value => setAttributes( { content: value } ) }
					options={ {
						lineNumbers: true,
						mode: attributes.language,
					} }
				/>
			</div>
		);
	},

	save( { attributes } ) {
		return <pre><code>{ attributes.content }</code></pre>;
	},
} );
