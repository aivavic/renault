window.app.view = (function () {
    var currentWidget;

    public = {
        renderPage: function (page) {
            app.logger.prefix = '[app][view]';
            
            

            //no widgets
            if (!page.body)
                return false;

            app.page = page;
            document.title = app.page.title;
            app.page.widgets = getWidgetsFromBody(app.page.body);

            this.helper.preffix = app.config.frontend_app_web_url + '/' + app.router.locale

            //clear all
            app.container.html('');

            if (undefined != twttr && undefined != twttr.events && undefined != twttr.events._handlers) {
                twttr.events.unbind('tweet');
            }
            
            selectMenuItem();
            changeHomeUrl();
            renderWidgets();
        },
        getCurrentWidget: function () {
            return currentWidget;
        },
        beforeWidget: function (w) {
            app.logger.prefix = '[widget][' + w.widgetId + ']';
            app.logger.var(w);
        },
        afterWidget: function (w) {
            app.page.widgets[w.widgetId].rendered = true;
            app.logger.prefix = '';
        },
        helper: {
            preffix: null
        }

    };

    function getWidgetsFromBody(body) {
        var widgets = {};
        var obj = JSON.parse(body);
        var index = 0;

        $.each(obj, function (k, v) {
            var wname = getWnameFromWidget(v);

            if (!$.isEmptyObject(v) && 'tab_title' != k && '___' + wname + '___' != k) {

                var wid = wname + '__' + index;
                index++;
                widgets[wid] = v;
                widgets[wid].widgetId = wid;
                widgets[wid].widgetName = wname;
            }
        });

        return widgets;
    }

    function renderWidgets() {

        var callback = function () {
            //app.logger.text('call interval ');

            //render widgets array            
            var process = false;

            $.each(app.page.widgets, function (k, v) {
                //if true ...                               
                //if false break
                //if undefined run, set false ,break

                if (false === app.page.widgets[k].rendered) {
                    process = true;
                    return false;
                }

                if (undefined === app.page.widgets[k].rendered) {
                    app.page.widgets[k].rendered = false;
                    process = true;
                    currentWidget = app.page.widgets[k];
                    $.getScript(app.config.frontend_app_web_url + '/js/app/widgets/' + v.widgetName + '/widget.js');
                    return false;
                }
            });

            if (false === process) {
                app.logger.text('clear interval');
                clearInterval(window.intervalId)

                afterPageRender();
                app.afterPageRender();
            }
        };

        window.intervalId = setInterval(callback, 200);
    }

    function selectMenuItem() {
        $("nav").find(".nav-active").removeClass("nav-active");
        $('a[href*="' + location.pathname + '"]').addClass("nav-active");
    }

    function getWnameFromWidget(v) {
        var wname;

        $.each(v, function (k, v) {
            //app.logger.text(k);
            if (k.match(/___(.+)___/)) {
                wname = k.match(/___(.+)___/)[1];
            }
        });

        return wname;
    }

    function afterPageRender() {
        //add ga
        //$.getScript(app.config.frontend_app_web_url + '/js/lib/google.analytics.js');
    }

    function changeHomeUrl() {
        if ('ru' == app.router.locale && 'page' == app.router.controller && 'view' == app.router.action && 'home' == app.router.slug) {            
            // Change url            
            window.history.pushState(null, null, '/');
        }

        if ('en' == app.router.locale && 'page' == app.router.controller && 'view' == app.router.action && 'home' == app.router.slug) {
            // Change url            
            window.history.pushState(null, null, '/en');
        }
    }

    return public;
})()