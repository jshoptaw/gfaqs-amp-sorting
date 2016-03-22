// ==UserScript==
// @name            GameFAQs AMP Sorting
// @namespace       OTACON120
// @author          OTACON120
// @license         http://opensource.org/licenses/MIT
// @version         2.0.3
// @description     Gives the ability to sort GameFAQs Message Boards' "Active Messages" list
// @updateURL       http://otacon120.com/user-script-files/meta/gamefaqs-related/amp-sorting/
// @downloadURL     http://otacon120.com/user-script-files/script/gamefaqs-related/amp-sorting/GameFAQs_AMP_Sorting.user.js
// @website         http://otacon120.com/scripts/amp-sorting/
// @contributionURL https://www.paypal.com/us/cgi-bin/webscr?cmd=_flow&SESSION=LgkxqunuQlKnhicHni4dzQajlENrZQbtNOuCyKJcbq1o5msoIEB0UyzAZYS&dispatch=5885d80a13c0db1f8e263663d3faee8dbd0a2170b502f343d92a90377a9956d7
// @match       *://*.gamefaqs.com/user/messages*
// @grant       GM_getValue
// @grant       GM_deleteValue
// @grant       GM_addStyle
// ==/UserScript==

// Transfer any current saved data to localStorage and delete GM-saved values in preparation of phasing out GM_*etValue functions
if ( localStorage.getItem( 'o120-sort-settings' ) === null ) {
	localStorage.setItem( 'o120-sort-settings', GM_getValue( 'o120-sort-settings' ) );
	GM_deleteValue( 'o120-sort-settings' );
}

var i, sortBtnHoverBG, ampSort,
	siteCSS        = document.styleSheets[2].cssRules,
	cssRLen        = siteCSS.length;
	sortBtnStyle   = getComputedStyle( document.querySelector( '.main_content .paginate > li > a' ) ),
	ampTable       = document.querySelector( '.main_content .board_wrap .tlist' ),
	ampTableHead   = ampTable.tHead,
	gFAQsSortNav   = document.getElementsByClassName( 'tsort' )[0],
	gFAQsSortIcon  = ampTableHead.querySelector( 'span[class*="fa-angle"]' ),
	gFAQsSortLinks = Array.prototype.slice.call( ampTableHead.getElementsByTagName( 'a' ) ),
	ampTableBody   = ampTable.tBodies[0],
	ampRows        = ampTableBody.getElementsByTagName( 'tr' ),
	preSortBtn     = null,
	cells          = {
		// Converting HTMLCollections to Arrays to allow usage of forEach later on
		board:     Array.prototype.slice.call( ampTableBody.getElementsByClassName( 'tboard' ) ),
		status:    Array.prototype.slice.call( ampTableBody.getElementsByClassName( 'board_status' ) ),
		title:     Array.prototype.slice.call( ampTableBody.getElementsByClassName( 'topichalf' ) ),
		msgs:      Array.prototype.slice.call( ampTableBody.getElementsByClassName( 'tcount' ) ),
		lastposts: Array.prototype.slice.call( ampTableBody.getElementsByClassName( 'lastpost' ) )
	},
	sortSettings = JSON.parse( localStorage.getItem( 'o120-sort-settings' ) ) || JSON.parse( "{sortedColumn: 4,subSort:null,sortOrder:'dsc'}" );

// Clone sortSettings to regular localStorage in preparation for future transition to localStorage over current GM_setValue storage
localStorage.setItem( 'o120-sort-settings', JSON.stringify( sortSettings ) );

// Get ".paginate > li > a:hover" style
for ( i = 0; i < cssRLen; i++ ) {
	if ( siteCSS[ i ].selectorText === '.paginate > li > a:hover' ) {
		sortBtnHoverBG = siteCSS[ i ].style[ 'background' ];
	}
}

/**
 * Add script CSS
 */
