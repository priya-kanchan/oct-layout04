/* Country-code picker for every .phone-input.
   Keeps the hidden field named in data-countrycode-id in sync ("+91" format),
   which the CRM script reads via SenderControlCountryCodeID. */
(function () {
    'use strict';
    if (!window.intlTelInput) return;

    var fields = [];

    document.querySelectorAll('.phone-input').forEach(function (input) {
        var iti = window.intlTelInput(input, {
            initialCountry: 'in',
            preferredCountries: ['in', 'ae', 'us', 'gb', 'sg', 'sa', 'qa', 'au', 'ca'],
            separateDialCode: true,
            autoPlaceholder: 'off',
            // render the list on <body> so the popup's scroll area can't clip it
            dropdownContainer: document.body
        });
        var hidden = document.getElementById(input.getAttribute('data-countrycode-id'));

        function syncCountryCode() {
            var data = iti.getSelectedCountryData();
            if (hidden) hidden.value = '+' + (data.dialCode || '91');
        }

        // The plugin sizes the left padding from the flag box once, at init. If that box was hidden
        // (closed popup) or unstyled at that moment, the padding comes out huge and the field
        // overflows its form — so re-measure whenever the field can actually be seen.
        var flagBox = input.parentNode.querySelector('.iti__selected-flag');
        function fixPadding() {
            var w = flagBox ? flagBox.offsetWidth : 0;
            if (w > 0 && w < 160) input.style.paddingLeft = (w + 6) + 'px';
        }
        fields.push(fixPadding);

        input.addEventListener('countrychange', function () {
            syncCountryCode();
            fixPadding();
        });
        input.addEventListener('focus', fixPadding);
        syncCountryCode();
        fixPadding();
    });

    function fixAll() {
        fields.forEach(function (fn) { fn(); });
    }
    window.addEventListener('load', fixAll);
    window.addEventListener('resize', fixAll);
    // popups open on [data-popup] clicks; measure once the popup is visible
    document.addEventListener('click', function (e) {
        if (e.target.closest('[data-popup]')) window.requestAnimationFrame(fixAll);
    });
})();
