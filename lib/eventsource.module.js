'use strict';

var Flow = require('cflow');
var util = require('util');

/**
* @module eventsource
*/

/**
 * Async result callback.
 * @callback callback
 * @param {Object} error
 * @param {Object} data
 */

/**
* Eventsource module.
* @param {Object} store - Store module dependency.
* @param {Object} event - Event module dependency.
*/
module.exports = function (store, event) {
	module.exports.init(store, event);
};

module.exports.init = function(store, event){
	
	store.onChange(function(data){
		var keyParts = data.key.split('!');
		var resourceDesciptor = keyParts.shift();
		var keyDescriptor = keyParts.join('!');
		var metadata = {
			name: resourceDesciptor,
			store: resourceDesciptor,
			key: keyDescriptor,
			type: data.type
		};
		if(data.value && data.value.$version){
			metadata.version = data.value.$version;
			delete data.value.$version;
		}
		if(data.value && data.value.$timestamp){
			metadata.timestamp = data.value.$timestamp;
			delete data.value.$timestamp;
		}

		event.emit(resourceDesciptor, data.value || {}, metadata || {});
	});

	return {
		/**
		* Run a projection from streams.
		* @memberOf module:eventsource#
		* @method from
		* @param {String} stores - Stores as array of strings.
		* @param {callback} callback - The callback.
		*/
		from: from
	};

	function from(streams){
		var readChain = [];
		if(!util.isArray(streams)) throw new Error('Parameter "streams" should be an Array.');
			
		readChain.push(function(){ this(null, []); });
		streams.forEach(function(itm){
			readChain.push(function(err, stream){
				var self = this;
				store.query(itm + '-stream', {}, {}, function(err, data){
					self(err, stream.concat(data.results || []));
				});
			});
		});

		return {
			log: function(callback){
				readChain.push(callback);
				Construct(Flow, readChain);
			},
			run: function(patternMatch, callback){
				readChain.push(function(err, data){
					var state = {};
					
					if(patternMatch.$init) state = patternMatch.$init(state);
					for(var event in data){
						var streamName = data[event].$name.replace('-stream', '');
						var value = data[event].$payload;
						
						if(patternMatch[streamName]) patternMatch[streamName](state, value);
						else if (patternMatch.$any) patternMatch.$any(state, value);
					}
					if(patternMatch.$completed) state = patternMatch.$completed(state);
					callback(err, state);
				});

				Construct(Flow, readChain);
			},
			on: function(patternMatch, callback){
				this.run(patternMatch, function(err, state){
					callback(err, state);
					event.on(function(result){
						if(streams.indexOf(result.$name.replace('-stream', '')) !== -1) {
							var streamName = result.$name.replace('-stream', '');
							var value = result.$payload;
							
							if (patternMatch[streamName]) patternMatch[streamName](state, value);
							else if (patternMatch.$any) patternMatch.$any(state, value);
							
							if(patternMatch.$completed) state = patternMatch.$completed(state);
							callback(err, state);
						}
					});
				});
			}
		};
	}
	function Construct(constructor, args) {
	    function F() {
	        return constructor.apply(this, args);
	    }
	    F.prototype = constructor.prototype;
	    return new F();
	}

};