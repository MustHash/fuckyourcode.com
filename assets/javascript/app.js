(function () {

    var $body = document.querySelector('body'),
        $placeholder = document.querySelector('.placeholder'),
        $refresh = document.querySelector('.refresh'),
        $$placeholder = moofx($placeholder),
        quotes = [],

        // stores previous quotes
        seen_quotes = [],

        // stores previous loaded theme
        prev_theme_index = null,

        // array of theme names, to apply a 'theme-*' class to body
        themes = ['light', 'yellow', 'green', 'blue', 'magenta'],

        getRoute = function () {
            var matches = window.location.href.match(/[0-9]+/),
                index = (matches && matches.length) ? matches[matches.length - 1] : 0;

            return parseInt(index, 10);
        },

        setRoute = function (index) {
            var stateObj = { 'index': index };

            if (history && typeof history.pushState === 'function') {
                history.pushState(stateObj, '', index);
            } else {
                window.location.hash = location.hash.replace(/(\!\/)*\d+/, '!/' + index);
            }
        },

        loadQuotes = function (url, cb) {
            console.log('Fuck your console, too');

            var request = new XMLHttpRequest();
            request.onload = function () {

                if (this.status === 200 && this.readyState === 4) {
                    return cb(null, this.responseText);
                }

                return cb(err);
            };
            request.open("GET", url, true);
            request.send();
        },

        seenQuote = function( index ) {
            var array_len = seen_quotes.length,
                max = 7;

            if ( array_len === max )
                seen_quotes.splice(0, 1);

            seen_quotes.push( index );

        },

        // calculate the index of the theme randomnly
        generateTheme = function() {
            var themes_length = themes.length;

            return Math.floor(Math.random() * (themes_length));
        },

        // generate quote index
        generateQuote = function() {
            var index;

            do {
               index = Math.floor(Math.random()*quotes.length);
            } while( seen_quotes.indexOf(index) != -1 );

            return index;
        },

        setQuote = function (idx) {
            var index = (idx && quotes[idx]) ? idx : generateQuote(),
                quote = quotes[index].replace(/(^|\s)(fuck)/ig, '$1<span>$2</span>'),

                theme_index = 0,
                marginTop,
                marginTopBefore;

            // add to seen quote
            seenQuote(index);
            setRoute(index);

            // dont ever repeat the same theme
            do {
                theme_index = generateTheme();
            } while (theme_index === prev_theme_index);

            prev_theme_index = theme_index;

            // add class to body
            $body.className = 'theme-'+themes[theme_index];

            // print quote into the dom element
            $placeholder.innerHTML = quote;

            marginTop = - $placeholder.offsetHeight / 2;
            marginTopBefore = marginTop - 20;

            $$placeholder.style({'opacity':0, 'margin-top': marginTopBefore + 'px'});
            $$placeholder.animate({
                'opacity': 1,
                'margin-top': marginTop + 'px'
            }, {
                duration : '0.5s',
                equation: 'ease-in-out'
            });
        },

        unsetQuote = function () {
            var children = [].slice.call($placeholder.childNodes, 0),
                i = children.length - 1;

            for (i; i >= 0; i -= 1) {
                children[i].parentNode.removeChild(children[i]);
            }
        };

    loadQuotes('quotes.json', function (err, data) {
        quotes = JSON.parse(data);
        route = getRoute();
        setQuote(route);
    });

    $refresh.addEventListener('click', function (evt) {
        var marginTop = - $placeholder.offsetHeight / 2 + 20;

        evt.preventDefault();

        $$placeholder.animate({
            'opacity': 0,
            'margin-top': marginTop + 'px'
        }, {
            duration : '0.5s',
            equation: 'ease-in-out',
            callback: function () {
                unsetQuote();
                setQuote();
            }
        });
    });

}());
