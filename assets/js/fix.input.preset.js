/*
 * An input preset converter.
 *
 * The API allows to convert text entered into an element to a URL, slug or file name
 * value in another input element.
 *
 * Supported data attributes:
 * - data-input-preset: specifies a CSS selector for a source input element
 * - data-input-preset-closest-parent: optional, specifies a CSS selector for a closest common parent
 *   for the source and destination input elements.
 * - data-input-preset-type: specifies the conversion type. Supported values are:
 *   url, file, slug, camel.
 * - data-input-preset-prefix-input: optional, prefixes the converted value with the value found
 *   in the supplied input element using a CSS selector.
 * - data-input-preset-remove-words: optional, use removeList to filter stop words of source string.
 *
 * Example: <input type="text" id="name" value=""/>
 *          <input type="text"
 *             data-input-preset="#name"
 *             data-input-preset-type="file">
 *
 * JavaScript API:
 * $('#filename').inputPreset({inputPreset: '#name', inputPresetType: 'file'})
 */
+function ($) { "use strict";
    var old = $.fn.inputPreset
    $.fn.inputPreset.Constructor.prototype.slugify = function(slug, numChars) {

        slug = this.removeStopWords(slug);
        slug = slug.replace(/[^-\w\s۰-۹آا-ی]/g, '')
        slug = slug.replace(/^\s+|\s+$/g, '')
        slug = slug.replace(/[-\s]+/g, '-')
        slug = slug.toLowerCase()
        return slug.substring(0, numChars)
    }

    // INPUT CONVERTER NO CONFLICT
    // =================

    $.fn.inputPreset.noConflict = function () {
        $.fn.inputPreset = old
        return this
    }

}(window.jQuery);
