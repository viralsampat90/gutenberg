/**
 * External dependencies
 */
import { flow, groupBy, sortBy, findIndex, filter, find } from 'lodash';
import { connect } from 'react-redux';

/**
 * WordPress dependencies
 */
import { __ } from 'i18n';
import { Component } from 'element';
import { Dashicon, Popover, withFocusReturn, withInstanceId } from 'components';
import { TAB, ESCAPE, LEFT, UP, RIGHT, DOWN } from 'utils/keycodes';
import { getCategories, getBlockTypes } from 'blocks';

/**
 * Internal dependencies
 */
import './style.scss';
import { getBlocks } from '../selectors';
import { showInsertionPoint, hideInsertionPoint } from '../actions';

class InserterMenu extends Component {
	constructor() {
		super( ...arguments );
		this.nodes = {};
		this.state = {
			filterValue: '',
			currentFocus: 'search',
			tab: 'recent',
		};
		this.filter = this.filter.bind( this );
		this.isShownBlock = this.isShownBlock.bind( this );
		this.setSearchFocus = this.setSearchFocus.bind( this );
		this.onKeyDown = this.onKeyDown.bind( this );
		this.getVisibleBlocks = this.getVisibleBlocks.bind( this );
		this.sortBlocksByCategory = this.sortBlocksByCategory.bind( this );
		this.getVisibleBlocksForTab = this.getVisibleBlocksForTab.bind( this );
	}

	componentDidMount() {
		document.addEventListener( 'keydown', this.onKeyDown );
	}

	componentWillUnmount() {
		document.removeEventListener( 'keydown', this.onKeyDown );
	}

	isShownBlock( block ) {
		return block.title.toLowerCase().indexOf( this.state.filterValue.toLowerCase() ) !== -1;
	}

	isDisabledBlock( block ) {
		return block.useOnce && find( this.props.blocks, ( { name } ) => block.name === name );
	}

	bindReferenceNode( nodeName ) {
		return ( node ) => this.nodes[ nodeName ] = node;
	}

	filter( event ) {
		this.setState( {
			filterValue: event.target.value,
		} );
	}

	selectBlock( name ) {
		return () => {
			this.props.onSelect( name );
			this.setState( {
				filterValue: '',
				currentFocus: null,
			} );
		};
	}

	getVisibleBlocks( blockTypes ) {
		return filter( blockTypes, this.isShownBlock );
	}

	sortBlocksByCategory( blockTypes ) {
		const getCategoryIndex = ( item ) => {
			return findIndex( getCategories(), ( category ) => category.slug === item.category );
		};

		return sortBy( blockTypes, getCategoryIndex );
	}

	groupByCategory( blockTypes ) {
		return groupBy( blockTypes, ( blockType ) => blockType.category );
	}

	getVisibleBlocksByCategory( blockTypes ) {
		return flow(
			this.getVisibleBlocks,
			this.sortBlocksByCategory,
			this.groupByCategory
		)( blockTypes );
	}

	getVisibleBlocksForTab( blockTypes ) {
		if ( this.state.tab === 'embeds' ) {
			return blockTypes.filter( ( block ) => block.category === 'embed' );
		}

		if ( this.state.tab === 'blocks' ) {
			return blockTypes.filter( ( block ) => block.category !== 'embed' );
		}

		return blockTypes.filter( ( block ) => block.category === 'common' );
	}

	findByIncrement( blockTypes, increment = 1 ) {
		const currentIndex = findIndex( blockTypes, ( blockType ) => this.state.currentFocus === blockType.name );
		const nextIndex = currentIndex + increment;
		const highestIndex = blockTypes.length - 1;
		const lowestIndex = 0;

		if ( nextIndex > highestIndex ) {
			return 'search';
		}

		if ( nextIndex < lowestIndex ) {
			return 'search';
		}

		// Return the name of the next block type.
		const block = blockTypes[ nextIndex ];
		if ( this.isDisabledBlock( block ) ) {
			return this.findByIncrement( blockTypes, increment > 0 ? increment + 1 : increment - 1 );
		}

		return block.name;
	}

	findNext( blockTypes ) {
		/**
		 * null is the initial state value and triggers start at beginning.
		 */
		if ( null === this.state.currentFocus ) {
			return blockTypes[ 0 ].name;
		}

		return this.findByIncrement( blockTypes, 1 );
	}

	findPrevious( blockTypes ) {
		/**
		 * null is the initial state value and triggers start at beginning.
		 */
		if ( null === this.state.currentFocus ) {
			return blockTypes[ 0 ].name;
		}

		return this.findByIncrement( blockTypes, -1 );
	}

	focusNext() {
		const sortedByCategory = flow(
			this.getVisibleBlocks,
			this.getVisibleBlocksForTab,
			this.sortBlocksByCategory,
		)( getBlockTypes() );

		// If the block list is empty return early.
		if ( ! sortedByCategory.length ) {
			return;
		}

		const nextBlock = this.findNext( sortedByCategory );
		this.changeMenuSelection( nextBlock );
	}

	focusPrevious() {
		const sortedByCategory = flow(
			this.getVisibleBlocks,
			this.getVisibleBlocksForTab,
			this.sortBlocksByCategory,
		)( getBlockTypes() );

		// If the block list is empty return early.
		if ( ! sortedByCategory.length ) {
			return;
		}

		const nextBlock = this.findPrevious( sortedByCategory );
		this.changeMenuSelection( nextBlock );
	}