GM_addStyle( '\
ul.paginate.tsort {\
	clear: both;\
	display: block;\
	overflow: auto;\
	width: 100%\
}\
\
.main_content .board_wrap .tlist thead th {\
	cursor: pointer;\
	white-space: nowrap;\
}\
\
.main_content .board_wrap .tlist thead th[colspan] {\
	cursor: default;\
}\
\
.o120-sorted-asc:after,\
.o120-sorted-dsc:after {\
	display: inline-block;\
	font: normal normal 14px/1 "FontAwesome";\
	text-decoration: inherit;\
	padding: 0 4px;\
}\
\
.o120-sorted-asc:after {\
	content: "\\f0de";\
}\
\
.o120-sorted-dsc:after {\
	content: "\\f0dd";\
}\
\
.o120-sort-btn {\
	background-color: ' + sortBtnStyle.backgroundColor + ';\
	background-image: ' + sortBtnStyle.backgroundImage + ';\
	background-repeat: ' + sortBtnStyle.backgroundRepeat + ';\
	border: 0;\
	border-radius: ' + sortBtnStyle.borderTopLeftRadius + ';\
	box-shadow: ' + sortBtnStyle.boxShadow + ';\
	color: ' + sortBtnStyle.color + ';\
	display: ' + sortBtnStyle.display + ';\
	font-weight: ' + sortBtnStyle.fontWeight + ';\
	font-size: ' + sortBtnStyle.fontSize + ';\
	font-family: ' + sortBtnStyle.fontFamily + ';\
	line-height: ' + sortBtnStyle.lineHeight + ';\
	margin-bottom: ' + sortBtnStyle.marginBottom + ';\
	text-shadow: ' + sortBtnStyle.textShadow + ';\
}\
\
.o120-sort-btn:hover {\
	background: ' + sortBtnHoverBG + ';\
}\
\
.o120-sort-btn,\
.o120-sort-btn:active {\
	padding: ' + sortBtnStyle.paddingTop + ' ' + sortBtnStyle.paddingLeft + ';\
}\
\
	.o120-sort-btn .board_icon {\
		vertical-align: text-bottom;\
	}\
\
th[class^="o120-sorted"][data-button-sort="board_status"] #o120-board_status-sort-btn,\
th[class^="o120-sorted"][data-button-sort="topichalf"] #o120-topichalf-sort-btn {\
	color: ' + getComputedStyle( ampTable.querySelector( '.board th' ) ).backgroundColor + ';\
}\
\
.o120-sort-btn + .o120-sort-btn {\
	margin-left: 5px;\
}');

/**
 * Remove GameFAQs native sorting links and sort order icon from thead, change native sort text above table
 * to clarify that it is for GameFAQs native sorting
 */
gFAQsSortIcon.parentNode.removeChild( gFAQsSortIcon );

gFAQsSortLinks.forEach( function( el ) {
	el.parentNode.innerHTML = el.innerHTML;
} );

gFAQsSortNav.firstChild.innerHTML = 'GameFAQs Sorting:';

/**
 * Add UTC timestamp to Last Post columns dataset
 */
function addUTCTimestamp( el, index ) {
	var currTime = new Date(),
		postTime = {
			original: el.querySelector( 'a' ).textContent
		};

	if ( postTime.original.indexOf( ':' ) !== -1 ) { // Post less than a year old
		postTime.formatted = postTime.original.match( new RegExp( '([0-9]{1,2})/([0-9]{1,2}) ([0-9]{1,2}):([0-9]{2})([AP]M)' ) );
		postTime.formatted = {
			month:  parseInt( postTime.formatted[1] ) - 1,
			day:    parseInt( postTime.formatted[2] ),
			year:   parseInt( currTime.getMonth() + 1 < postTime.formatted[1] ? currTime.getFullYear() - 1 : currTime.getFullYear() ),
			hour:   parseInt( postTime.formatted[3] ),
			minute: parseInt( postTime.formatted[4] ),
			period: postTime.formatted[5]
		};

		// To get proper hour, change "12" to "0" if AM, or add 12 hours if "PM" and hour !== 12
		if ( postTime.formatted.hour !== 12 && postTime.formatted.period === 'PM' ) {
			postTime.formatted.hour = postTime.formatted.hour + 12;
		} else if ( postTime.formatted.hour === 12 && postTime.formatted.period === 'AM' ) {
			postTime.formatted.hour = 0;
		}

		postTime.formatted = new Date(
			postTime.formatted.year,
			postTime.formatted.month,
			postTime.formatted.day,
			postTime.formatted.hour,
			postTime.formatted.minute
		);
	} else { // Post at least a year old
		postTime.formatted = postTime.original.match( new RegExp( '([0-9]{1,2})/([0-9]{1,2})/([0-9]{4})' ) );
		postTime.formatted = new Date(
			postTime.formatted[3],
			postTime.formatted[1],
			postTime.formatted[2]
		);
	}

	el.dataset.customSort = postTime.formatted.getTime();
}

cells.lastposts.forEach( addUTCTimestamp );

/**
 * Add last post date to "data-custom-sort" attribute of ".board_status" for sorting "read" and "unread" groups
 */
function boardStatusCustomSort( el, index ) {
	var isRead,
		statusIcon = el.firstElementChild;

	switch ( true ) {
		case statusIcon.classList.contains( 'board_icon_topic_read' ):
			isRead = '0';
			break;

		case statusIcon.classList.contains( 'board_icon_topic' ):
			isRead = '1';
			break;

		case statusIcon.classList.contains( 'board_icon_topic_unread' ):
			isRead = '2';
			break;
	}

	// Prefix post date with "0" if read, otherwise "1" for unread
	el.dataset.customSort = isRead + el.parentNode.querySelector( '.lastpost' ).dataset.customSort;
}

