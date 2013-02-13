/**
 * VERSION: beta 0.1.3
 * DATE: 2013-01-26
 * JavaScript
 * UPDATES AND DOCS AT: http://www.greensock.com
 *
 * @license Copyright (c) 2008-2013, GreenSock. All rights reserved.
 * This work is subject to the terms in http://www.greensock.com/terms_of_use.html or for 
 * Club GreenSock members, the software agreement that was issued with your membership.
 * 
 * @author: Jack Doyle, jack@greensock.com
 **/
(window._gsQueue || (window._gsQueue = [])).push( function() {

	_gsDefine("plugins.EaselPlugin", ["plugins.TweenPlugin"], function(TweenPlugin) {
		
		var EaselPlugin = function(props, priority) {
				TweenPlugin.call(this, "easel", -1);
				this._overwriteProps.pop();
			},
			p = EaselPlugin.prototype = new TweenPlugin("easel", -1),
			_numExp = /(\d|\.)+/g,
			_ColorFilter, _ColorMatrixFilter,
			
			_colorProps = ["redMultiplier","greenMultiplier","blueMultiplier","alphaMultiplier","redOffset","greenOffset","blueOffset","alphaOffset"],
			
			_parseColorFilter = function(t, v, pg) {
				if (!_ColorFilter) {
					_ColorFilter = (window.ColorFilter || window.createjs.ColorFilter);
					if (!_ColorFilter) {
						throw("EaselPlugin error: The EaselJS ColorFilter JavaScript file wasn't loaded.");
					}
				}
				var filters = t.filters || [],
					i = filters.length, 
					c, s, e, a, p;
				while (--i > -1) {
					if (filters[i] instanceof _ColorFilter) {
						s = filters[i];
						break;
					}
				}
				if (!s) {
					s = new _ColorFilter();
					filters.push(s);
					t.filters = filters;
				}
				e = s.clone();
				if (v.tint != null) {
					c = _parseColor(v.tint);
					a = (v.tintAmount != null) ? Number(v.tintAmount) : 1;
					e.redOffset = Number(c[0]) * a;
					e.greenOffset = Number(c[1]) * a;
					e.blueOffset = Number(c[2]) * a;
					e.redMultiplier = e.greenMultiplier = e.blueMultiplier = 1 - a;
				} else {
					for (p in v) {
						if (p !== "exposure") if (p !== "brightness") {
							e[p] = Number(v[p]);
						}
					}
				}
				if (v.exposure != null) {
					e.redOffset = e.greenOffset = e.blueOffset = 255 * (Number(v.exposure) - 1);
					e.redMultiplier = e.greenMultiplier = e.blueMultiplier = 1;
				} else if (v.brightness != null) {
					a = Number(v.brightness) - 1;
					e.redOffset = e.greenOffset = e.blueOffset = (a > 0) ? a * 255 : 0;
					e.redMultiplier = e.greenMultiplier = e.blueMultiplier = 1 - Math.abs(a);
				}
				i = 8;
				while (--i > -1) {
					p = _colorProps[i];
					if (s[p] !== e[p]) {
						pg._addTween(s, p, s[p], e[p], "easel_colorFilter");
					}
				}
				pg._overwriteProps.push("easel_colorFilter");
				if (!t.cacheID) {
					throw("EaselPlugin warning: for filters to display in EaselJS, you must call the object's cache() method first. "+t); 
				}
			},

			_idMatrix = [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0],
			_lumR = 0.212671,
			_lumG = 0.715160,
			_lumB = 0.072169,

			_applyMatrix = function(m, m2) {
				if (!(m instanceof Array) || !(m2 instanceof Array)) {
					return m2;
				}
				var temp = [],
					i = 0,
					z = 0,
					y, x;
				for (y = 0; y < 4; y++) {
					for (x = 0; x < 5; x++) {
						z = (x === 4) ? m[i + 4] : 0;
						temp[i + x] = m[i]   * m2[x] + m[i+1] * m2[x + 5] +	m[i+2] * m2[x + 10] + m[i+3] * m2[x + 15] +	z;
					}
					i += 5;
				}
				return temp;
			},

			_setSaturation = function(m, n) {
				if (isNaN(n)) {
					return m;
				}
				var inv = 1 - n,
					r = inv * _lumR,
					g = inv * _lumG,
					b = inv * _lumB;
				return _applyMatrix([r + n, g, b, 0, 0, r, g + n, b, 0, 0, r, g, b + n, 0, 0, 0, 0, 0, 1, 0], m);
			},

			_colorize = function(m, color, amount) {
				if (isNaN(amount)) {
					amount = 1;
				}
				var c = _parseColor(color),
					r = c[0] / 255,
					g = c[1] / 255,
					b = c[2] / 255,
					inv = 1 - amount;
				return _applyMatrix([inv + amount * r * _lumR, amount * r * _lumG, amount * r * _lumB, 0, 0, amount * g * _lumR, inv + amount * g * _lumG, amount * g * _lumB, 0, 0, amount * b * _lumR, amount * b * _lumG, inv + amount * b * _lumB, 0, 0, 0, 0, 0, 1, 0], m);
			},

			_setHue = function(m, n) {
				if (isNaN(n)) {
					return m;
				}
				n *= Math.PI / 180;
				var c = Math.cos(n),
					s = Math.sin(n);
				return _applyMatrix([(_lumR + (c * (1 - _lumR))) + (s * (-_lumR)), (_lumG + (c * (-_lumG))) + (s * (-_lumG)), (_lumB + (c * (-_lumB))) + (s * (1 - _lumB)), 0, 0, (_lumR + (c * (-_lumR))) + (s * 0.143), (_lumG + (c * (1 - _lumG))) + (s * 0.14), (_lumB + (c * (-_lumB))) + (s * -0.283), 0, 0, (_lumR + (c * (-_lumR))) + (s * (-(1 - _lumR))), (_lumG + (c * (-_lumG))) + (s * _lumG), (_lumB + (c * (1 - _lumB))) + (s * _lumB), 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1], m);
			},

			_setContrast = function(m, n) {
				if (isNaN(n)) {
					return m;
				}
				n += 0.01;
				return _applyMatrix([n,0,0,0,128 * (1 - n), 0,n,0,0,128 * (1 - n), 0,0,n,0,128 * (1 - n), 0,0,0,1,0], m);
			},

			_parseColorMatrixFilter = function(t, v, pg) {
				if (!_ColorMatrixFilter) {
					_ColorMatrixFilter = (window.ColorMatrixFilter || window.createjs.ColorMatrixFilter);
					if (!_ColorMatrixFilter) {
						throw("EaselPlugin error: The EaselJS ColorMatrixFilter JavaScript file wasn't loaded.");
					}
				}
				var filters = t.filters || [],
					i = filters.length,
					matrix, startMatrix, s, e, p;
				while (--i > -1) {
					if (filters[i] instanceof _ColorMatrixFilter) {
						s = filters[i];
						break;
					}
				}
				if (!s) {
					s = new _ColorMatrixFilter(_idMatrix.slice());
					filters.push(s);
					t.filters = filters;
				}
				e = s.clone();
				startMatrix = matrix = e.matrix || _idMatrix;
				if (v.colorize != null) {
					matrix = _colorize(matrix, v.colorize, Number(v.colorizeAmount));
				}
				if (v.contrast != null) {
					matrix = _setContrast(matrix, Number(v.contrast));
				}
				if (v.hue != null) {
					matrix = _setHue(matrix, Number(v.hue));
				}
				if (v.saturation != null) {
					matrix = _setSaturation(matrix, Number(v.saturation));
				}

				i = matrix.length;
				while (--i > -1) {
					if (matrix[i] !== startMatrix[i]) {
						pg._addTween(startMatrix, i, startMatrix[i], matrix[i], "easel_colorMatrixFilter");
					}
				}

				pg._overwriteProps.push("easel_colorMatrixFilter");
				if (!t.cacheID) {
					throw("EaselPlugin warning: for filters to display in EaselJS, you must call the object's cache() method first. "+t);
				}

				pg._matrix = startMatrix;
			},
			
			_parseColor = function(color) {
				if (color === "" || color == null || color === "none") {
					return _colorLookup.transparent;
				} else if (_colorLookup[color]) {
					return _colorLookup[color];
				} else if (typeof(color) === "number") {
					return [color >> 16, (color >> 8) & 255, color & 255];
				} else if (color.charAt(0) === "#") {
					if (color.length === 4) { //for shorthand like #9F0
						color = "#" + color.charAt(1) + color.charAt(1) + color.charAt(2) + color.charAt(2) + color.charAt(3) + color.charAt(3);
					}
					color = parseInt(color.substr(1), 16);
					return [color >> 16, (color >> 8) & 255, color & 255];
				}
				return color.match(_numExp) || _colorLookup.transparent;
			},
			_colorLookup = {aqua:[0,255,255],
							lime:[0,255,0],
							silver:[192,192,192],
							black:[0,0,0],
							maroon:[128,0,0],
							teal:[0,128,128],
							blue:[0,0,255],
							navy:[0,0,128],
							white:[255,255,255],
							fuchsia:[255,0,255],
							olive:[128,128,0],
							yellow:[255,255,0],
							orange:[255,165,0],
							gray:[128,128,128],
							purple:[128,0,128],
							green:[0,128,0],
							red:[255,0,0],
							pink:[255,192,203],
							cyan:[0,255,255],
							transparent:[255,255,255,0]};
		
		p.constructor = EaselPlugin;
		EaselPlugin.API = 2;
		EaselPlugin.version = "0.1.3";
		
		p._onInitTween = function(target, value, tween) {
			this._target = target;
			var p, pt, tint, colorMatrix;
			for (p in value) {

				if (p === "colorFilter" || p === "tint" || p === "tintAmount" || p === "exposure" || p === "brightness") {
					if (!tint) {
						_parseColorFilter(target, value.colorFilter || value, this);
						tint = true;
					}

				} else if (p === "saturation" || p === "contrast" || p === "hue" || p === "colorize" || p === "colorizeAmount") {
					if (!colorMatrix) {
						_parseColorMatrixFilter(target, value.colorMatrixFilter || value, this);
						colorMatrix = true;
					}

				} else if (target[p] != null) {
					this._firstPT = pt = {_next:this._firstPT, t:target, p:p, f:(typeof(target[p]) === "function"), n:p, pr:0, type:0};
					pt.s = (!pt.f) ? parseFloat(target[p]) : target[ ((p.indexOf("set") || typeof(target["get" + p.substr(3)]) !== "function") ? p : "get" + p.substr(3)) ]();
					pt.c = (typeof(value[p]) === "number") ? value[p] - pt.s : (typeof(value[p]) === "string") ? parseFloat(value[p].split("=").join("")) : 0;
					
					if (pt._next) {
						pt._next._prev = pt;
					}
				}
				
			}
			return true;
		};
		
		//gets called every time the tween updates, passing the new ratio (typically a value between 0 and 1, but not always (for example, if an Elastic.easeOut is used, the value can jump above 1 mid-tween). It will always start and 0 and end at 1.
		p.setRatio = function(v) {
			var pt = this._firstPT,
				min = 0.000001,
				val;
			while (pt) {
				val = pt.c * v + pt.s;
				if (pt.r) {
					val = (val + ((val > 0) ? 0.5 : -0.5)) >> 0; //about 4x faster than Math.round()
				} else if (val < min && val > -min) {
					val = 0;
				}
				if (pt.f) {
					pt.t[pt.p](val);
				} else {
					pt.t[pt.p] = val;
				}
				pt = pt._next;
			}
			if (this._target.cacheID) {
				this._target.updateCache();
			}
		};
		
		TweenPlugin.activate([EaselPlugin]);
		return EaselPlugin;
		
	}, true);

}); if (window._gsDefine) { _gsQueue.pop()(); }