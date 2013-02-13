(function() {
	var ns = (typeof(window.ISM) != 'undefined' ? window.ISM : (window.ISM = {})),
		rpc = null,
		$formToOpenURL = null;

	// event names:
	var EVENT_INIT_COMPLETE = 'INIT_COMPLETE',
		EVENT_CLICK = 'CLICK',
		EVENT_INTERACTION = 'INTERACTION',
		EVENT_CLICK_TAG = 'CLICK_TAG',
		EVENT_RESIZE = 'RESIZE';

	ns.initData = {};
	ns.creativeData = {};

	$(function() {
		try {
			createRPC();
		}
		catch (e) {}

		$formToOpenURL = $('<form method="get" target="_blank"></form>').appendTo(document.body);
	});

	function createRPC() {
		rpc = new easyXDM.Rpc(
			{
				'swf': 'http://cdn.inskinmedia.com/isfe/resources/swf/easyxdm.swf',

				'onReady': function() {
				}
			},
			{
				'local': {
					'init': function(initData, successFn, errorFn) {
						init(initData);
					},
					'doStart': function(obj, successFn, errorFn) {
						doStart(obj);
					},
					'setCreativeData': function(creativeData, successFn, errorFn) {
						setCreativeData(creativeData);
					}
				},

				'remote': {
					'IFrameEvent': {}
				}
			}
		);
	}

	//////////////////////////////////////////////////
	//
	// Creative API
	//
	//////////////////////////////////////////////////

	/**
	 * init.
	 */
	function init(initData) {
		ns.initData = initData;
		
		if (!callGlobalFunction('init')) {
			ns.sendInitComplete();
		}
	}

	/**
	 * doStart.
	 */
	function doStart(obj) {
		callGlobalFunction('doStart', obj);
	}

	/**
	 * setCreativeData.
	 */
	function setCreativeData(creativeData) {
		ns.creativeData = creativeData;

		callGlobalFunction('setCreativeData', ns.creativeData);
	}


	function sendInitComplete() {
		sendEvent(EVENT_INIT_COMPLETE);
	};
	ns.sendInitComplete = sendInitComplete;

	function sendClick(obj) {
		sendEvent(EVENT_CLICK, obj);
	}

	function sendInteraction(obj) {
		sendEvent(EVENT_INTERACTION, obj);
	}

	function sendClickTag(tag, obj) {
		if (!obj) obj = {};
		obj.label = 'PAGESKIN_CLICKTAG_' + tag;

		sendEvent(EVENT_CLICK_TAG, obj);
	}

	function clickTag(tag, obj) {
		var label = 'PAGESKIN_CLICKTAG_' + tag;

		if (obj && obj['external']) {
			var urls = [];

			if (ns.initData && ns.initData['ISAP'] && ns.initData.ISAP['AssociatedThirdPartyTrackers']) {
				var trackers = ns.initData.ISAP.AssociatedThirdPartyTrackers;
				if (trackers[label]) {
					if (typeof(trackers[label]) == 'string') {
						urls.push(trackers[label]);
					}
					else {
						for (var id in trackers[label]) {
							urls.push(trackers[label][id]);
						}
					}
				}
			}

			if (urls.length > 0) {
				openURL({'url': urls[0]});
			}
		}
		else {
			sendClickTag(tag);
		}

		sendClick(obj);
		sendInteraction({'name': label});
	}
	ns.clickTag = clickTag;

	function resize(obj) {
		sendEvent(EVENT_RESIZE, obj);
	}
	ns.resize = resize;

	//////////////////////////////////////////////////
	//
	// Util Functions
	//
	//////////////////////////////////////////////////

	/**
	 * sendEvent.
	 */
	function sendEvent(name, data) {
		if (!rpc) return;
		rpc.IFrameEvent(name, data);
	}

	/**
	 * Call a global function (i.e.: defined on the window object). Returns
	 * true in case the function is found, false otherwise.
	 */
	function callGlobalFunction(name) {
		if (typeof(window[name]) == 'function') {
			var args = [];
			for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);

			window[name].apply(null, args);

			return true;
		}

		return false;
	}

	/**
	 * Replace ${timestamp} and ${random} tokens in a string.
	 */
	function replaceTokens(s) {
		s += '';
		return ((s.replace('${timestamp}', (new Date()).getTime())).replace('${random}', Math.random()));
	}

	/**
	 * openURL.
	 */
	function openURL(obj) {
		var url = replaceTokens(obj['url']);
		$formToOpenURL.attr('action', url).submit();
	}
	ns.openURL = openURL;
})();