cells.status.forEach( boardStatusCustomSort );

/**
 * Add custom sort for message count to sort only by post count without " posts" text
 */
function msgsCustomSort( el ) {
	el.dataset.customSort = el.textContent.split( ' ', 1 )[0];
}

cells.msgs.forEach( msgsCustomSort );

/**
 * Factory function for topic sort buttons
 */
function topicColSort( that, sortColumn ) {
	return function() {
		that.sortCol( this.parentNode, this, sortColumn );
		return false;
	}
}

/**
 * This is what we're here for! Main sorting function.
 */
function TableSort( el ) {
	if ( window.top !== window.self ) {
		return;
	}

	console.log( el );

	var i, headings;

	this.tbl = el;
	this.lastSortedTh = null;

	if ( this.tbl && this.tbl.nodeName === 'TABLE' ) {
		headings = this.tbl.tHead.rows[0].cells;

		for ( i = 0; headings[ i ]; i++ ) {
			if ( headings[ i ].classList.contains( 'o120-sorted-asc' ) || headings[ i ].classList.contains( 'o120-sorted-dsc' ) ) {
				this.lastSortedTh = headings[ i ];
			}
		}

		this.makeSortable();
	}
}

TableSort.prototype.makeSortable = function () {
	var i, topicSortBtns,
		headings = this.tbl.tHead.rows[0].cells;

	for ( i = 0; headings[ i ]; i++ ) {
		headings[ i ].cIdx = i;

		if ( headings[ i ].colSpan === 1 ) {
			headings[ i ].onclick   = function ( that ) {
				return function () {
					that.sortCol( this );
					return false;
				}
			}( this );
		} else {
			topicSortBtns = {
				status: {
					el:      document.createElement( 'button' ),
					type:       'button',
					id:         'o120-board_status-sort-btn',
					className:  'o120-sort-btn',
					content:    '<i class="board_icon board_icon_topic_unread"></i>Status',
					sortColumn: 'board_status'
				},
				title:  {
					el:      document.createElement( 'button' ),
					type:       'button',
					id:         'o120-topichalf-sort-btn',
					className:  'o120-sort-btn',
					content:    '<i class="fa fa-font"></i> Title',
					sortColumn: 'topichalf'
				}
			};

			headings[ i ].innerHTML += ' | <small>Sort by:</small> ';

			for ( key in topicSortBtns ) {
				if ( topicSortBtns.hasOwnProperty( key ) ) {
					topicSortBtns[ key ].el.type      = topicSortBtns[ key ].type;
					topicSortBtns[ key ].el.id        = topicSortBtns[ key ].id;
					topicSortBtns[ key ].el.classList.add( topicSortBtns[ key ].className  );
					topicSortBtns[ key ].el.innerHTML = topicSortBtns[ key ].content;
					topicSortBtns[ key ].el.onclick   = function ( that ) {
						return topicColSort( that, topicSortBtns[ key ].sortColumn );
					}( this );

					headings[ i ].appendChild( topicSortBtns[ key ].el );
				}
			}
		}
	}
}

