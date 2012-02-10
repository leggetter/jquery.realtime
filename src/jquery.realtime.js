;(function( $ ){
  var pusherLoaded = (typeof Pusher !== "undefined");
  
  $.fn.realtime = function(appKey, options) {
    
    options = options || {};
    
    var settings = {
      dataChannelAttribute: "data-pusher-channel",
      dataEventAttribute: "data-pusher-event",
      dataValueAttribute: "data-pusher-value",
      log: function(message) {
        if (window.console && window.console.log) {
          window.console.log(message);
        }
      },
      pusherUrl: "http://js.pusher.com/1.11/pusher.min.js",
      pusherEncrypted: false
    };

    $.extend( settings, options );
    
    var self = this;
  
    var createInstance = function(){
      
      if(settings.log){
        Pusher.log = settings.log;
      }
      
      var instance = $.fn.realtime._instances[appKey];
      if(!instance){
        instance = new $.fn.realtime.jqPusher(appKey, settings, self);
        $.fn.realtime._instances[appKey] = instance;
      }
      self.pusherInstance = instance.getPusher();
    };
  
    if(!pusherLoaded) {
      $.ajax({
        async: false,
        url: settings.pusherUrl,
        dataType: "script",
        success: function(){
          pusherLoaded = true;
          createInstance();
        }
      });
    }
    else {
      createInstance();
    }
    
    return this;
  };
})( jQuery );

$(function() {
  var pluginScriptTag = $("script[src$='jquery.realtime.js']");
  var key = pluginScriptTag.attr("data-pusher-app-key");
  if(key) {
    $(document.body).realtime(key);
  }
});

/** @private */
$.fn.realtime._instances = {};

$.fn.realtime.getPusher = function(appKey) {

  appKey = appKey || this.pusherAppKey;
  var jqInstance = $.fn.realtime._instances[appKey];
  var pusherInstance = jqInstance.getPusher();
  return pusherInstance;
};

/** @private */
$.fn.realtime.jqPusher = function(appKey, settings, els){
  
  var self = this;

  /**
   * @type Object
   */
  this.settings = settings;
  
  /** @private */
  this._pusher = new Pusher(appKey, {
    encrypted: self.settings.pusherEncrypted
  });
  
  var channelEls = $.fn.realtime.jqPusher._find(els, "*[" + this.settings.dataChannelAttribute + "]");
  
  self.settings.log("found " + channelEls.size() + " channels");  
  
  channelEls.each(function(i, channelEl) {
    self._subscribe.call(self, jQuery(channelEl));
  });
};

/** @private */
$.fn.realtime.jqPusher._find = function(els, selector) {
  var topLevelEls = els.filter(selector);
  var childEls = els.find(selector);
  return topLevelEls.add(childEls);
};

$.fn.realtime.jqPusher.prototype.getPusher = function() {
  return this._pusher;
};

/** @private */
$.fn.realtime.jqPusher.prototype._subscribe = function(channelEl) {

  var self = this;
  var channelName = channelEl.attr(self.settings.dataChannelAttribute);
  var channel = this._pusher.subscribe(channelName);
    
  var eventEls = $.fn.realtime.jqPusher._find(channelEl, "*[" + self.settings.dataEventAttribute + "]");
  
  self.settings.log("found " + eventEls.size() + " events");
  
  eventEls.each(function(i, eventEl) {
    self._bind.call(self, jQuery(eventEl), channel);
  });
};

/** @private */
$.fn.realtime.jqPusher.prototype._bind = function(eventEl, channel) {
  
  var self = this;
  var eventName = eventEl.attr(self.settings.dataEventAttribute);
  
  self.settings.log("binding to '" + eventName + "' on '" + channel.name + "'");
  
  channel.bind(eventName, function(data) {
    self._handleEvent.call(self, eventName, eventEl, data);
  });
};

/** @private */
$.fn.realtime.jqPusher.prototype._handleEvent = function(eventName, eventEl, data) {
  
  var self = this;
  
  self.settings.log("event received: " + eventName);
  
  for(var dataName in data) {
    var dataEls = $.fn.realtime.jqPusher._find(eventEl, '*[' + self.settings.dataValueAttribute + '=' + dataName + ']');
    var value = data[dataName];
    dataEls.html(value);
  }
};