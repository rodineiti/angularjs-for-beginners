var app = angular.module('listApp', ["ngRoute"]);

app.config(function($routeProvider) {
	$routeProvider
		.when("/", {
			templateUrl:"list.html",
			controller: "HomeController"
		})
		.when("/add", {
			templateUrl:"add.html",
			controller: "ListItemsController"
		})
		.when("/add/edit/:id", {
			templateUrl:"add.html",
			controller: "ListItemsController"
		})
		.otherwise({
			redirectTo: "/"
		});
});

app.service("GroceryService", function($http) {
	var groceryService = [];

	groceryService.groceryItems = [];

	$http.get("data/server_data.json")
		.success(function(data) {
			console.log(data);
			groceryService.groceryItems = data;

			for(var item in groceryService.groceryItems) {
				groceryService.groceryItems[item].date = new Date(groceryService.groceryItems[item].date);
			}
		})
		.error(function(data, status) {
			console.log(data);
			console.log(status);
			alert("Erro");
		});

	groceryService.findById = function(id) {
		for (var item in groceryService.groceryItems) {
			if (groceryService.groceryItems[item].id === id) {
				return groceryService.groceryItems[item];
			}
		}
	};

	groceryService.getNewId = function() {
		if (groceryService.newId) {
			groceryService.newId++;
			return groceryService.newId;
		} else {
			var maxId = _.max(groceryService.groceryItems, function(entry){
				return entry.id;
			});
			groceryService.newId = maxId.id + 1;
			return groceryService.newId;
		}
	};

	groceryService.save = function(entry) {
		var updateItem = groceryService.findById(entry.id);

		if (updateItem) {

			$http.post("data/updated_item.json", entry)
				.success(function(data) {
					console.log(data.status)
					if (data.status == 1) {
						updateItem.completed = entry.completed;
						updateItem.name = entry.name;
						updateItem.date = entry.date;
					}
				})
				.error(function(data, status) {
					console.log(data);
					console.log(status);
					alert("Erro");
				});
		} else {

			$http.post("data/added_item.json", entry)
				.success(function(data) {
					entry.id = data.newId;
				})
				.error(function(data, status) {
					console.log(data);
					console.log(status);
					alert("Erro");
				});

			//entry.id = groceryService.getNewId();
			groceryService.groceryItems.push(entry);
		}
	};

	groceryService.removeItem = function(entry) {
		$http.post("data/deleted_item.json", {id: entry.id})
			.success(function(data) {
				if (data.status == 1) {
					var index = groceryService.groceryItems.indexOf(entry);
					groceryService.groceryItems.splice(index, 1);	
				}
			})
			.error(function(data, status) {
				console.log(data);
				console.log(status);
				alert("Erro");
			});
	}

	groceryService.markComplete = function(entry) {
		entry.completed = !entry.completed;
	};

	return groceryService;
});

app.controller("HomeController", ["$scope", "GroceryService", function($scope, GroceryService) {
  $scope.appTitle = 'Grocery App';
  $scope.groceryItems = GroceryService.groceryItems;

  $scope.removeItem = function(entry) {
  	GroceryService.removeItem(entry);
  };

  $scope.markComplete = function(entry) {
  	GroceryService.markComplete(entry);
  };

  $scope.$watch(function() {
  	return GroceryService.groceryItems;
  }, function(groceryItem) {
  	$scope.groceryItems = groceryItem;
  });
}]);

app.controller("ListItemsController", ["$scope", "$routeParams", "$location", "GroceryService", function($scope, $routeParams, $location, GroceryService) {

	if (!$routeParams.id) {
		$scope.groceryItem = {
  			id: 0, completed: false, name: '', date: new Date()
  		};
	} else {
		$scope.groceryItem = _.clone(GroceryService.findById(parseInt($routeParams.id)));
	}

  	$scope.save = function() {
  		GroceryService.save($scope.groceryItem);
  		$location.path("/");
  	};

  	$scope.rp = "Route params value: " + $routeParams.id;

}]);

app.directive("tbGroceryItem", function() {
	return {
		restrict: "E",
		templateUrl: "item.html"
	};
});