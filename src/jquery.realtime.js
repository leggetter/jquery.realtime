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