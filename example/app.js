(function() {
	var app = angular.module('app', ['whiteboard']);

	(function() {
		'use strict';

		app.controller('appController', function (whiteboard) {

			whiteboard.setSender(function(message) {
				//send message to yourself. Completely pointless
				whiteboard.onmessage(message);
			});
			
		});

	})();
})();