TableSort.prototype.sortCol = function ( el, btn, sortColumn, sortOrder ) {
	/*
	 * Get cell data for column that is to be sorted from HTML table
	 */
	var i, cell, content, num, top, bottom, tBody,
		colSpanComp = false,
		rows        = this.tbl.rows,
		alpha       = [],
		numeric     = [],
		aIdx        = 0,
		nIdx        = 0,
		th          = el,
		cellIndex   = th.cIdx,
		col         = [];
	for ( i = 1; rows[ i ]; i++ ) {
		if ( sortColumn && typeof sortColumn !== 'undefined' ) {
			switch ( sortColumn ) {
				case 'board_status':
					cell = rows[ i ].cells[ cellIndex ];
					break;

				case 'topichalf':
					cell = rows[ i ].cells[ cellIndex + 1 ];
					break;
			}
		} else {
			if ( ! colSpanComp && ( th.textContent === 'Msgs' || th.classList.contains( 'lastpost' ) ) ) {
				colSpanComp = true;
				cellIndex++;
			}

			cell    = rows[ i ].cells[ cellIndex ];
		}
		content = cell.dataset.customSort ? cell.dataset.customSort : cell.textContent;

		/*
		 * Split data into two separate arrays, one for numeric content and
		 * one for everything else (alphabetic). Store both the actual data
		 * that will be used for comparison by the sort algorithm (thus the need
		 * to parseFloat() the numeric data) as well as a reference to the
		 * element's parent row. The row reference will be used after the new
		 * order of content is determined in order to actually reorder the HTML
		 * table's rows.
		 */
		num = content.replace( /(\$|\,|\s)/g, '' );

		if ( parseFloat( num ) == num ) {
			numeric[ nIdx++ ] = {
				value: Number( num ),
				row:   rows[ i ]
			}
		} else {
			alpha[ aIdx++ ] = {
				value: content.toLowerCase(),
				row:   rows[ i ]
			}
		}
	}

	/*
	 * Sort according to direction (ascending or descending)
	 */
	if ( th.classList.contains( 'o120-sorted-asc' ) || ( sortOrder && sortOrder === 'dsc' ) ) {
		if ( ( ! sortOrder || ( sortOrder && sortOrder !== 'dsc' ) ) && ( btn && btn.classList.contains( 'o120-sort-btn' ) && th.dataset.buttonSort !== sortColumn ) ) {
			top    = bubbleSort( numeric, 1 );
			bottom = bubbleSort( alpha, 1 );

			th.dataset.buttonSort  = sortColumn;

			sortSettings.sortOrder = 'asc';
		} else {
			top    = bubbleSort( alpha, -1 );
			bottom = bubbleSort( numeric, -1 );
			th.classList.remove( 'o120-sorted-asc' );
			th.classList.add( 'o120-sorted-dsc' );

				if ( btn && btn.classList.contains( 'o120-sort-btn' ) ) {
					th.dataset.buttonSort = sortColumn;
				}
			sortSettings.sortOrder = 'dsc';
		}
	} else if ( ! sortOrder || ( sortOrder && sortOrder === 'asc' ) ) {
		if ( th.dataset.buttonSort && btn.classList.contains( 'o120-sort-btn' ) && th.dataset.buttonSort !== sortColumn ) {
			top    = bubbleSort( numeric, 1 );
			bottom = bubbleSort( alpha, 1 );

			th.dataset.buttonSort = sortColumn;

			th.classList.remove( 'o120-sorted-dsc' );
			th.classList.add( 'o120-sorted-asc' );

			sortSettings.sortOrder = 'asc';
		} else {
			top    = bubbleSort( numeric, 1 );
			bottom = bubbleSort( alpha, 1 );
			if ( th.classList.contains( 'o120-sorted-dsc' ) ) {
				th.classList.remove( 'o120-sorted-dsc' );
				th.classList.add( 'o120-sorted-asc' );
			} else {
				th.classList.add( 'o120-sorted-asc' );

				if ( btn && btn.classList.contains( 'o120-sort-btn' ) ) {
					th.dataset.buttonSort = sortColumn;
				}
			}

			sortSettings.sortOrder    = 'asc';
		}
	}

	/*
	 * Clear asc/dsc class names from the last sorted column's th if it isnt the
	 * same as the one that was just clicked
	 */
	if ( this.lastSortedTh && th !== this.lastSortedTh ) {
		this.lastSortedTh.classList.remove( 'o120-sorted-dsc' );
		this.lastSortedTh.classList.remove( 'o120-sorted-asc' );
		this.lastSortedTh.removeAttribute( 'data-button-sort' );
	}

	this.lastSortedTh = th;

	sortSettings.subSort      = sortColumn;
	sortSettings.sortedColumn = th.cIdx;

	localStorage.setItem( 'o120-sort-settings', JSON.stringify( sortSettings ) );

	/*
	 *  Reorder HTML table based on new order of data found in the col array
	 */
	col   = top.concat( bottom );
	tBody = this.tbl.tBodies[0];
	for ( i = 0; col[ i ]; i++ ) {
		tBody.appendChild( col[ i ].row );
	}
}

function bubbleSort( arr, dir ) {
	// Pre-calculate directional information
	var i, start, end, a, b, c,
		unsorted = true;

	if (dir === 1) {
		start = 0;
		end   = arr.length;
	} else if (dir === -1) {
		start = arr.length - 1;
		end   = -1;
	}

	// Bubble sort: http://en.wikipedia.org/wiki/Bubble_sort
	while ( unsorted ) {
		unsorted = false;
		for ( i = start; i !== end; i = i + dir ) {
			if ( arr[ i + dir ] && arr[ i ].value > arr[ i + dir ].value ) {
				a              = arr[ i ];
				b              = arr[ i + dir ];
				c              = a;
				arr[ i ]       = b;
				arr[ i + dir ] = c;
				unsorted       = true;
			}
		}
	}

	return arr;
}

ampSort = new TableSort( ampTable );


/**
 * Presort on page load based on saved sort settings
 */
if ( sortSettings.subSort ) {
	preSortBtn = document.getElementById( 'o120-' + sortSettings.subSort + '-sort-btn' );
}

ampSort.sortCol( ampTableHead.rows[0].cells[ sortSettings.sortedColumn ], preSortBtn, sortSettings.subSort, sortSettings.sortOrder );
