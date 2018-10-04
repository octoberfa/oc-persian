/*
 * Side Panel Tabs
 */

+function ($) { 
    "use strict";
    
    var old = $.fn.sidePanelTab


    $.fn.sidePanelTab.Constructor.prototype.displaySidePanel = function() {
        $(document.body).addClass('display-side-panel')

        this.$el.appendTo('#layout-canvas')
        this.panelVisible = true
        this.$el.css({
            right: this.sideNavWidth,
            top: this.mainNavHeight
        })

        this.updatePanelPosition()
        $(window).trigger('resize')
    }


    // NO CONFLICT
    // =================

    $.fn.sidePanelTab.noConflict = function() {
        $.fn.sidePanelTab = old
        return this
    }
}(window.jQuery);
