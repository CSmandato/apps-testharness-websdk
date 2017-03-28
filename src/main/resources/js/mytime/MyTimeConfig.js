/**
 *
 * Deployment Configuration for MyTime SupportModule
 *
 * Pass in an environment name and it will spit out the environment configuration object.
 * To add a configuration create a new var and assign properties.  Add a case under you chosen
 * environment name to the switch statement.  Load script, create new config object, and
 * pass config into SupportModule constructor.
 *
 * @author Michael Mandato
 * @param environment
 * @returns {*}
 * @constructor
 */
var MyTimeConfig = function(environment) {


    var config = {
        iconSet: 'font-awesome',
        stropheUrl: '${stropheUrl}',
        stropheChannel: 'web',
        companyGuid: '${companyGuid}',
        csPublicApiKey: '${csPublicApiKey}',
        appVersion: '1.0',
        sdkVersion: '2.3',
        mytimeEndpoint: '${mytimeEndpoint}',
        xmppServer: '${xmppServer}',
        pollForMessages: false,
        pollTime: 5000,
        imagesPath: 'images',
        loadingOverlayOn: true,
        errorOverlayOn: true,
        allowedFileUploadTypes: 'png,jpg,mp4,wav',
        popupDesktop: false,
        popupMobile: true
    };

    return config;
};