( function( $ )  {

	/**
	 * Indicates if the Pusher JavaScript library has loaded.
	 */
	var libraryLoaded = false;

	/**
	 * Array of jQuery collection objects pending execution.
	 */
	var pending = [];

	/**
	 * Singleton Pusher instance.
	 */
	var pusher;

	/**
	 * Loads the Pusher JavaScript library.
	 */
	function loadPusher() {
		$.getScript( "https://d3dy5gmtp8yhk7.cloudfront.net/2.0/pusher.min.js" )
			.done( pusherLoaded )
			.fail( function( jqxhr, settings, exception ) {
				log( 'oh oh! ' + exception );
			} );
	}

	/**
	 * Called when the Pusher JavaScript library successfully loads.
	 */
	function pusherLoaded( script, textStatus ) {
		libraryLoaded = true;

		Pusher.log = log;

		var item;
		while( pending.length !== 0 ) {
			item = pending.shift();
			subscribe( item.els, item.options );
		}
	}

	/**
	 * Singleton function for getting a Pusher instance.
	 */
	function getPusher() {
		if( pusher === undefined ) {
			var pluginScriptTag = $( "script[src$='jquery.realtime.js']" );
  		var appKey = pluginScriptTag.attr( "data-rt-key" );
			pusher = new Pusher( appKey );
		}
		return pusher;
	}

	/**
	 * Finds and subscribes to channels identifies by the appropriate data channel attribute.
	 */
	function subscribe( els, options ) {
		var channelEls = els.find( "*[data-rt-channel]" );
		log( 'found ' + channelEls.size() + ' channels' );

		channelEls.each( function( index, el ) {
			subscribeChannel( $( el ), options );
		} );
	}

  /**
   * Subscribe to an individual channel. Also find the associated channel events to bind to.
   */
	function subscribeChannel( el, options ) {
		var pusher = getPusher();
		var channelName = el.attr( 'data-rt-channel' );
		var channel = pusher.subscribe( channelName );

		var eventEls = find( el, '*[data-rt-event]' );
		log( 'found ' + eventEls.size() + ' events' );

		eventEls.each( function( i, el ) {
			bind( el, channel, options );
		} );
	}

	/**
	 * Bind to events on the channel based on data event attribute values.
	 */
	function bind( el, channel, options ) {
		el = $( el );
		var eventName = el.attr( 'data-rt-event' );

		channel.bind( eventName, function( data ) {
			displayUpdate( el, data, options );
		} );
	}

  /**
   * Update the values in the DOM based on the data value attributes and properties on the update object.
   */
	function displayUpdate( el, data ) {
		for( var propName in data ) {
			var value = data[ propName ];
			var updateEls = find( el, '*[data-rt-value="' + propName + '"]' );
			log( 'found ' + updateEls.size() + ' "' + propName + '" elements to update' );

			updateEls.text( value );

			updateEls.each( function( i, el ) {
				el = $( el );
				flash.call( el );
			} );
		}
	}

	/**
	 * Very simple flash animation.
	 */
	function flash() {
		var el = this;
		var orgBgColor = el.stop().css( 'background-color' );
		el.css( 'background-color', 'yellow' );
		setTimeout( function() {
			el.css( 'background-color', orgBgColor );
		}, 500 );
	}

  /**
   * Utility function to find elements in the existing collection and in any decendants which match a selector.
   */
	function find( els, selector ) {
		var topLevelEls = els.filter( selector );
		var childEls = els.find( selector );
		return topLevelEls.add( childEls );
	}

	/**
	 * Main plugin function.
	 */
	$.fn.realtime = function( options ) {
		var els = this;

		var defaults = {};

		var allOptions = $.extend( defaults, options );

		if( libraryLoaded ) {
			subscribe( els, allOptions );
		}
		else {
			pending.push( { els: els, options: allOptions } );
		}

		return this;
	};

	/**
	 * Utility log function.
	 */
	function log( msg ) {
		if( typeof $.fn.realtime.log === 'function' ) {
			$.fn.realtime.log( msg );
		}
		else
		{
			console.log( msg );
		}
	}

	// Kick off the loading of the Pusher JavaScript library.
	loadPusher();

}( jQuery ) );