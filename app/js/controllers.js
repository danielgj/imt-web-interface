imtApp
    
    .controller("MenuCtrl", function($scope, $rootScope,MenuService, $modal) {
        $rootScope.menu = MenuService.menu();
        $scope.logoutModal = function () {
            var modalInstance = $modal.open(
                {
                    animation: true,
                    templateUrl: 'templates/logoutModalTemplate.html',
                    controller: "LogoutModalCtrl"
                }
            );
        }
    })
    .controller('ErrorController', function($rootScope) {

    })
    .controller("HomeController", function($scope, $http, $rootScope, $sce, $modal, $location, $route, MenuService, Utils) {
        $scope.openLogin = function () {
            var modalInstance = $modal.open(
                {
                    animation: true,
                    templateUrl: 'templates/loginModalTemplate.html',
                    controller: "LoginModalCtrl"
                }
            );
        };

        $scope.openRegister = function () {
            var modalInstance = $modal.open(
                {
                    animation: true,
                    templateUrl: 'templates/registerModalTemplate.html',
                    controller: "RegisterModalCtrl"
                }
            );
        }

        
    })
    .controller("InventoryController", function($scope, $http, $rootScope, $sce, $modal, $location, $route, MenuService, dataService, Utils) {

      
      $scope.loading = true;
      
      //Fill Master Data
      $scope.states = [{'_id': 'Available'}, {'_id': 'Not available'}];    
      if(!Utils.isUndefinedOrNull($rootScope.user)) {
          
          $scope.loading = true;
          
          dataService.async('categories/').then(function(d) { 
          
              if(d.status) {
                  $rootScope.categories = d.data;
                  
                  dataService.async('brands/').then(function(d) { 
          
                      if(d.status) {

                          $rootScope.brands = d.data;
                          
                          dataService.async('loans/open').then(function(d) { 

                              if(d.status) {
                                  $rootScope.open_loans = d.data;
                                  
                                  dataService.async('items/').then(function(d) { 

                                      if(d.status) {

                                          var inventarioNotParsed = d.data;
                                          var inventarioParsed = [];

                                          for (i=0; i< inventarioNotParsed.length ; i++) {
                                            var currentInventarioItem = inventarioNotParsed[i];
                                            currentInventarioItem.available = true;
                                            currentInventarioItem.loan = {};
                                            for(j=0; j< $rootScope.open_loans.length ; j++) {
                                              var currentItemPrestamos = $rootScope.open_loans[j];
                                              if(currentItemPrestamos.item._id == currentInventarioItem._id) {
                                                  currentInventarioItem.available = false;
                                                  currentInventarioItem.loan = currentItemPrestamos;
                                                  currentInventarioItem.loanedTo = currentItemPrestamos.user.firstname + ' ' + currentItemPrestamos.user.lastname;                      
                                              }
                                            }
                                            inventarioParsed.push(currentInventarioItem);
                                          }

                                          $rootScope.inventory = inventarioParsed;
                                          
                                          $scope.loading = false;

                                      } else {
                                          
                                          console.log("Error loading items");
                          
                                          $scope.loading = false;
                                      }

                                  });
                              } else {
                                  
                                  console.log("Error loading open loans");
                          
                                  $scope.loading = false;

                              }

                          });

                      } else {
                          
                          console.log("Error loading brands");
                          
                          $scope.loading = false;
                      }

                  });
                  
              } else {
                  
                  console.log("Error loading categories");
                          
                  $scope.loading = false;
              }
              
          });
                    
          
      } 
      else {
          //Navigate to Home
          $location.path("/home");
      }
      
      $scope.requestLoan = function (item) {
        $rootScope.currentLoanRequestItem = item;          
        var modalInstance = $modal.open(
            {
                animation: true,
                templateUrl: 'templates/addLoanModalTemplate.html',
                controller: "AddLoanModalCtrl"
            }
        );
      }

      $scope.viewLoan = function (item) {
        $rootScope.currentLoan = item;
        var modalInstance = $modal.open(
            {
                animation: true,
                templateUrl: 'templates/viewLoanModalTemplate.html',
                controller: "ViewLoanModalCtrl"
            }
        );
      }     
      
      $scope.resetFilters = function() {
          $scope.filter.brand = undefined;          
          $scope.filter.category = undefined;
          $scope.filter.state = undefined;
      }

    })
    .controller("LoanController", function($scope, $http, $rootScope, $sce, $modal, $location, $route, MenuService, dataService, Utils) {
    
         $scope.loading = true;
         $scope.states = [{'_id': 'Any'}, {'_id': 'Requested'}, {'_id': 'Ongoing'}, {'_id': 'ClosePending'}, {'_id': 'Closed'}, {'_id': 'Rejected'}];
         $scope.state = {'_id': 'Any'};
    
        if(!Utils.isUndefinedOrNull($rootScope.user)) {
          
          $scope.loading = true;
          
          dataService.async('loans/user/' + $rootScope.user).then(function(d) { 
          
              if(d.status) {
                  $scope.requests = d.data;
                  $scope.loading = false;
              } else {
                  $scope.loading = false;
                  $rootScope.errorValue = "Error loading your requests";
                  $location.path("/error");
              }
          });
        } else {
            //Navifate to HOME   
        }
        
        
    
        $scope.requestDev = function(item) {
            
            $rootScope.itemToReturn = item;
            var modalInstance = $modal.open(
                {
                    animation: true,
                    templateUrl: 'templates/requestReturnModalTemplate.html',
                    controller: "RequestLoanReturnModalCtrl"
                }
            );
                                                            
        }
        
        $scope.filter = function() {
            
          var filtroEstado = Utils.isUndefinedOrNull($scope.estado)?'Cualquiera':$scope.estado._id;
          
          var itemsNotFiltered = $rootScope.fullPrestamos;
          var itemsToAdd = [];
            
          if(filtroEstado!='Cualquiera') {
                      
              //$scope.estados = [{'_id': 'Cualquiera'}, {'_id': 'Solicitado'}, {'_id': 'En Curso'}, {'_id': 'Pendiente Cierre'}, {'_id': 'Cerrado'}, {'_id': 'Rechazado'}];
         
              for(i=0; i<itemsNotFiltered.length;i++) {
                    var currentItem = itemsNotFiltered[i];
                    if(
                        (filtroEstado=='Solicitado' && currentItem.state==filtroEstado)
                        ||
                        (filtroEstado=='En Curso' && currentItem.state=='Encurso')
                        ||
                        (filtroEstado=='Pendiente Cierre' && currentItem.state=='PdteCierre')
                        ||
                        (filtroEstado=='Cerrado' && currentItem.state==filtroEstado)
                        ||
                        (filtroEstado=='Rechazado' && currentItem.state==filtroEstado)
                        
                      ) {
                            itemsToAdd.push(currentItem);
                    }
              }
          } else {
            itemsToAdd = itemsNotFiltered;   
          }
          
          $scope.prestamos = itemsToAdd;
        }

    })
    .controller("RequestsController", function($scope, $http, $rootScope, $sce, $modal, $location, $route, MenuService, dataService, Utils) {
    
        $scope.loading = true;
        $scope.types = [{'_id': 'Loan'}, {'_id': 'Return'}];         
    
        dataService.async('loans/pending').then(function(d) { 

            if(d.status) {
                $rootScope.pending_loans = d.data;   
            } else {
                console.log("Error loading pending loans");               
            }
        });

        $scope.approve = function(item) {
            if(item.state == 'Requested') {            
                item.state='Ongoing';
            } else {
                item.state='Closed';
            }
            
            $scope.working=true;
            $http({
                  method: 'PUT',
                  url: url_base_api + 'loans/' + item._id,
                  headers: {
                     "Accept": "application/json;charset=utf-8",
                     "Authorization" : "Bearer " + $rootScope.token
                 },
                 dataType:"json",
                 data: item
              }).then(function(obj) {
                
                    $scope.working=false;
                    $route.reload();
                
              }).catch(function(err) {
                
                  //console.log("err");
                  $rootScope.errorValue = err;
                  $location.path("/error");
                
              });  
            
            
        };
    
        $scope.reject = function(item) {
            if(item.state == 'ClosePending') {            
                item.state='Ongoing';
            } else {                
                item.state='Rejected';
            }
            
            $scope.working=true;
            $http({
                  method: 'PUT',
                  url: url_base_api + 'loans/' + item._id,
                  headers: {
                     "Accept": "application/json;charset=utf-8",
                     "Authorization" : "Bearer " + $rootScope.token
                 },
                 dataType:"json",
                 data: item
              }).then(function(obj) {
                
                    $scope.working=false;
                    $route.reload();
                
              }).catch(function(err) {
                
                  //console.log("err");
                  $rootScope.errorValue = err;
                  $location.path("/error");
                
              }); 
        }
    
    })
    .controller("AdminController", function($scope, $http, $rootScope, $sce, $modal, $location, $route, MenuService, dataService, Utils) {

      //Master Data
      $scope.loading = true;
      $rootScope.categories = [];
      $rootScope.brands = [];
      $rootScope.users = [];
    
      //Fill Master Data    
      if(!Utils.isUndefinedOrNull($rootScope.user)) {
          
          dataService.async('categories/').then(function(d) { 
          
              if(d.status) {
                  $rootScope.categories = d.data;
                  
                  dataService.async('brands/').then(function(d) { 
          
                      if(d.status) {

                          $rootScope.brands = d.data;
                          
                          dataService.async('items/').then(function(d) { 
                             
                              if(d.status) {
                                  $rootScope.items = d.data;
                                  
                                  dataService.async('users/').then(function(d) { 
                             
                                      if(d.status) {
                                          $rootScope.users = d.data;
                                      } else {
                                          $rootScope.errorValue = "Error loading users";
                                          $location.path("/error");
                                      }
                                  });
                              } else {
                                  $rootScope.errorValue = "Error loading items";
                                  $location.path("/error");
                              }
                          });
                          
                      } else {
                          
                          $rootScope.errorValue = "Error loading brands";
                          $location.path("/error");
                      }
                  });
              } else {
                  
                  $rootScope.errorValue = "Error loading categories";
                  $location.path("/error");
              }
          });
      
      } 
      else {
      
          //Navigate Home
          $location.path("/home");
      }


      $scope.changeRole = function() {

          if(!(Utils.isUndefinedOrNull($scope.userNameS) || Utils.isUndefinedOrNull($scope.roleS))) {
            alert($scope.userNameS._id);
            alert($scope.roleS);

            $rootScope.withErrorRole = false;
            $rootScope.errorMsgRole = "";

          } else {
              $rootScope.withErrorRole = true;
              $rootScope.errorMsgRole = "Introduce usuario y rol";
          }
      };
    
      $scope.openAddDevice = function () {
          var modalInstance = $modal.open(
              {
                  animation: true,
                  templateUrl: 'templates/addDeviceModalTemplate.html',
                  controller: "AddDeviceModalCtrl"
              }
          );
      };
    
      $scope.openAddCategory = function () {
          var modalInstance = $modal.open(
              {
                  animation: true,
                  templateUrl: 'templates/addCategoryModalTemplate.html',
                  controller: "AddCategoryModalCtrl"
              }
          );
      };
    
      $scope.deleteCategory = function (item) {
            $rootScope.categoryToDelete = item;          
            var modalInstance = $modal.open(
                {
                    animation: true,
                    templateUrl: 'templates/deleteCategoryModalTemplate.html',
                    controller: "DeleteCategoryModalCtrl"
                }
            );
      }
      
      $scope.editCategory = function (item) {
            $rootScope.categoryToEdit = item;          
            var modalInstance = $modal.open(
                {
                    animation: true,
                    templateUrl: 'templates/editCategoryModalTemplate.html',
                    controller: "EditCategoryModalCtrl"
                }
            );
      }

      $scope.openAddBrand = function () {
          var modalInstance = $modal.open(
              {
                  animation: true,
                  templateUrl: 'templates/addBrandModalTemplate.html',
                  controller: "AddBrandModalCtrl"
              }
          );
      };
    
      $scope.deleteBrand = function (item) {
            $rootScope.brandToDelete = item;          
            var modalInstance = $modal.open(
                {
                    animation: true,
                    templateUrl: 'templates/deleteBrandModalTemplate.html',
                    controller: "DeleteBrandModalCtrl"
                }
            );
      }
      
      $scope.editBrand = function (item) {
            $rootScope.brandToEdit = item;          
            var modalInstance = $modal.open(
                {
                    animation: true,
                    templateUrl: 'templates/editBrandModalTemplate.html',
                    controller: "EditBrandModalCtrl"
                }
            );
      }
      
      $scope.deleteItem = function (item) {
            $rootScope.itemToDelete = item;          
            var modalInstance = $modal.open(
                {
                    animation: true,
                    templateUrl: 'templates/deleteItemModalTemplate.html',
                    controller: "DeleteItemModalCtrl"
                }
            );
      }
      
      $scope.deleteUser = function (item) {
            $rootScope.userToDelete = item;          
            var modalInstance = $modal.open(
                {
                    animation: true,
                    templateUrl: 'templates/deleteUserModalTemplate.html',
                    controller: "DeleteUserModalCtrl"
                }
            );
      }
      
      $scope.editUser = function (item) {
            $rootScope.userToEdit = item;          
            var modalInstance = $modal.open(
                {
                    animation: true,
                    templateUrl: 'templates/editUserModalTemplate.html',
                    controller: "EditUserModalCtrl"
                }
            );
      }
      
      $scope.changePassword = function (item) {
            $rootScope.userToEdit = item;          
            var modalInstance = $modal.open(
                {
                    animation: true,
                    templateUrl: 'templates/changePasswordModalTemplate.html',
                    controller: "ChangePasswordModalCtrl"
                }
            );
      }

    })
    
    //Action Modal Controllers
    .controller("RegisterModalCtrl", function($scope, $rootScope, $modalInstance, $http, $sce, $location, MenuService, Utils) {

        $rootScope.withError = false;

        $scope.register = function() {
            
            $rootScope.withError = false;
            $rootScope.errorMsg = "";
            
            if(!Utils.isUndefinedOrNull($scope.user)) {

                if($scope.user.pass1!=$scope.user.pass2) {
                    $rootScope.withError = true;
                    $rootScope.errorMsg = "Password missmatch";
                } else {
                    
                    ///Show dialog and disable button 
                    $rootScope.registering = true;
                    $http({
                        method: 'POST',
                        url: url_base_api + 'users/register/',
                        headers: {
                           "Accept": "application/json;charset=utf-8"
                       },
                       dataType:"json",
                       data: {
                                'username':$scope.user.login,
                                'password':$scope.user.pass1,
                                'firstname':$scope.user.name,
                                'lastname':$scope.user.name,
                                'email':$scope.user.email,
                                'role': 'user'
                                
                       }

                    }).then(function(obj) {

                        if(obj.status==200 && obj.data.success) {
                            
                            
                            $http({
                                method: 'POST',
                                url: url_base_api + 'users/login/',
                                headers: {
                                   "Accept": "application/json;charset=utf-8"
                               },
                               dataType:"json",
                               data: {'username':$scope.user.login, 'password':$scope.user.pass1}
                            }).then(function(obj) {
                                if(obj.status==200 && obj.data.success) {
                                    $rootScope.user = obj.data.id_user;
                                    $rootScope.username = obj.data.name;
                                    $rootScope.token = obj.data.token;
                                    $rootScope.role = obj.data.role;
                                    $rootScope.email = obj.data.email;


                                    //////////////////LocalStorage
                                    localStorage.setItem("user", $rootScope.user);
                                    localStorage.setItem("username", $rootScope.username);
                                    localStorage.setItem("role", $rootScope.role);
                                    localStorage.setItem("token", $rootScope.token);
                                    localStorage.setItem("email", $rootScope.email);
                                    $rootScope.menu = MenuService.menu();


                                    $rootScope.withError = false;
                                    $rootScope.errorMsg = "";

                                    //Cierro caja login
                                    $modalInstance.dismiss('cancel');


                                    $location.path("/inventory");

                                } else {

                                }
                            }).catch(function(err) {
                                $rootScope.withError = true;
                                $rootScope.errorMsg = err.data.err.message;                    
                            });

                        } else {
                            $rootScope.withError = true;
                            $rootScope.registering = false;
                            $rootScope.errorMsg = obj.data.msg;
                        }

                    }).catch(function(err) {
                        // Invocado cuando surge un error
                        if(err.status===401) {
                            $rootScope.withError = true;
                            $rootScope.registering = false;
                            $rootScope.errorMsg = err;
                        }
                    });
                }

            } else {
               $rootScope.withError = true;
               $rootScope.errorMsg = "Introduce los campos obligatorios";
            }

        }

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    })
    .controller("LoginModalCtrl", function($scope, $rootScope, $modalInstance, $http, $sce, $location, $route, MenuService, Utils) {

        if(Utils.isUndefinedOrNull($rootScope.withError)) {
            $rootScope.withError = false;
        }

        $scope.login = function() {

            if(!(Utils.isUndefinedOrNull($scope.user) || Utils.isUndefinedOrNull($scope.user.pass))) {
                $http({
                    method: 'POST',
                    url: url_base_api + 'users/login/',
                    headers: {
                       "Accept": "application/json;charset=utf-8"
                   },
                   dataType:"json",
                   data: {'username':$scope.user.login, 'password':$scope.user.pass}
                }).then(function(obj) {
                    if(obj.status==200 && obj.data.success) {
                        $rootScope.user = obj.data.id_user;
                        $rootScope.username = obj.data.name;
                        $rootScope.token = obj.data.token;
                        $rootScope.role = obj.data.role;
                        $rootScope.email = obj.data.email;


                        //////////////////LocalStorage
                        localStorage.setItem("user", $rootScope.user);
                        localStorage.setItem("username", $rootScope.username);
                        localStorage.setItem("role", $rootScope.role);
                        localStorage.setItem("token", $rootScope.token);
                        localStorage.setItem("email", $rootScope.email);
                        $rootScope.menu = MenuService.menu();


                        $rootScope.withError = false;
                        $rootScope.errorMsg = "";

                        //Cierro caja login
                        $modalInstance.dismiss('cancel');


                        $location.path("/inventory");

                    } else {
                        
                    }
                }).catch(function(err) {
                    $rootScope.withError = true;
                    $rootScope.errorMsg = err.data.err.message;                    
                });
            } else {
                $rootScope.withError = true;
                $rootScope.errorMsg = "Please, enter required files";
            }
        };

        $scope.cancel = function () {
            $route.reload();
            $modalInstance.dismiss('cancel');
        };

    })
    .controller("LogoutModalCtrl", function($scope, $rootScope, $modalInstance, $location, MenuService) {

        $scope.logout = function() {
            $rootScope.user = null;
            $rootScope.username = null;
            $rootScope.token = null;
            $rootScope.role = null;
            $rootScope.email = null;

            localStorage.removeItem("user");
            localStorage.removeItem("username");
            localStorage.removeItem("token");
            localStorage.removeItem("email");
            localStorage.removeItem("role");

            $rootScope.menu = MenuService.menu();
            $location.path("/");
            $modalInstance.dismiss('logout');
        }

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

    })
    .controller("EditUserModalCtrl", function($scope, $rootScope, $modalInstance, $http, $sce, $route, $location, MenuService, Utils) {

        $rootScope.withError = false;

        $scope.roles =  [{'_id': 'user'}, {'_id': 'approver'}, {'_id': 'admin'}];         
        $scope.update = function() {
            
            $rootScope.withError = false;
            $rootScope.errorMsg = "";
            
                    ///Show dialog and disable button 
                    $rootScope.registering = true;
                    $http({
                        method: 'PUT',
                        url: url_base_api + 'users/' + $rootScope.userToEdit._id,
                        headers: {
                           "Accept": "application/json;charset=utf-8",
                            "Authorization" : "Bearer " + $rootScope.token
                       },
                       dataType:"json",
                       data: $rootScope.userToEdit

                    }).then(function(obj) {

                        if(obj.status==200) {
                            $rootScope.withError = false;
                            $rootScope.errorMsg = "";
                            //Cierro caja login
                            $modalInstance.dismiss('cancel');
                            $route.reload();                            
                        } else {
                            $rootScope.withError = true;
                            $rootScope.registering = false;
                            $rootScope.errorMsg = obj.data.msg;
                        }

                    }).catch(function(err) {
                        // Invocado cuando surge un error
                        if(err.status===401) {
                            $rootScope.withError = true;
                            $rootScope.registering = false;
                            $rootScope.errorMsg = err;
                        }
                    });
            
        }

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    })
    .controller("ViewLoanModalCtrl", function($scope, $http, $rootScope, $modalInstance, $sce, $modal, $location, $route, MenuService, Utils) {
    
        var currentLoan = $rootScope.currentLoan;
        
        var loanData = {
                  "device": currentLoan.item.name,
                  "requestor": currentLoan.user.firstname + ' ' + currentLoan.user.lastname,
                  "date" : currentLoan.requestDate,
                  "comments": currentLoan.comments,
                  "status": currentLoan.state   
        }
        
        $scope.loanData = loanData;
    
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    
    })
    .controller("AddLoanModalCtrl", function($scope, $http, $rootScope, $modalInstance, $sce, $modal, $location, $route, MenuService, Utils) {
              
        $scope.loan = {
                      "deviceId" : $rootScope.currentLoanRequestItem._id,
                      "deviceName" : $rootScope.currentLoanRequestItem.displayName,
                      "requestor": $rootScope.user,
                      "username": $rootScope.username,
                      "requestDate" : Date.now()
                  };
    
        $scope.add = function() {
            
            $scope.requesting= true;
            var itemToCreate = {
                "user" : $scope.loan.requestor,
                "item" : $scope.loan.deviceId,
                "comments" : $scope.loan.notes,
                "requestDate": Date.now(),
                "state": "Requested"
            }
            
            $http({
                  method: 'POST',
                  url: url_base_api + 'loans/',
                  headers: {
                     "Accept": "application/json;charset=utf-8",
                     "Authorization" : "Bearer " + $rootScope.token
                 },
                 dataType:"json",
                 data: itemToCreate
              }).then(function(obj) {
                if(obj.status==200) {

                  $scope.requesting = false;
                  $scope.withError = false;
                  $modalInstance.dismiss('cancel');
                  $route.reload();
                    

                } else {
                    console.log("Con status " + obj.status);
                    $scope.requesting = false;
                    $scope.withError = true;
                    $rootScope.errorMsg = "Se ha producido un error " + obj.status;
                }

              }).catch(function(err) {
                
                  $scope.requesting = false;
                  $scope.withError = true;
                  $rootScope.errorMsg = err;
                
              });
            
        }
        
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    
    })
    .controller("RequestLoanReturnModalCtrl", function($http, $scope, $route, $rootScope, $modalInstance, $location, MenuService) {

        $scope.request = function() {
            var itemParsed = $rootScope.itemToReturn;
            itemParsed.state='ClosePending';
            
            
            $scope.working=true;
            $http({
                  method: 'PUT',
                  url: url_base_api + 'loans/' + itemParsed._id,
                  headers: {
                     "Accept": "application/json;charset=utf-8",
                     "Authorization" : "Bearer " + $rootScope.token
                 },
                 dataType:"json",
                 data: itemParsed
              }).then(function(obj) {
                    $scope.working=false;
                    $modalInstance.dismiss('request');
                    $route.reload();
              
              }).catch(function(err) {
                
                  //console.log("err");
                  $rootScope.errorValue = err;
                  $location.path("/error");
                
              });  
            
        }

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

    })
    .controller("AddDeviceModalCtrl", function($scope, $http, $rootScope, $modalInstance, $sce, $modal, $location, $route, MenuService, Utils) {
      $rootScope.withError = false;

      $scope.add = function() {

        if(!Utils.isUndefinedOrNull($scope.device)) {
          var nameR = Utils.isUndefinedOrNull($scope.device.name)?'':$scope.device.name;
          var tipoR = Utils.isUndefinedOrNull($scope.device.category._id)?'':$scope.device.category._id;
          var marcaR = Utils.isUndefinedOrNull($scope.device.brand._id)?'':$scope.device.brand._id;
          var modeloR = Utils.isUndefinedOrNull($scope.device.model)?'':$scope.device.model;
          var osR = Utils.isUndefinedOrNull($scope.device.os)?'':$scope.device.os;
          var serialR = Utils.isUndefinedOrNull($scope.device.serial)?'':$scope.device.serial;
          var ownerR = Utils.isUndefinedOrNull($scope.device.owner)?'':$scope.device.owner;
          var notesR = Utils.isUndefinedOrNull($scope.device.notes)?'':$scope.device.notes;

        
          if(tipoR=='') {
            $rootScope.withError = true;
            $rootScope.errorMsg = "Enter device's category";
          } else if(marcaR=='') {
            $rootScope.withError = true;
            $rootScope.errorMsg = "Enter device's brand";
          } else {
              $rootScope.withError = true;
              $rootScope.errorMsg = "";
              var itemToCreate= {
                      name: nameR,
                      category: {_id: tipoR},
                      brand:  {_id: marcaR},
                      model: modeloR,
                      os: osR,
                      serial: serialR,
                      owner: ownerR,
                      notes: notesR
                    };

              $http({
                  method: 'POST',
                  url: url_base_api + 'items/',
                  headers: {
                     "Accept": "application/json;charset=utf-8",
                     "Authorization" : "Bearer " + $rootScope.token
                 },
                 dataType:"json",
                 data: itemToCreate
              }).then(function(obj) {
                if(obj.status==200) {

                      $modalInstance.dismiss('cancel');
                      $route.reload();                  

                } else {
                    console.log("Con status " + obj.status);
                }

              }).catch(function(err) {
                
                  console.log("Con error");
                  $rootScope.errorValue = err;
                  $location.path("/error");
                
              });


          }
        }
      };

      $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
      };

    })
    .controller("AddCategoryModalCtrl", function($scope, $http, $rootScope, $sce, $modal, $modalInstance, $location, $route, MenuService, dataService, Utils) {

        $rootScope.withError = false;

        $scope.add = function() {
            
            var nameR = Utils.isUndefinedOrNull($scope.category)?'':$scope.category;
            if(nameR=='') {
                $rootScope.withError = true;
                $rootScope.errorMsg = "Enter category's name";
            } else {
                
                $http({
                  method: 'POST',
                  url: url_base_api + 'categories/',
                  headers: {
                     "Accept": "application/json;charset=utf-8",
                     "Authorization" : "Bearer " + $rootScope.token
                 },
                 dataType:"json",
                 data: {'category': nameR}
              }).then(function(obj) {
                if(obj.status==200) {

                      $modalInstance.dismiss('cancel');
                      $route.reload();                  

                } else {
                    console.log("Con status " + obj.status);
                }

              }).catch(function(err) {
                
                  console.log("Con error");
                  $rootScope.errorValue = err;
                  $location.path("/error");
                
              });
                
            }
            
        };
    
        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };
    
    })
    .controller("EditCategoryModalCtrl", function($scope, $http, $rootScope, $sce, $modal, $modalInstance, $location, $route, MenuService, dataService, Utils) {

        $rootScope.withError = false;

        $scope.edit = function() {
            
            var nameR = Utils.isUndefinedOrNull($rootScope.categoryToEdit.category)?'':$rootScope.categoryToEdit.category;
            if(nameR=='') {
                $rootScope.withError = true;
                $rootScope.errorMsg = "Enter category's name";
            } else {
                
                $http({
                  method: 'PUT',
                  url: url_base_api + 'categories/' + $rootScope.categoryToEdit._id,
                  headers: {
                     "Accept": "application/json;charset=utf-8",
                     "Authorization" : "Bearer " + $rootScope.token
                 },
                 dataType:"json",
                 data: {'category': nameR}
              }).then(function(obj) {
                if(obj.status==200) {

                      $rootScope.withError = false;
                      $modalInstance.dismiss('cancel');
                      $route.reload();                  

                } else {
                    console.log("Con status " + obj.status);
                }

              }).catch(function(err) {
                
                  console.log("Con error");
                  $rootScope.errorValue = err;
                  $location.path("/error");
                
              });
                
            }
            
        };
    
        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };
    
    })
    .controller("AddBrandModalCtrl", function($scope, $http, $rootScope, $sce, $modal, $modalInstance, $location, $route, MenuService, dataService, Utils) {
    
        $rootScope.withError = false;

        $scope.add = function() {
            
            var nameR = Utils.isUndefinedOrNull($scope.brand)?'':$scope.brand;
            if(nameR=='') {
                $rootScope.withError = true;
                $rootScope.errorMsg = "Enter brand's name";
            } else {
                
                $http({
                  method: 'POST',
                  url: url_base_api + 'brands/',
                  headers: {
                     "Accept": "application/json;charset=utf-8",
                     "Authorization" : "Bearer " + $rootScope.token
                 },
                 dataType:"json",
                 data: {'brand': nameR}
              }).then(function(obj) {
                if(obj.status==200) {

                      $modalInstance.dismiss('cancel');
                      $route.reload();                  

                } else {
                    console.log("Con status " + obj.status);
                }

              }).catch(function(err) {
                
                  console.log("Con error");
                  $rootScope.errorValue = err;
                  $location.path("/error");
                
              });
                
            }
            
        };
    
        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };
    
    })
    .controller("DeleteCategoryModalCtrl", function($scope, $http, $rootScope, $sce, $modal, $modalInstance, $location, $route, MenuService, dataService, Utils) { 
    
        $rootScope.withError = false;

        $scope.delete = function() {
            $http({
                  method: 'DELETE',
                  url: url_base_api + 'categories/' + $rootScope.categoryToDelete._id,
                  headers: {
                     "Accept": "application/json;charset=utf-8",
                     "Authorization" : "Bearer " + $rootScope.token
                 },
                 dataType:"json"
              }).then(function(obj) {

                $modalInstance.dismiss('cancel');
                $route.reload();                  

              }).catch(function(err) {
                
                  if(err.status==400) {
                      $scope.withError = true;
                      $scope.errorMsg = err.data.msg;
                      
                  } else {
                    $rootScope.errorValue = err;
                    $location.path("/error");
                  }
                
              });
        };
    
        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };
    })
    .controller("EditBrandModalCtrl", function($scope, $http, $rootScope, $sce, $modal, $modalInstance, $location, $route, MenuService, dataService, Utils) {

        $rootScope.withError = false;

        $scope.edit = function() {
            
            var nameR = Utils.isUndefinedOrNull($rootScope.brandToEdit.brand)?'':$rootScope.brandToEdit.brand;
            if(nameR=='') {
                $rootScope.withError = true;
                $rootScope.errorMsg = "Enter brand's name";
            } else {
                
                $http({
                  method: 'PUT',
                  url: url_base_api + 'brands/' + $rootScope.brandToEdit._id,
                  headers: {
                     "Accept": "application/json;charset=utf-8",
                     "Authorization" : "Bearer " + $rootScope.token
                 },
                 dataType:"json",
                 data: {'brand': nameR}
              }).then(function(obj) {
                if(obj.status==200) {

                      $rootScope.withError = false;
                      $modalInstance.dismiss('cancel');
                      $route.reload();                  

                } else {
                    console.log("Con status " + obj.status);
                }

              }).catch(function(err) {
                
                  console.log("Con error");
                  $rootScope.errorValue = err;
                  $location.path("/error");
                
              });
                
            }
            
        };
    
        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };
    
    })
    .controller("DeleteBrandModalCtrl", function($scope, $http, $rootScope, $sce, $modal, $modalInstance, $location, $route, MenuService, dataService, Utils) { 
    
        $rootScope.withError = false;

        $scope.delete = function() {
            
            $http({
                  method: 'DELETE',
                  url: url_base_api + 'brands/' + $rootScope.brandToDelete._id,
                  headers: {
                     "Accept": "application/json;charset=utf-8",
                     "Authorization" : "Bearer " + $rootScope.token
                 },
                 dataType:"json"
              }).then(function(obj) {
                
                    $modalInstance.dismiss('cancel');
                    $route.reload();                  

              }).catch(function(err) {
                
                  if(err.status==400) {
                      $scope.withError = true;
                      $scope.errorMsg = err.data.msg;                      
                  } else {
                    $rootScope.errorValue = err;
                    $location.path("/error");
                  }
                
              });
        };
    
        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };
    })
    .controller("DeleteItemModalCtrl", function($scope, $http, $rootScope, $sce, $modal, $modalInstance, $location, $route, MenuService, dataService, Utils) { 
    
        $rootScope.withError = false;

        $scope.delete = function() {
            
            $http({
                  method: 'DELETE',
                  url: url_base_api + 'items/' + $rootScope.itemToDelete._id,
                  headers: {
                     "Accept": "application/json;charset=utf-8",
                     "Authorization" : "Bearer " + $rootScope.token
                 },
                 dataType:"json"
              }).then(function(obj) {
                
                    $modalInstance.dismiss('cancel');
                    $route.reload();                  

              }).catch(function(err) {
                
                  if(err.status==400) {
                      $scope.withError = true;
                      $scope.errorMsg = err.data.msg;                      
                  } else {
                    $rootScope.errorValue = err;
                    $location.path("/error");
                  }
                
              });
        };
    
        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };
    })
    .controller("DeleteUserModalCtrl", function($scope, $http, $rootScope, $sce, $modal, $modalInstance, $location, $route, MenuService, dataService, Utils) { 
    
        $rootScope.withError = false;

        $scope.delete = function() {
            
            $http({
                  method: 'DELETE',
                  url: url_base_api + 'users/' + $rootScope.userToDelete._id,
                  headers: {
                     "Accept": "application/json;charset=utf-8",
                     "Authorization" : "Bearer " + $rootScope.token
                 },
                 dataType:"json"
              }).then(function(obj) {
                
                    $modalInstance.dismiss('cancel');
                    $route.reload();                  

              }).catch(function(err) {
                
                  if(err.status==400) {
                      $scope.withError = true;
                      $scope.errorMsg = err.data.msg;                      
                  } else {
                    $rootScope.errorValue = err;
                    $location.path("/error");
                  }
                
              });
        };
    
        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };
    })
    .controller("ChangePasswordModalCtrl", function($scope, $http, $rootScope, $sce, $modal, $modalInstance, $location, $route, MenuService, dataService, Utils) { 
    
        $rootScope.withError = false;
        $rootScope.registering = false;

        $scope.changePassword = function() {
            
            $rootScope.withError = false;
            $rootScope.errorMsg = "";
            
            var pass1 = $scope.pass1;
            var pass2 = $scope.pass2;
            
            if(pass1 == pass2) {
                    ///Show dialog and disable button 
                    $rootScope.userToEdit.password = pass1;
                    $rootScope.withError = false;
                    $rootScope.registering = true;
                
                    $http({
                        method: 'PUT',
                        url: url_base_api + 'users/changepass/' + $rootScope.userToEdit.username,
                        headers: {
                           "Accept": "application/json;charset=utf-8",
                            "Authorization" : "Bearer " + $rootScope.token
                       },
                       dataType:"json",
                       data: $rootScope.userToEdit

                    }).then(function(obj) {

                        $rootScope.registering = false;
                        
                        if(obj.status==200) {
                            $rootScope.withError = false;
                            $rootScope.errorMsg = "";
                            //Cierro caja login
                            $modalInstance.dismiss('cancel');
                            $route.reload();                            
                        } else {
                            $rootScope.withError = true;
                            $rootScope.errorMsg = obj.data.msg;
                        }

                    }).catch(function(err) {
                        // Invocado cuando surge un error
                        if(err.status===401) {
                            $rootScope.withError = true;
                            $rootScope.registering = false;
                            $rootScope.errorMsg = err;
                        }
                    });
            } else {
                
                $rootScope.withError = true;
                $rootScope.registering = false;
                $rootScope.errorMsg = "Password missmatch";
            }
            
        };
    
        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };
    })

    //filters
    .filter('filterInventory', function() { 
    
        return function(x, category, brand, state) {
            
              if (!x || !x.length) { return; }
            
              var itemsToAdd = [];
              var input = x;
            
              var filtroTipo = category === undefined?'':category._id;
              var filtroMarca = brand === undefined?'':brand._id;
              var filtroEstado = state === undefined?'':state._id;
            
              
              for(i=0; i< input.length; i++) {
                    var currentItem = input[i];
                    if(
                        ((filtroTipo!='' && currentItem.category._id==filtroTipo) || filtroTipo=='')
                        &&
                        ((filtroMarca!='' && currentItem.brand._id==filtroMarca) || filtroMarca=='')
                        &&
                        ( (filtroEstado=='Available' && currentItem.available) || (filtroEstado=='Not available' && !currentItem.available) || filtroEstado == '')
                      ) {
                            itemsToAdd.push(currentItem);
                    }
              }
              
              return itemsToAdd;   
        }
          
      })
    .filter('filterLoans', function() { 
    
        return function(x, state) {
            
              if (!x || !x.length) { return; }
            
              var itemsToAdd = [];
              var input = x;
            
              var filtroEstado = state._id === 'Any'?'':state._id;
            
              
              for(i=0; i< input.length; i++) {
                    var currentItem = input[i];
                    if(filtroEstado==='') {
                        itemsToAdd.push(currentItem);
                    } else if(currentItem.state===filtroEstado) {
                        itemsToAdd.push(currentItem);
                    }
              }
              
              return itemsToAdd;   
        }
          
      })


