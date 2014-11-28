(function() {
	'use strict';

	var whiteboard = angular.module('whiteboard', []);

	var whiteboardModel = {
		sender: null,
		receiver: null,
		drawing: {
			incoming: [],
			outgoing: [],
			erase: false,
		}
	};

	whiteboard.run(function($rootScope) {
		whiteboardModel.receiver = function(data) {
			$rootScope.$apply(function() {
				whiteboardModel.drawing.incoming.push(JSON.parse(data));
			});
		};

		$rootScope.$watch(
			function() {return whiteboardModel.drawing.outgoing;},
			function(newValue) {
				if (whiteboardModel.sender) {
					while (newValue.length) {
						whiteboardModel.sender(JSON.stringify(newValue.shift()));
					}
				}
			},
			true
		);
	});

	whiteboard.factory('whiteboard', function($rootScope) {

		var factory = {
			setSender: function(sender) {
				whiteboardModel.sender = sender;
			},
			onmessage: function(message) {
				if (whiteboardModel.receiver) {
					whiteboardModel.receiver(message);
				}
				else {
					console.error('receiver not defined');
				}
			},
			erase: function() {
				whiteboardModel.drawing.erase = true;

				var statusUpdate = {
					erase: true,
				};

				whiteboardModel.drawing.outgoing.push(statusUpdate);
			}
		};

		return factory;
	});


	whiteboard.directive('ssWhiteboard', function($rootScope, $timeout) {

		function link (scope, element, attrs) {
			element.ready(function() {
				$rootScope.$apply(
					function() {console.log('ready');}
				);
			});

			if (element[0].readyState !== undefined) {
				loop();
			}

			function loop() {
				if (element[0].readyState === 4) {
					$rootScope.$apply();
				}
				else {
					$timeout(loop, 100);
				}
			}

			var canvasElement = angular.element('<canvas style="position:absolute; top:0; left:0; border: 2px solid black"></canvas>');
			element.parent().append(canvasElement);

			var canvas = canvasElement[0];

			scope.$watch(
				function() {return element[0].clientHeight;},
				function(newValue) {
					canvas.height = newValue;
				}
			);
			scope.$watch(
				function() {return element[0].clientWidth;},
				function(newValue) {
					canvas.width = newValue;
				}
			);

			var mouseDownFlag = false,
			prevX = 0,
			currX = 0,
			prevY = 0,
			currY = 0;

			canvas.addEventListener("mouseout", mouseListener, false);
			canvas.addEventListener("mouseup", mouseListener, false);
			canvas.addEventListener("mousedown", mouseListener, false);
			canvas.addEventListener("mousemove", mouseListener, false);

			var ctx = canvas.getContext("2d");

			function mouseListener(event) {
				if (event.button === 0) {
					if (event.type == 'mousedown') {
						mouseDownFlag = true;
						updateDrawing(event, true);
					}
					else if (event.type == 'mouseup' || event.type == "mouseout") {
						mouseDownFlag = false;
					}
					else if (event.type == 'mousemove') {
						if (mouseDownFlag) {
							updateDrawing(event);
						}
					}
				}
			}

			function updateDrawing(event, isDot) {
				prevX = currX;
				prevY = currY;
				currX = event.pageX - canvas.offsetParent.offsetLeft;
				currY = event.pageY - canvas.offsetParent.offsetTop;

				if (isDot) {
					drawDot(currX, currY);
				}
				else {
					drawLine(prevX, prevY, currX, currY);
				}

				var statusUpdate = {
					prevX: prevX, prevY: prevY,
					currX: currX,
					currY: currY,
					isDot: isDot,
				};

				$rootScope.$apply(function() {
					whiteboardModel.drawing.outgoing.push(statusUpdate);
				});
			}

			function drawLine(prevX, prevY, currX, currY) {
				ctx.beginPath();
				ctx.moveTo(prevX, prevY);
				ctx.lineTo(currX, currY);
				ctx.lineWidth = 2;
				ctx.stroke();
				ctx.closePath();
			}

			function drawDot(currX, currY) {
				ctx.beginPath();
				ctx.fillRect(currX, currY, 2, 2);
				ctx.closePath();
			}

			$rootScope.$watch(
				function() {return whiteboardModel.drawing.incoming;},
				function(newValue) {
					while (newValue.length) {
						var statusUpdate = newValue.shift();
						if (statusUpdate.isDot) {
							drawDot(statusUpdate.currX, statusUpdate.currY);
						}
						else if (statusUpdate.erase) {
							whiteboardModel.drawing.erase = true;
						}
						else {
							drawLine(statusUpdate.prevX, statusUpdate.prevY, statusUpdate.currX, statusUpdate.currY);
						}
					}
				},
				true
			);

			$rootScope.$watch(
				function() {return whiteboardModel.drawing.erase;},
				function(newValue) {
					if (newValue) {
						ctx.clearRect(0, 0, canvas.width, canvas.height);

						whiteboardModel.drawing.erase = false;
					}
				}
			);

		}

		return {
			link: link,
		};
	});
})();
