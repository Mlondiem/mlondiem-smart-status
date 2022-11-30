/**
 * SmartStatus.js by Mlondie Lukhele (developer@mlondiem.com)
 * Version: 0.9.2
 * Date: 2020-08-10T01:51 SAST
 * Mod:  2020-09-10T15:43 SAST
 */

/**
 * The SmartStatus class represents an object that displays a clean GUI feature acting as a status
 * message attached to a target element, such as a link, input field, div, etc that has updatable
 * content or changing state. The status itself can be updated to reflect what is currently
 * happening on the data and/or elements affected
 *
 * Changelog
 * 2020-09-10 >> v0.9.2 - attach method now returns SmartStatus instance
 *                      - removed inline styling in attach method (style controlled by accompanying CSS file)
 * 2020-08-12 >> v0.9.1 - changed to exclamation triangle icon for failed final status
 *                      - use html() to set status content instead of text() to enable formatting
 * 2020-08-12 >> v0.9.0 - show, reset, final methods return the SmartStatus instance to support chaining
 */
class SmartStatus {
    constructor(txt, target) {
        this._dom_self = {
            wrapper: $('<div class="smart-status" data-id="smart-">'),
            spinner: $('<span class="fa fa-spinner fa-spin"/>'),
            banner: $('<span class="smart-status-msg">Loading...</span>'),
            close_btn: $('<span class="fa fa-times close" data-dismiss="alert"/>').click(function (e) {
                // e.stopPropagation();
                $(this).parent().fadeOut('slow');
            }),
            setup: function () {
                this.wrapper.append(this.spinner);
                this.wrapper.append(this.banner);
                this.wrapper.append(this.close_btn);
            }
        };
        this._dom_self.setup();
        if (txt) this.msg = txt;
        if (target) this.attach(target);
    }

    /**
     *
     * @type {object} Holds a representation of the actual DOM elements
     * @private
     */
    _dom_self = {};

    id = '';

    // =======================
    // CLASS METHODS
    // =======================

    /**
     * Attaches the smart status to a target element (the status will display near the target). If any status
     * was already attached to target, then the attempt will fail unless specifically overwritten with the
     * overwrite parameter. If target
     * is not specified, then the status is attached to the document body as an independent status referring
     * to the entire page. Be careful about creating too many of these!
     * @param target {object} A DOM element for which the status is created
     * @param overwrite {boolean} Whether to overwrite existing smart status already attached to target
     */
    attach(target, overwrite) {
        if (target && target !== document.body) {
            // check if target has valid id
            let target_id = target.attr('id');
            if (target_id === '') {
                console.error('SmartStatus cannot use target with no id');
                this.destroy();
                return false;
            }
            // generate id attribute to use for smart status
            let use_id = 'smart-'+target_id;
            if (!this.find(use_id)) {
                // generated id available to use; apply changes
                this._dom_self.wrapper.css({
                    left: getComputedStyle(target[0]).left,
                    top: getComputedStyle(target[0]).bottom
                });
                this._dom_self.wrapper.appendTo(document.body);
                this._dom_self.wrapper.attr('data-id', use_id);
            }
            else if (overwrite) {
                // store updated message
                let restore_msg = this.msg;
                // overwrite existing elements
                this._dom_self.wrapper = $('div[data-id="'+use_id+'"]');
                this._dom_self.spinner = this._dom_self.wrapper.find('span.fa-spinner');
                this._dom_self.banner = this._dom_self.wrapper.find('span.smart-status-msg');
                this._dom_self.close_btn = this._dom_self.wrapper.find('span.close');
                this.msg = restore_msg;
            }
            else {
                // cannot attach
                console.error('Cannot attach new SmartStatus on used target');
                return false;
            }
            // update global store
            window._smart_statuses[use_id] = this;
            return this;
        }
        else {
            // status is to be attached to body; ensure there is only one of
            if (!this.find('_global_smart_status_')) {
                /*this._dom_self.wrapper.css({
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    position: 'absolute'
                });*/
                this._dom_self.wrapper.attr('data-id', '_global_smart_status_');
                this._dom_self.wrapper.appendTo(document.body);
                window._smart_statuses['_global_smart_status_'] = this;
                return this;
            }
            else {
                // cannot attach
                console.error('Cannot attach new SmartStatus on used global target');
                return false;
            }
        }
    }

    destroy() {
        this._dom_self.wrapper.remove();
        delete window._smart_statuses[this._dom_self.wrapper.attr('data-id')];
    }

    reset() {
        this.msg = 'Loading...';
        this._dom_self.spinner.attr('class', 'fa fa-spinner fa-spin');
        return this;
    }

    /**
     * Shows the status banner (think hidden) and displays a new message if provided
     * @param txt {string} A new message to display
     */
    show(txt) {
        if (txt) this.msg = txt;
        this._dom_self.wrapper.fadeIn('slow');
        return this;
    }

    /**
     * Hides the status banner
     */
    hide(duration) {
        this._dom_self.wrapper.fadeOut(duration ? duration : 1500);
        return this;
    }

    /**
     * Displays a final text message on the status banner and stops the spinner. A contextual icon replaces
     * the spinner, indicating success or failure
     * @param txt {string} The status message to display
     * @param success {boolean} Pass true to imply success and omit the parameter or pass false to imply failure
     */
    final(txt, success) {
        this._dom_self.spinner.removeClass('fa-spinner').removeClass('fa-spin');
        this._dom_self.banner.html(txt);
        if (success) this._dom_self.spinner.addClass('fa-check');
        else this._dom_self.spinner.addClass('fa-exclamation-triangle');
        return this;
    }

    // =======================
    // SETTER/GETTER FUNCTIONS
    // =======================

    /**
     * Gets the version number of the SmartStatus library
     * @returns {string}
     */
    get version() {return '0.9.2';}

    /**
     * Sets or gets the status message displayed by the banner
     * @returns {string}
     */
    get msg() {
        return this._dom_self.banner.html();
    }
    /**
     * @type {string} The text message to display on the status banner
     */
    set msg(str) {
        this._dom_self.banner.html(str);
    }

    /**
     * The unique id that identifies this status object in the current environment
     * @returns {string}
     */
    get id() {
        return this.id;
    }
}

SmartStatus.prototype.find = function(id) {
    if (typeof window._smart_statuses[id] != 'undefined') return window._smart_statuses[id];
    return false;
};

// _smart_statuses {array} enables global tracking of status objects
window._smart_statuses = [];