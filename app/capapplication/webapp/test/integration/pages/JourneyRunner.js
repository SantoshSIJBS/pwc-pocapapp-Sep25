sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"capapplication/test/integration/pages/PODetailsList",
	"capapplication/test/integration/pages/PODetailsObjectPage",
	"capapplication/test/integration/pages/POItemsObjectPage"
], function (JourneyRunner, PODetailsList, PODetailsObjectPage, POItemsObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('capapplication') + '/test/flpSandbox.html#capapplication-tile',
        pages: {
			onThePODetailsList: PODetailsList,
			onThePODetailsObjectPage: PODetailsObjectPage,
			onThePOItemsObjectPage: POItemsObjectPage
        },
        async: true
    });

    return runner;
});