	onKeyDown( keydown ) {
		switch ( keydown.keyCode ) {
			case TAB:
				if ( keydown.shiftKey ) {
					// Previous.
					keydown.preventDefault();
					this.focusPrevious( this );
					break;
				}
				// Next.
				keydown.preventDefault();
				this.focusNext( this );
				break;
			case ESCAPE:
				keydown.preventDefault();
				this.props.onSelect( null );

				break;
			case LEFT:
				if ( this.state.currentFocus === 'search' ) {
					return;
				}
				this.focusPrevious( this );

				break;
			case UP:
				keydown.preventDefault();
				this.focusPrevious( this );

				break;
			case RIGHT:
				if ( this.state.currentFocus === 'search' ) {
					return;
				}
				this.focusNext( this );

				break;
			case DOWN:
				keydown.preventDefault();
				this.focusNext( this );

				break;
			default :
				break;
		}
	}

	changeMenuSelection( refName ) {
		this.setState( {
			currentFocus: refName,
		} );

		// Focus the DOM node.
		this.nodes[ refName ].focus();
	}

	setSearchFocus() {
		this.changeMenuSelection( 'search' );
	}

	getBlockItem( block ) {
		const disabled = this.isDisabledBlock( block );
		return (
			<button
				role="menuitem"
				key={ block.name }
				className="editor-inserter__block"
				onClick={ this.selectBlock( block.name ) }
				ref={ this.bindReferenceNode( block.name ) }
				tabIndex="-1"
				onMouseEnter={ this.props.showInsertionPoint }
				onMouseLeave={ this.props.hideInsertionPoint }
				disabled={ disabled }
			>
				<Dashicon icon={ block.icon } />
				{ block.title }
			</button>
		);
	}

	switchTab( tab ) {
		this.setState( { tab: tab } );
	}

	render() {
		const { position, instanceId } = this.props;
		const visibleBlocksByCategory = this.getVisibleBlocksByCategory( this.getVisibleBlocksForTab( getBlockTypes() ) );

		/* eslint-disable jsx-a11y/no-autofocus */
		return (
			<Popover position={ position } className="editor-inserter__menu">
				<label htmlFor={ `editor-inserter__search-${ instanceId }` } className="screen-reader-text">
					{ __( 'Search blocks' ) }
				</label>
				<input
					autoFocus
					id={ `editor-inserter__search-${ instanceId }` }
					type="search"
					placeholder={ __( 'Search…' ) }
					className="editor-inserter__search"
					onChange={ this.filter }
					onClick={ this.setSearchFocus }
					ref={ this.bindReferenceNode( 'search' ) }
					tabIndex="-1"
				/>
				<div role="menu" className="editor-inserter__content">
					{ this.state.tab === 'recent' &&
						<div className="editor-inserter__recent">
							{ getCategories()
								.map( ( category ) => !! visibleBlocksByCategory[ category.slug ] && (
									<div
										className="editor-inserter__category-blocks"
										role="menu"
										tabIndex="0"
										aria-labelledby={ `editor-inserter__separator-${ category.slug }-${ instanceId }` }
										key={ category.slug }
									>
										{ visibleBlocksByCategory[ category.slug ].map( ( block ) => this.getBlockItem( block ) ) }
									</div>
								) )
							}
						</div>
					}
					{ this.state.tab === 'blocks' &&
						getCategories()
							.map( ( category ) => !! visibleBlocksByCategory[ category.slug ] && (
								<div key={ category.slug }>
									<div
										className="editor-inserter__separator"
										id={ `editor-inserter__separator-${ category.slug }-${ instanceId }` }
										aria-hidden="true"
									>
										{ category.title }
									</div>
									<div
										className="editor-inserter__category-blocks"
										role="menu"
										tabIndex="0"
										aria-labelledby={ `editor-inserter__separator-${ category.slug }-${ instanceId }` }
									>
										{ visibleBlocksByCategory[ category.slug ].map( ( block ) => this.getBlockItem( block ) ) }
									</div>
								</div>
							) )
					}
					{ this.state.tab === 'embeds' &&
						getCategories()
							.map( ( category ) => !! visibleBlocksByCategory[ category.slug ] && (
								<div
									className="editor-inserter__category-blocks"
									role="menu"
									tabIndex="0"
									aria-labelledby={ `editor-inserter__separator-${ category.slug }-${ instanceId }` }
									key={ category.slug }
								>
									{ visibleBlocksByCategory[ category.slug ].map( ( block ) => this.getBlockItem( block ) ) }
								</div>
							) )
					}
				</div>
				<div className="editor-inserter__tabs is-recent">
					<button
						className={ `editor-inserter__tab ${ this.state.tab === 'recent' ? 'is-active' : '' }` }
						onClick={ () => this.switchTab( 'recent' ) }
					>
						{ __( 'Recent' ) }
					</button>
					<button
						className={ `editor-inserter__tab ${ this.state.tab === 'blocks' ? 'is-active' : '' }` }
						onClick={ () => this.switchTab( 'blocks' ) }
					>
						{ __( 'Blocks' ) }
					</button>
					<button
						className={ `editor-inserter__tab ${ this.state.tab === 'embeds' ? 'is-active' : '' }` }
						onClick={ () => this.switchTab( 'embeds' ) }
					>
						{ __( 'Embeds' ) }
					</button>
				</div>
			</Popover>
		);
		/* eslint-enable jsx-a11y/no-autofocus */
	}
}

const connectComponent = connect(
	( state ) => {
		return {
			blocks: getBlocks( state ),
		};
	},
	{ showInsertionPoint, hideInsertionPoint }
);

export default flow(
	withInstanceId,
	withFocusReturn,
	connectComponent
)( InserterMenu );
