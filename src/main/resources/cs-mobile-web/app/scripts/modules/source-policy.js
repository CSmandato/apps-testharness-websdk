'use strict';




angular.module('MyTime.SourcePolicy', [])

      // Allowed cross domain sources
    .constant('TRUSTED_DOMAINS', ['self', '${trustedDomain}'])

    // Set allowed trusted domains
    .config(['$sceDelegateProvider', 'TRUSTED_DOMAINS', function ($sceDelegateProvider, TRUSTED_DOMAINS) {
        $sceDelegateProvider.resourceUrlWhitelist(TRUSTED_DOMAINS);
    }]);
