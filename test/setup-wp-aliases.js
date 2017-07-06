const lazyLoadEntryPoint = object =>
	name =>
		Object.defineProperty( object, name, {
			get: () => require( name ),
		} );

const entryPointNames = [
	'element',
	'i18n',
	'components',
	'utils',
	'blocks',
	'date',
	'editor',
];

entryPointNames.map( lazyLoadEntryPoint( global.wp ) );
