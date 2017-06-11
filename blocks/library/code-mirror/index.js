/**
 * External dependencies
 */
import CodeMirror from 'react-codemirror';
import he from 'he';
require( 'codemirror/mode/css/css' );
require( 'codemirror/mode/diff/diff' );
require( 'codemirror/mode/javascript/javascript' );
require( 'codemirror/mode/markdown/markdown' );
require( 'codemirror/mode/pegjs/pegjs' );
require( 'codemirror/mode/php/php' );
require( 'codemirror/lib/codemirror.css' );

/**
 * Internal dependencies
 */
import { registerBlockType, query } from '../../api';
const { html } = query;

const toEditor = s => he.decode( s.split( '<br>' ).join( '\n' ) );
const fromEditor = s => he.encode( s, { useNamedReferences: true } ).split( '\n' ).join( '<br>' );

registerBlockType( 'core/code-mirror', {
	title: wp.i18n.__( 'Code Editor' ),
	icon: 'text',
	category: 'common',
	content: 'just a test',

	attributes: {
		html: html(),
	},

	edit( { attributes, setAttributes } ) {
		return (
			<div>
				<select onBlur={ ( { target: { value } } ) => setAttributes( { language: value } ) }>
					{ [ 'css', 'diff', 'javascript', 'markdown', 'pegjs', 'php' ].map( language => (
						<option
							key={ language }
							selected={ language === attributes.language }
							value={ language }
						>
							{ language }
						</option>
					) ) }
				</select>
				<CodeMirror
					value={ toEditor( attributes.html ) }
					onChange={ value => setAttributes( { html: fromEditor( value ) } ) }
					options={ {
						lineNumbers: true,
						mode: attributes.language,
					} }
				/>
			</div>
		);
	},

	save( { attributes } ) {
		return attributes.html;
	},
} );
