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
import { __ } from 'i18n';
import InspectorControls from '../../inspector-controls';
import { registerBlockType, query } from '../../api';
const { prop } = query;

registerBlockType( 'core/code-mirror', {
	title: wp.i18n.__( 'Code Editor' ),
	icon: 'text',
	category: 'formatting',

	attributes: {
		content: prop( 'code', 'textContent' ),
	},

	edit( { attributes, focus, setAttributes } ) {
		return (
			<div>
				<CodeMirror
					value={ attributes.content }
					onChange={ value => setAttributes( { content: value } ) }
					options={ {
						lineNumbers: true,
						mode: attributes.language,
					} }
				/>
				{ focus && (
					<InspectorControls>
						<label className="blocks-text-control__label" htmlFor="blocks-codemirror-language-select">{ __( 'Language' ) }</label>
						<select
							id="blocks-codemirror-language-select"
							onChange={ ( { target: { value } } ) => setAttributes( { language: value } ) }
							value={ attributes.language }
						>
							{ [ 'css', 'diff', 'elm', 'javascript', 'markdown', 'pegjs', 'php' ].map( language => (
								<option key={ language } value={ language }>
									{ language }
								</option>
							) ) }
						</select>
					</InspectorControls>
				) }
			</div>
		);
	},

	save( { attributes } ) {
		return <pre><code>{ attributes.content }</code></pre>;
	},
} );
