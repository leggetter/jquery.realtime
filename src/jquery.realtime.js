( function( $ )  {

	function log( msg ) {
		console.log( msg );
	}

	var libraryLoaded = false;
	var pending = [];
	var pusher;

	function loadPusher() {
		$.getScript( "https://d3dy5gmtp8yhk7.cloudfront.net/2.0/pusher.min.js" )
			.done( pusherLoaded )
			.fail( function( jqxhr, settings, exception ) {
				log( 'oh oh! ' + exception );
			} );
	}

	function pusherLoaded( script, textStatus ) {
		libraryLoaded = true;

		Pusher.log = log;

		while( pending.length !== 0 ) {
			var els = pending.shift();
			subscribe( els );
		}
	}

	function getPusher() {
		if( pusher === undefined ) {
			var pluginScriptTag = $( "script[src$='jquery.realtime.js']" );
  		var appKey = pluginScriptTag.attr( "data-rt-key" );
			pusher = new Pusher( appKey );
		}
		return pusher;
	}

	function subscribe( els ) {
		var channelEls = els.find( "*[data-rt-channel]" );
		log( 'found ' + channelEls.size() + ' channels' );

		channelEls.each( subscribeChannel );
	}

	function subscribeChannel( index, el ) {
		el = $( el );
		var pusher = getPusher();
		var channelName = el.attr( 'data-rt-channel' );
		var channel = pusher.subscribe( channelName );

		var eventEls = find( el, '*[data-rt-event]' );
		log( 'found ' + eventEls.size() + ' events' );

		eventEls.each( function( i, el) {
			bind( el, channel );
		} );
	}

	function bind( el, channel ) {
		el = $( el );
		var eventName = el.attr( 'data-rt-event' );

		channel.bind( eventName, function( data ) {
			displayUpdate( el, data );
		} );
	}

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

	function flash() {
		var el = this;
		var orgBgColor = el.stop().css( 'background-color' );
		el.css( 'background-color', 'yellow' );
		setTimeout( function() {
			el.css( 'background-color', orgBgColor );
		}, 500 );
	}

	function find( els, selector ) {
		var topLevelEls = els.filter(selector);
  	var childEls = els.find(selector);
  	return topLevelEls.add(childEls);
	}

	$.fn.realtime = function() {
		var els = this;
		if( libraryLoaded ) {
			subscribe( els );
		}
		else {
			pending.push( els );
		}
	};

	loadPusher();

}( jQuery ) );