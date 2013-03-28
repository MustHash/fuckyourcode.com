(function () {

    var $placeholder = document.querySelector('.placeholder'),
        $refresh = document.querySelector('.refresh'),
        $$placeholder = moofx($placeholder),
        quotes = [],
        current,

        getRoute = function () {
            var matches = window.location.href.match(/[0-9]+/),
                index = matches[matches.length - 1];

            return parseInt(index, 10);
        },

        setRoute = function (index) {
            var stateObj = { 'index': index };
            history.pushState(stateObj, '', index);
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
                node = document.createTextNode(quotes[index]);

            setRoute(index);
            $placeholder.appendChild(node);

            $$placeholder.style({'opacity':0, 'margin-top': '-20px'});
            $$placeholder.animate({
                'opacity': 1,
                'margin-top': '0px'
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
        
        evt.preventDefault();

        $$placeholder.animate({
            'opacity': 0,
            'margin-top': '20px'
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
