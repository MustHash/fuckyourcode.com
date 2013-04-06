(function () {

    /*
    Fuck Douglas Crockford!
    In a nice way... He's a good guy. I like him!

    but fuck jslint!
    */

    'use strict';

    /**
     * [utils description]
     * @type {Object}
     */
    var utils = {
        addEvent : (function () {
            if (window.addEventListener) {
                return function (el, evt, fn) {
                    return el.addEventListener(evt, fn, false);
                };
            } else if (window.attachEvent) {
                return function (el, evt, fn) {
                    evt = (evt.slice(0, 1).toUpperCase() + evt.substr(1));
                    return el.attachEvent('on' + evt, function () {
                        fn.apply(el, window.Event);
                    });
                };
            } else {
                return function (el, evt, fn) {
                    evt = (evt.slice(0, 1).toUpperCase() + evt.substr(1));
                    el[evt] = fn;
                    return el;
                };
            }
        }()),
        proxy : function (fn, context) {
            var args = [].slice.call(arguments, 2);
            return function () {
                fn.apply(context, args.concat([].slice.call(arguments, 0)));
            };
        }
    },
    /**
     * [quotes description]
     * @type {Object}
     */
    quotes = {
        url: 'quotes.json',
        $placeholder: document.querySelector('.placeholder'),
        $$placeholder: moofx(document.querySelector('.placeholder')),
        list: [],
        seen: [],
        current: null,
        refresh: function (index, cb) {
            var marginTop = 0 - this.$placeholder.offsetHeight / 2 + 20;

            this.$$placeholder.animate({
                'opacity': 0,
                'margin-top': marginTop + 'px'
            }, {
                duration : '0.5s',
                equation: 'ease-in-out',
                callback: utils.proxy(function () {
                    this.unset();
                    this.set(index);
                    if (cb) { cb(); }
                }, this)
            });


        },
        load: function (cb) {
            var request = new XMLHttpRequest();

            console.log('Fuck your console, too');
            request.onload = utils.proxy(function (req) {
                if (req.status === 200 && req.readyState === 4) {
                    this.list = JSON.parse(req.responseText);
                    return cb(null, this.list);
                }
                return cb(req);
            }, this, request);
            request.open("GET", this.url, true);
            request.send();
        },
        set: function (idx) {
            var index       = (this.list[idx]) ? idx : this.random(),
                fuckRegex   = /(^|\s)(fuck)/ig,
                quote       = this.list[index],
                marginTop   = 0,
                marginTopBefore = 0;

            this.current = index;

            // print quote into the dom element
            this.$placeholder.innerHTML = quote.replace(fuckRegex, '$1<span>$2</span>');

            marginTop = - this.$placeholder.offsetHeight / 2;
            marginTopBefore = marginTop - 20;

            this.$$placeholder.style({
                'opacity': 0,
                'margin-top': marginTopBefore + 'px'
            }).animate({
                'opacity': 1,
                'margin-top': marginTop + 'px'
            }, {
                duration : '0.5s',
                equation: 'ease-in-out'
            });

            return this;
        },
        unset : function () {
            var children = [].slice.call(this.$placeholder.childNodes, 0),
                i = children.length - 1;

            for (i; i >= 0; i -= 1) {
                this.$placeholder.removeChild(children[i]);
            }

            this.current = null;

            return this;
        },
        mark: function (idx) {
            var len = this.seen.length,
                max = 7;

            if (len === max) { this.seen.shift(); }
            this.seen.push(idx);

            return this;
        },
        random: function () {
            var index = 0;

            do { index = Math.floor(Math.random() * this.list.length); }
            while (this.seen.indexOf(index) !== -1);

            return index;
        }
    },
    /**
     * [router description]
     * @type {Object}
     */
    router = {
        on: function (fn) {
            window.onpopstate = fn;
        },
        set: function (index) {
            var stateObj = { 'index': index };

            if (history && typeof history.pushState === 'function') {
                history.pushState(stateObj, '', index);
            } else {
                location.hash = ((/[0-9]+/).test(location.hash)) ?
                        location.hash.replace(/\!\/*\d+/, '!/' + index) :
                        '!/' + index;
            }

            return this;
        },
        replace: function (index) {
            var stateObj = { 'index': index };
            if (history && typeof history.replaceState === 'function') {
                history.replaceState(stateObj, '', index);
            } else {
                location.hash = ((/[0-9]+/).test(location.hash)) ?
                        location.hash.replace(/\!\/*\d+/, '!/' + index) :
                        '!/' + index;
            }
        },
        get: function () {
            var matches = window.location.href.match(/[0-9]+/),
                index   = ((matches && matches.length) || matches === 0) ?
                        matches[matches.length - 1] :
                        quotes.random();

            return parseInt(index, 10);
        }
    },
    /**
     * [themes description]
     * @type {Object}
     */
    themes = {
        list: ['light', 'yellow', 'green', 'blue', 'magenta'],
        prevIndex: null,
        random: function () {
            return Math.floor(Math.random() * (this.list.length));
        },
        set: function (el) {
            var index = 0;

            el = el || document.body;

            // dont ever repeat the same theme
            do { index = this.random(); }
            while (index === this.prevIndex);

            this.prevIndex = index;

            el.className = 'theme-' + this.list[index];

            return this;
        }
    },

    $refresh = document.querySelector('.refresh')

    utils.addEvent($refresh, 'click', function (evt) {
        evt.preventDefault();
        quotes.refresh(null, function () {
            themes.set();
            quotes.mark(quotes.current);
            router.set(quotes.current)
        });
    });

    quotes.load(function () {
        var index = router.get();
        quotes.set(index);
        quotes.mark(index);
        themes.set();
        router.replace(quotes.current)

        router.on(function () {
            index = history.state.index;
            quotes.unset();
            quotes.refresh(index);
            quotes.mark(index);
            themes.set();
        });

    });

}());
