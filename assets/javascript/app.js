(function () {

    var $body = document.querySelector('body'),
        $placeholder = document.querySelector('.placeholder'),
        $refresh = document.querySelector('.refresh'),
        $$placeholder = moofx($placeholder),
        quotes = [],

        // array of theme names, to apply a 'theme-*' class to body
        themes = ['light', 'dark', 'green', 'magenta'],

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
                window.location.hash = location.hash.replace(/(\!\/)*\d+/, '!/' + index)
            }
        },

        loadQuotes = function (url, cb) {
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

        setQuote = function (idx) {
            var index = (idx && quotes[idx]) ? idx : Math.floor(Math.random()*quotes.length),
                quote = quotes[index].replace(/(^|\s)(fuck)(\s|$)/ig, '$1<span>$2</span>$3'),

                // calculate the index of the theme randomnly
                themes_length = themes.length,
                theme_index = Math.floor(Math.random() * (themes_length)),
                marginTop,
                marginTopBefore;

            setRoute(index);
            $placeholder.innerHTML = quote;

            marginTop = - $placeholder.offsetHeight / 2;
            marginTopBefore = marginTop - 20;

            // add class to body
            $body.className = 'theme-'+themes[theme_index];

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
            };
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
