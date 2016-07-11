var module = angular.module('timer', []);

module.directive('timer', ['$interval', 'dateFilter', function($interval, dateFilter) {
	
	return {
	  restrict: 'E',
	  template: '<span ng-class="{ blink: done }">{{timeleft}}</span>',
	  scope: {
        endtime: '=endtime'
      },
      link: function(scope, element, attr){
		function updateTime() {
			diff = scope.endtime - new Date().getTime();
			
			if(diff <= 0) {
				$interval.cancel(timeoutId);
				diff = 0;
				scope.done = true;
			}
			scope.timeleft = dateFilter(diff, 'mm:ss');
		}	 
	
		timeoutId = $interval(function() {
			updateTime(); // update DOM
		}, 1000);
	   }
	};
}]);
