describe('StartController', function() {
  var $scope, StartController, UserService, $controller, $rootScope, $cookies, $location;
  // Set the module
  beforeEach(module('trendOMeterApp'));

  // Add globals for any test
  beforeEach(inject(function(_$rootScope_, _$controller_, _UserService_, _$cookies_, _$location_) {
    UserService = _UserService_;
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $cookies = _$cookies_;
    $location = _$location_;
    StartController = $controller('StartController', {$scope: $scope});
  }));

  it('should set loading equal true on $scope.start() is called', function(){
    expect($scope.loading).toEqual(false);
    $scope.start();
    expect($scope.loading).toEqual(true);
  });

  describe('UserService.createAnonymous', function(){
    beforeEach(function(){
      spyOn(UserService, "createAnonymous").and.returnValue({
        then: function(fn){
          // Check if is loading before response the promise.
          expect($scope.loading).toEqual(true);

          return fn({
            status: 201,
            data: {
              id: 1,
              anonymous: true
            }
          })
        }
      });
    });

    afterEach(function() {
      UserService.unset();
    });

    it('should set loading equal false on creating a anonymous user', function(){
      // Init the controller
      $scope.start();
      expect(UserService.createAnonymous.calls.count()).toEqual(1);
      expect($scope.loading).toEqual(false);
    });
   
    it('should not call createAnonymous when given a cookie before', function() {
      $cookies.put('user_id', 'hashed==');
      $scope.start();
      expect(UserService.createAnonymous.calls.count()).toEqual(0);
    });

    it('should clean completed cookie if is a promoted device', function() {
      UserService.setCompleted();
      $scope.start();
      expect($cookies.get('completed')).toBeUndefined();
    });

    it('should call redirect after starting', function() {
      spyOn($scope, "redirect").and.callThrough();
      $scope.start();
      expect($scope.redirect.calls.count()).toEqual(1);
    });

    it('should redirect to /duels on redirect call', function() {
      $scope.redirect();
      expect($location.path()).toEqual('/duels');
    });
  });

  describe('UserService.createAnonymous invalid', function(){
    beforeEach(function(){
      spyOn(UserService, "createAnonymous").and.returnValue({
          then: function(success, error){
              // Check if is loading before response the promise.
              expect($scope.loading).toEqual(true);

              return error({
                  status: 500,
                  data: {
                      id: 1,
                      anonymous: true
                  }
              })
          }
      });
    });

    it('should show error message', function() {
      expect($scope.error).toBeFalsy();
      $scope.start();
      expect($scope.error).toBeTruthy();
    });
  });

  describe('UserService.createAnonymous on a promoter device', function(){
    var PromoterService;
    beforeEach(inject(function(_PromoterService_){
      PromoterService = _PromoterService_;
    }));
    it('should forget previous user_id', function(){
      spyOn(UserService, "createAnonymous").and.returnValue({
        then: function(fn){
          return fn({
            status: 201,
            data: {
                id: 2,
                anonymous: true
            }
          })
        }
      });
      $cookies.put('user_id', 'hashed==');
      PromoterService.setPromoter();
      $scope.start();
      expect(UserService.createAnonymous.calls.count()).toBe(1);
    });
  });
});
describe('CaptureController', function() {
  var $scope, CaptureController, $rootScope, $controller, $cookies, $location;
  // Set the module
  beforeEach(module('trendOMeterApp'));

  // Add globals for any test
  beforeEach(inject(function(_$rootScope_, _$controller_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $controller = _$controller_;
    CaptureController = $controller('CaptureController', {$scope: $scope});
  }));

  it('should exist', function(){
    expect(CaptureController).toBeDefined();
  });
});
describe('UserController', function() {
  var UserController, UserService, IndustryService, RoleService, $scope, 
      $controller, $rootScope, $cookies, $location, industriesStatusCode,
      roleStatusCode, industryData, roleData;
  // Set the module
  beforeEach(module('trendOMeterApp'));

  // Add globals for any test
  beforeEach(inject(function(_$rootScope_, _$controller_, _UserService_, _IndustryService_, _RoleService_, _$cookies_, _$location_) {
    UserService = _UserService_;
    $controller = _$controller_;
    IndustryService = _IndustryService_;
    RoleService = _RoleService_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $cookies = _$cookies_;
    $location = _$location_;

    UserService.unset();
    $cookies.put('user_id', 'hashed==');

    industriesStatusCode = 200;
    roleStatusCode = 200;

    industryData = [
      {"id":1,"name":"Agricultura e Mineração"},
      {"id":2,"name":"Serviços Empresariais"},
      {"id":3,"name":"Computadores e Eletrônicos"}
    ];
    roleData = [
      {"id":1,"name":"Executivo C-Level"},
      {"id":2,"name":"VP ou Diretor(a)"},
      {"id":3,"name":"Gerente de Projeto"}
    ];

    spyOn(IndustryService, "all").and.returnValue({
      then: function(fn, errFn) {
        if(industriesStatusCode === 200) {
          fn({
            status: industriesStatusCode,
            data: industryData 
          });
        } else {
          fn({
            status: industriesStatusCode,
            data: industryData 
          });
        }
      }
    });    
    spyOn(RoleService, "all").and.returnValue({
      then: function(fn, errFn) {
        if(roleStatusCode === 200) {
          fn({
            status: roleStatusCode,
            data: roleData 
          });
        } else {
          fn({
            status: roleStatusCode,
            data: roleData 
          });
        }
      }
    });    
  }));

  it('should redirect to /start if no cookie', function() {
    UserService.unset();
    $controller('UserController', {$scope: $scope});
    expect($location.path()).toEqual('/start');
  });

  it('should redirect to /start if no cookie when send', function() {
    $controller('UserController', {$scope: $scope});
    UserService.unset();
    $scope.user.name = 'Tw Tester';
    $scope.user.email = 'tw@tw.com';
    $scope.send();
    expect($location.path()).toEqual('/start');
  });

  it('should get the industry list on start the controller', function() {
    $controller('UserController', {$scope: $scope});
    expect(IndustryService.all.calls.count()).toEqual(1);
    expect(RoleService.all.calls.count()).toEqual(1);

    expect($scope.industries).toEqual(industryData);
    expect($scope.roles).toEqual(roleData);
  });

  it('should set a error flag on industry service error', function() {
    industriesStatusCode = 500;
    $controller('UserController', {$scope: $scope});

    expect($scope.dependencyError).toEqual(true);
  });

  it('should set a error flag on role service error', function() {
    roleStatusCode = 500;
    $controller('UserController', {$scope: $scope});

    expect($scope.dependencyError).toEqual(true);
  });

  it('should set loading false if industries and roles are loaded', function() {
    $controller('UserController', {$scope: $scope});
    expect($scope.loadingIndustries).toEqual(false);
    expect($scope.loadingRoles).toEqual(false);
    expect($scope.loading()).toEqual(false);

    $scope.loadingIndustries = true;
    expect($scope.loading()).toEqual(true);

    $scope.loadingRoles = true;
    expect($scope.loading()).toEqual(true);
    
    $scope.loadingIndustries = false;
    expect($scope.loading()).toEqual(true);

    // Cancel loading on dependencyError
    $scope.loadingIndustries = true;
    $scope.loadingRoles = true;
    $scope.dependencyError = true;
    expect($scope.loading()).toEqual(false);
  });

  it('should save user using UserService', function() {
    promise = {
      then: function(fn) {
        fn({status: 200});
        expect($scope.saving).toEqual(false);
        expect(UserService.isCompleted()).toEqual(true);
        expect($location.path()).toEqual('/thanks');
      }
    }
    spyOn(promise, 'then').and.callThrough();
    spyOn(UserService, 'save').and.callFake(function(data) {
      expect($scope.saving).toEqual(true);
      expect($scope.error).toEqual(false);
      expect(data).toBeDefined();
      expect(data).toEqual($scope.user);
      return promise;
    });
    $controller('UserController', {$scope: $scope});
    $scope.user.name = 'Tw Tester';
    $scope.user.email = 'twt@twt.com';
    $scope.send();
    expect(UserService.save.calls.count()).toEqual(1);
    expect(promise.then.calls.count()).toEqual(1);
  });
  it('should redirect to panel if the user already submit the form', function() {
    UserService.setCompleted();
    $controller('UserController', {$scope: $scope});
    expect($location.path()).toEqual('/panel');
  });
  it('should show message on save error', function() {
    promise = {
      then: function(fn, fnerr) {
        fnerr({status: 500});
        expect($scope.error).toEqual(true);
        expect($scope.saving).toEqual(false);
      }
    }
    spyOn(promise, 'then').and.callThrough();
    $controller('UserController', {$scope: $scope});
    $scope.send();
  });

  describe('Save User', function() {
    beforeEach(function() {
      spyOn(UserService, 'save').and.callFake(function(data) {
        expect($scope.saving).toEqual(true);
        expect(data).toEqual($scope.user);
        return promise;
      });
    });
    it('should validate user name before send data', function() {
      $controller('UserController', {$scope: $scope});
      $scope.user.name = '';
      expect($scope.formErrors).toEqual({});
      $scope.send();
      expect($scope.formErrors.name).toEqual(true);
    });
    it('should clean user name validation before send data', function() {
      $controller('UserController', {$scope: $scope});
      $scope.formErrors.name = true;
      $scope.user.name = 'Tw Tester';
      $scope.send();
      expect($scope.formErrors.name).toBeFalsy();
    });
    it('should validate user email before send data', function() {
      $controller('UserController', {$scope: $scope});
      $scope.user.email = 'asdas';
      $scope.user.name = 'Tw Tester';
      $scope.send();
      expect($scope.formErrors.email).toEqual(true);
      $scope.user.email = '';
      $scope.send();
      expect($scope.formErrors.email).toEqual(true);
    });
    it('should clean user email validation before send data', function() {
      $controller('UserController', {$scope: $scope});
      $scope.formErrors.email = true;
      $scope.user.email = 'twt@twt.com';
      $scope.send();
      expect($scope.formErrors.email).toBeFalsy();
    });
  });
});
