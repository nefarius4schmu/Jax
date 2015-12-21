/**
 * JAX v1.1.1
 * jQuery Plugin
 * Shortcut framework for jQuery's ajax function
 * Copyright 2015 Steffen Lange
 * Licensed under the MIT license
 *
 * @updated 21.12.2015
 * @created 17.11.2015
 */
!function($, jax) {
    if (typeof $ !== 'undefined') jax($);
    else throw new Error('Jax requires jQuery');

}(jQuery, function($){
    'use strict';

    var $window = $(window),
        jaxLazyItems = [];

    /**
     * init lazy load scroll event handler
     */
    $window.scroll(function(){
        $.each(jaxLazyItems, function(ind, a){
            if(a && !a.isInViewport.call(a, a.options.lazyOffset)){
                if(a.jax === 'bs.tab.lazy'){
                    // bs tab lazy load
                    a.MODES['bs.tab'].call(a);
                }else{
                    // lazy load
                    a.$element.data('jaxLazyLoaded', true);
                    a.ajax();
                }
                jaxLazyItems.splice(ind, 1);
            }
        });
    });

    /**
     * Jax constructor
     * @param element HTMLElement
     * @param options object
     * @param callback function
     * @constructor
     */
    var Jax = function(element, options, callback){
        this.init(element, options, callback);
    };


    Jax.prototype.init = function(element, options, callback){
        this.element = element;
        this.$element = $(element);
        this.options = options;
        this.ajaxOptions = options.ajaxOptions || {};
        this.settings = {};
        this.state = {
            loading: false,
            loaded: false,
            error: false
        };

        //console.log("create Jax", this, options);

        /* parse settings and options  */
        var option;

        // callback
        option = callback || options.jaxCallback || options.callback;
        switch(typeof option){
            case 'string':
                if(typeof window[option] === 'function') this.callback = window[option];
                break;
            case 'function':
                this.callback = option;
                break;
            default:
                // if event default noop has been overwritten
                throw new Error('Jax-Error: failed to init callback');
        }

        // ajax method
        option = options.jaxMethod || options.method;
        if(option) this.settings.method = option;
        else throw new Error('Jax-Error: missing ajax method');

        // ajax url
        option = options.jaxUrl || options.url;
        if(option) this.settings.url = option;
        else throw new Error('Jax-Error: missing ajax url');

        // ajax data
        this.settings.data = options.jaxData || options.data || {};

        // parser
        option = options.jaxParse || options.parse;
        var t = typeof option;
        if(t === 'string' && Jax.PARSER[option]) this.parser = Jax.PARSER[option].bind(this);
        else if(t === 'function') this.parser = this.customParser(option);
        else throw new Error('Jax-Error: unknown parser');

        // after call options
        this.options.afterCall = {
            set: options.set == true || options.jaxAfter === 'set' || options.after === 'set',
            append: options.append == true || options.jaxAfter === 'append' || options.after === 'append',
            prepend: options.prepend == true || options.jaxAfter === 'prepend' || options.after === 'prepend',
            replace: options.replace == true || options.jaxAfter === 'replace' || options.after === 'replace'
        };

        // different target
        option = options.jaxTarget || options.target || element;
        this.target = option;
        this.$target = $(option);

        // classes
        this.settings.loading = options.jaxLoading || options.loading || false;
        this.settings.loaded = options.jaxLoaded || options.loaded || false;
        this.settings.error = options.jaxError || options.error || false;

        // loader
        this.$loader = $(options.jaxLoader || options.loader || (options.loadOnTarget ? this.$target : this.$element));

        // event type
        this.settings.event = options.jaxEvent || options.event || false;

        // init jax based on mode
        option = options.jax || options.mode || options.autoMode;
        if(typeof option === 'string' && Jax.MODES[option]) Jax.MODES[option].call(this);
        else throw new Error('failed to init jax, unknown mode');
    };

    /**
     * current version
     * @type {string}
     */
    Jax.VERSION = '1.1.0';

    /**
     * helper
     * @type {{noop: Function}}
     * @private
     */
    Jax._ = {
        noop: function(){}
    };

    /**
     * Default Settings
     * @type {{method: string, parse: string, loading: string, autoMode: string, loadOnTarget: boolean, once: boolean, abortOnRecall: boolean, lazyOffset: number, ajaxDelay: number, callback: (Jax._.noop|Function), parseBoolValid: string, parseBoolTrue: string}}
     */
    Jax.DEFAULTS = {
        method: 'get',          // GET|POST             ajax method
        parse: 'html',          // <parser name>        jax parser
        loading: 'loading',     // <className>|false    class on target if loading
        loaded: 'loaded',       // <className>|false    class on target if loaded
        error: 'error',         // <className>|false    class on target if loading failed
        autoMode: 'load',       // <mode>|false         behaviour if no mode is given
        loadOnTarget: true,     // true|false           set loader on given target
        once: true,             // true|false           can only be loaded once
        abortOnRecall: true,    // true|false           abort past ajax call
        lazyOffset: false,      // int|false            y-offset on lazy load
        delay: 50,              // int|false            delay ajax calls (can boost page load)
        callback: Jax._.noop,   // function|string      callback method when loaded
        parseBoolValid: '0|1|true|false',   // string regex     valid response values for bool parser
        parseBoolTrue: '0|true'             // string regex     response values for bool parser to evaluate to true
    };

    //noinspection JSValidateJSDoc,JSClosureCompilerSyntax
    /**
     * Jax Modes - ajax call behavior
     * @type {{call: Function, load: Function, append: Function, prepend: Function, replace: Function, click: Function, lazy: Function, bs.tab: Function, bs.tab.lazy: Function}}
     */
    Jax.MODES = {
        /**
         * perform default ajax call
         * response will be passed to callback function
         */
        call: function(){
            this.ajax();
        },
        /**
         * shortcut function to set option
         * perform ajax call and set content to target element using jQuery's html function
         */
        load: function(){
            this.ajax({set: true});
        },
        /**
         * shortcut function to append option
         * perform ajax call and append content to target element using jQuery's append function
         */
        append: function(){
            this.ajax({append: true});
        },
        /**
         * shortcut function to prepend option
         * perform ajax call and prepend content to target element using jQuery's prepend function
         */
        prepend: function(){
            this.ajax({prepend: true});
        },
        /**
         * shortcut function to replace option
         * perform ajax call and replace target element with content using jQuery's replaceWith function
         */
        replace: function(){
            this.ajax({replace: true});
        },
        /**
         * perform ajax call on target's click event
         */
        click: function(){
            var _this = this;
            _this.$element.on('click', function(e){
                e.preventDefault();
                _this.ajax();
            });
        },
        event: function(){
            var _this = this;
            if(!_this.options.event) throw new Error('Jax-Error: missing event type');
            _this.$element.on(_this.options.event, function(e){
                //console.log("event fired", _this.options.event);
                //e.preventDefault();
                _this.ajax();
            });
        },
        /**
         * perform ajax call when target is in viewport
         */
        lazy: function(){
            var _this = this;
            //console.log("init lazy", _this);
            // prepare ajax call
            if(!_this.isInViewport(_this.options.lazyOffset)){
                //console.log("instant init", _this.options.lazyOffset);
                // load if already visible
                _this.$element.data('jaxLazyLoaded', true);
                _this.ajax();
            }else{
                // add to jax lazy load event items
                jaxLazyItems[jaxLazyItems.length] = _this;
            }
        },
        /**
         * specialized on bootstrap tabs
         * perform ajax call tab is active and visible or if 'shown.bs.tab' event fires
         */
        'bs.tab': function(){
            var _this = this,
                $this = _this.$element,
                $tab = $($this.attr('href'));
            if($tab.length === 0) throw new Error('failed to init jax bs.tab event');

            if($this.parent().hasClass('active')){
                // load if already visible
                $this.data('jaxBsTabLoaded', true);
                _this.ajax();
            }else {
                // init ajax load on bs tab shown event
                $this.on('shown.bs.tab', function (e) {
                    var $self = $(e.target);
                    if ($self.data('jaxBsTabLoaded')) return false;
                    $self.data('jaxBsTabLoaded', true);
                    _this.ajax();
                });
            }
        },
        /**
         * extension of 'bs.tab' mode
         * initializes only if tab is in viewport
         */
        'bs.tab.lazy': function(){
            var _this = this;
            // call bs.tab event if already visible
            if(!_this.isInViewport(_this.options.lazyOffset)){
                Jax.MODES['bs.tab'].call(_this);
            }else{
                // init ajax lazy load scroll event
                jaxLazyItems[jaxLazyItems.length] = _this;
            }
        }
    };

    /**
     * Jax-Parser for Ajax-Message
     * @type {{bool: Function, int: Function, float: Function, html: Function, json: Function}}
     */
    Jax.PARSER = {
        /**
         * parse boolean value using regex to determine valid values
         * see: Jax.DEFAULTS.parseBoolValid, Jax.DEFAULTS.parseBoolTrue
         * @param msg
         * @returns {{value: boolean|null, valid: boolean, raw: *}}
         */
        bool: function(msg){
            var valid = !!msg.match(new RegExp('^'+this.options.parseBoolValid+'$', 'i'));
            return {
                value: valid ? !!msg.match(new RegExp('^'+this.options.parseBoolTrue+'$', 'i')) : null,
                valid: valid,
                raw: msg
            }
        },
        /**
         * parse int value using build in parseInt function
         * @param msg
         * @returns {{value: Number|NaN, valid: boolean, raw: *}}
         */
        int: function(msg){
            var v = parseInt(msg);
            return {
                value: v,
                valid: !isNaN(v),
                raw: msg
            }
        },
        /**
         * parse float value using build in parseFloat function
         * @param msg
         * @returns {{value: Number|NaN, valid: boolean, raw: *}}
         */
        float: function(msg){
            var v = parseFloat(msg);
            return {
                value: v,
                valid: !isNaN(v),
                raw: msg
            }
        },
        /**
         * pass-through, except undefined message
         * @param msg
         * @returns {{value: *|null, valid: boolean, raw: *}}
         */
        html: function(msg){
            var valid = typeof msg !== 'undefined' && msg != null;
            return {
                value: valid ? msg : null,
                valid: valid,
                raw: msg
            }
        },
        /**
         * parse and convert to JSON object using jQuery's parseJSON function
         * @param msg
         * @returns {{value: *|null, valid: boolean, raw: *}}
         */
        json: function(msg){
            var valid = true, v;
            try {
                v = $.parseJSON(msg)
            } catch (e) {
                v = null;
                valid = false;
            }
            return {
                value: v,
                valid: valid,
                raw: msg
            }
        }
    };

    /**
     * return custom parser function
     * @param parser function
     * @returns {Function}
     */
    Jax.prototype.customParser = function(parser){
        return function(msg){
            var v = parser(msg);
            return {
                value: v,
                valid: typeof v !== 'undefined',
                raw: msg
            };
        }
    };

    /**
     * perform ajax call
     * @param callSettings object
     */
    Jax.prototype.ajax = function(callSettings){
        callSettings = callSettings || {};

        var _this = this,
            delay = _this.options.delay || 0,
            xhr = _this.$loader.data("jaxXHR"),
            data = $.extend({}, this.ajaxOptions, {
                method: _this.settings.method,
                url: _this.settings.url,
                data: _this.settings.data
            });

        // ajax called once
        //console.log('jax', _this);
        if(_this.isLoaded() && _this.options.once) return;
        // abort old ajax call
        else if(xhr && _this.isLoading() && _this.options.abortOnRecall) xhr.abort();

        // reset state
        _this.error(false);
        _this.loaded(false);
        _this.loading(true);

        //delay
        setTimeout(function(){

            _this.$loader.data("jaxXHR",
                $.ajax(data).done(function(msg) {
                    _this.response({
                        success: true,
                        content: _this.parser(msg),
                        data: data
                    }, callSettings);

                }).fail(function (xhr, textStatus, errorThrown) {
                    if(textStatus !== 'abort') {
                        _this.error(true);
                        _this.response({
                            success: false,
                            data: data,
                            message: errorThrown
                        }, callSettings);
                    }
                }).always(function () {
                    _this.loading(false);
                    _this.loaded(true);
                    _this.$loader.removeData("jaxXHR");
                })
            );
        }, delay);
    };

    /**
     * ajax call response
     * @param response object
     * @param callSettings object
     */
    Jax.prototype.response = function(response, callSettings){
        var _this = this,
            afterCall = _this.options.afterCall;

        // apply settings on success
        if(response.success && response.content.valid){
            //console.log("after call", _this.$target, callSettings, afterCall);
            if(callSettings.set || afterCall.set) _this.$target.html(response.content.value);
            else if(callSettings.append || afterCall.append) _this.$target.append(response.content.value);
            else if(callSettings.prepend || afterCall.prepend) _this.$target.prepend(response.content.value);
            else if(callSettings.replace || afterCall.replace) _this.$target.replaceWith(response.content.value);
        }
        // callback
        _this.callback.call(_this.target, response);
    };

    /**
     * toggle targets loading state
     * @param force boolean
     */
    Jax.prototype.loading = function(force){
        this.state.loading = typeof force === 'boolean' ? force : !this.isLoading();
        if(typeof this.settings.loading === 'string') this.$loader.toggleClass(this.settings.loading, force);
    };
    /**
     * toggle targets loaded state
     * @param force boolean
     */
    Jax.prototype.loaded = function(force){
        this.state.loaded = typeof force === 'boolean' ? force : !this.isLoaded();
        if(typeof this.settings.loaded === 'string') this.$loader.toggleClass(this.settings.loaded, force);
    };
    /**
     * toggle targets error state
     * @param force boolean
     */
    Jax.prototype.error = function(force){
        this.state.error = typeof force === 'boolean' ? force : !this.isError();
        if(typeof this.settings.error === 'string') this.$loader.toggleClass(this.settings.error, force);
    };
    /**
     * returns targets loading state
     */
    Jax.prototype.isLoading = function(){
        return this.state.loading;
    };
    /**
     * returns targets loaded state
     */
    Jax.prototype.isLoaded = function(){
        return this.state.loaded;
    };
    /**
     * returns targets error state
     */
    Jax.prototype.isError = function(){
        return this.state.error;
    };

    /**
     * check if target is in viewport
     * @param offset
     * @returns {boolean}
     */
    Jax.prototype.isInViewport = function(offset){
        var o = offset || 0;
        return $window.height()+$window.scrollTop()+o <= this.$element.offset().top;
    };


    // JAX PLUGIN DEFINITION
    // ==========================

    function Plugin(option, callback) {
        //console.log("init Jax", this, option, callback);
        return this.each(function () {
            var $this   = $(this),
                data    = $this.data(),
                options;
            if (typeof data['jax.fn'] !== 'object'){
                options = $.extend({}, Jax.DEFAULTS, data, typeof option === 'object' && option);
                $.data(this, 'jax.fn', new Jax(this, options, callback));
            }
            else{
                options =  $.extend(data['jax.fn'].options, typeof option === 'object' && option);
                data['jax.fn'].init(this, options, callback);
            }
        })
    }

    var old = $.fn.jax;

    /**
     * creates a new jax element
     * @param option object
     * @param callback callable
     * @returns object jQuery-Element
     */
    $.fn.jax             = Plugin;
    $.fn.jax.Constructor = Jax;


    // JAX NO CONFLICT
    // ====================

    $.fn.jax.noConflict = function () {
        $.fn.jax = old;
        return this;
    };

    // JAX AUTO INIT
    // ====================

    $(document).ready(function(){
        $(this).find("[data-jax]").jax();
    });

});
