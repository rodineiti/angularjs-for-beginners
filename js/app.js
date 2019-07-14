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

app.service("TodoService", function($http) {
	var todoService = [];

	todoService.todoItems = [];

	$http.get("data/server_data.json")
		.success(function(data) {
			todoService.todoItems = data;

			for(var item in todoService.todoItems) {
				todoService.todoItems[item].date = new Date(todoService.todoItems[item].date);
			}
		})
		.error(function(data, status) {
			console.log(data);
			console.log(status);
			alert("Erro");
		});

	todoService.findById = function(id) {
		for (var item in todoService.todoItems) {
			if (todoService.todoItems[item].id === id) {
				return todoService.todoItems[item];
			}
		}
	};

	todoService.getNewId = function() {
		if (todoService.newId) {
			todoService.newId++;
			return todoService.newId;
		} else {
			var maxId = _.max(todoService.todoItems, function(item){
				return item.id;
			});
			todoService.newId = maxId.id + 1;
			return todoService.newId;
		}
	};

	todoService.save = function(item) {
		var updateItem = todoService.findById(item.id);

		if (updateItem) {

			$http.post("data/updated_item.json", item)
				.success(function(data) {
					if (data.status == 1) {
						updateItem.completed = item.completed;
						updateItem.name = item.name;
						updateItem.date = item.date;
					}
				})
				.error(function(data, status) {
					console.log(data);
					console.log(status);
					alert("Erro");
				});
		} else {

			$http.post("data/added_item.json", item)
				.success(function(data) {
					item.id = data.newId;
				})
				.error(function(data, status) {
					console.log(data);
					console.log(status);
					alert("Erro");
				});

			todoService.todoItems.push(item);
		}
	};

	todoService.removeItem = function(item) {
		$http.post("data/deleted_item.json", {id: item.id})
			.success(function(data) {
				if (data.status == 1) {
					var index = todoService.todoItems.indexOf(item);
					todoService.todoItems.splice(index, 1);	
				}
			})
			.error(function(data, status) {
				console.log(data);
				console.log(status);
				alert("Erro");
			});
	}

	todoService.markComplete = function(item) {
		item.completed = !item.completed;
	};

	return todoService;
});

app.controller("HomeController", ["$scope", "TodoService", function($scope, TodoService) {
  $scope.appTitle = 'Todo App';
  $scope.todoItems = TodoService.todoItems;

  $scope.removeItem = function(item) {
  	TodoService.removeItem(item);
  };

  $scope.markComplete = function(item) {
  	TodoService.markComplete(item);
  };

  $scope.$watch(function() {
  	return TodoService.todoItems;
  }, function(todoItem) {
  	$scope.todoItems = todoItem;
  });
}]);

app.controller("ListItemsController", ["$scope", "$routeParams", "$location", "TodoService", function($scope, $routeParams, $location, TodoService) {

	if (!$routeParams.id) {
		$scope.todoItem = {
  			id: 0, completed: false, name: '', date: new Date()
  		};
	} else {
		$scope.todoItem = _.clone(TodoService.findById(parseInt($routeParams.id)));
	}

  	$scope.save = function() {
  		TodoService.save($scope.todoItem);
  		$location.path("/");
  	};

  	$scope.rp = "Route params value: " + $routeParams.id;

}]);

app.directive("tbTodoItem", function() {
	return {
		restrict: "E",
		templateUrl: "item.html"
	};
});