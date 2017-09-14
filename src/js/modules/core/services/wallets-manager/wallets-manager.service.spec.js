(function () {
    describe("Module: blocktrail.core", function () {
        describe("Services:", function () {
            describe("* walletsManagerService", function () {
                var service;
                var $q;
                var $rootScope;
                var sdkServiceStub = jasmine.createSpyObj("sdkServiceStub", ["getSdkByActiveNetwork"]);
                var walletServiceStub = jasmine.createSpyObj("walletServiceStub", ["initWallet"]);
                var sdkStub = jasmine.createSpyObj("sdkStub", ["getAllWallets"]);
                var sdkStubResponseDataList = [
                    {
                        identifier: "id_1",
                        network: "BTC"
                    }, {
                        identifier: "id_2",
                        network: "BTC"
                    }, {
                        identifier: "id_3",
                        network: "BCC"
                    }, {
                        identifier: "ololo",
                        network: "ololo"
                    }, {
                        identifier: "trololo",
                        network: "trololo"
                    }
                ];

                var configStub = {
                    NETWORKS_ENABLED: ['BTC', 'BCC']
                };

                function WalletStub(id) {
                    var self = this;

                    self._identifier = id;
                }

                WalletStub.prototype.getReadOnlyWalletData = function () {
                    var self = this;

                    return {
                        identifier: self._identifier
                    }
                };

                WalletStub.prototype.disablePolling = function () {
                };

                WalletStub.prototype.enablePolling = function () {
                };

                // Inject the module
                beforeEach(module("blocktrail.core"));

                // Mock dependencies
                beforeEach(module(function($provide) {
                    $provide.constant("CONFIG", configStub);
                    $provide.value("sdkService", sdkServiceStub);
                    $provide.value("walletService", walletServiceStub);
                }));

                // Inject the service and helper services and add spy on objects
                beforeEach(inject(function($injector) {
                    service = $injector.get("walletsManagerService");
                    $rootScope = $injector.get("$rootScope");
                    $q = $injector.get("$q");

                    sdkServiceStub.getSdkByActiveNetwork.and.returnValue(sdkStub);

                    sdkStub.getAllWallets.and.returnValue($q.when({ data: sdkStubResponseDataList }));

                    walletServiceStub.initWallet.and.callFake(function(id) {
                        var wallet = new WalletStub(id);
                        return $q.when(wallet);
                    });
                }));

                it("Should be defined", function () {
                    expect(service).toBeDefined();
                });

                it("Should call the 'getAllWallets' method in the 'sdkService' on the 'fetchWalletsList'", function(done) {
                    service.fetchWalletsList()
                        .then(function() {
                            expect(sdkStub.getAllWallets).toHaveBeenCalledWith({ mywallet: 1, limit: 200 });
                            done();
                        });

                    $rootScope.$apply();
                });

                it("Should return an empty array on the 'getWalletsList'", function() {
                    expect(service.getWalletsList()).toEqual([]);
                });

                it("Should return an empty array on the 'getWalletsList'", function() {
                    expect(service.getWalletsList()).toEqual([]);
                });

                it("Should return the array of IDs on the 'getWalletsList'", function(done) {
                    var expectedList = [
                        {
                            identifier: "id_1",
                            uniqueIdentifier: "BTC_id_1",
                            network: "BTC"
                        }, {
                            identifier: "id_2",
                            uniqueIdentifier: "BTC_id_2",
                            network: "BTC"
                        }, {
                            identifier: "id_3",
                            uniqueIdentifier: "BCC_id_3",
                            network: "BCC"
                        }
                    ];

                    service.fetchWalletsList()
                        .then(function() {
                            expect(service.getWalletsList()).toEqual(expectedList);
                            done();
                        });

                    $rootScope.$apply();
                });

                it("Should return null on the 'getActiveWallet', if did not set a wallet", function() {
                    expect(service.getActiveWallet()).toBe(null);
                });
                
                // TODO Continue handle Errors
                // sdkStub.getAllWallets.and.returnValue($q.when({ data: [] }));
                fit("Should trow the error 'Blocktrail core module, wallets manager service. Network type should be defined.' on the 'setActiveWalletByNetworkTypeAndIdentifier' for empty network type property", function(done) {
                    var setActiveWalletByNetworkTypeAndIdentifier = function() {
                        service.setActiveWalletByNetworkTypeAndIdentifier(null, null)
                    };

                    service.fetchWalletsList()
                        .then(function() {
                            expect(setActiveWalletByNetworkTypeAndIdentifier)
                                .toThrowError("Blocktrail core module, wallets manager service. Network type should be defined.");

                            done();
                        });

                    $rootScope.$apply();
                });



















                xit("Should return wallet with first id from the list on the 'setActiveWalletById', if wallet id is null", function(done) {
                    var expectedWallet = new WalletStub('id_1');

                    service.fetchWalletsList()
                        .then(function() {
                            service.setActiveWalletById(null)
                                .then(function(wallet) {
                                    expect(wallet).toEqual(expectedWallet);
                                    done();
                                });
                        });

                    $rootScope.$apply();
                });

                xit("Should return wallet with first id from the list on the 'setActiveWalletById', if wallet id is not in the list and any wallet wasn't setup before", function(done) {
                    var expectedWallet = new WalletStub('id_1');

                    service.fetchWalletsList()
                        .then(function() {
                            service.setActiveWalletById(666)
                                .then(function(wallet) {
                                    expect(wallet).toEqual(expectedWallet);
                                    done();
                                });
                        });

                    $rootScope.$apply();
                });

                xit("Should return previously settled wallet on the 'setActiveWalletById', if wallet id is not in the list", function(done) {
                    var setupWalletId = 'id_2';
                    var expectedWallet = new WalletStub(setupWalletId);

                    service.fetchWalletsList()
                        .then(function() {
                            service.setActiveWalletById(setupWalletId)
                                .then(function() {
                                    service.setActiveWalletById(666)
                                        .then(function(wallet) {
                                            expect(wallet).toEqual(expectedWallet);
                                            done();
                                        });
                                });
                        });

                    $rootScope.$apply();
                });

                xit("Should disable polling for current active wallet and init new wallet", function(done) {
                    var setupWalletId1 = 'id_2';
                    var wallet1;

                    var setupWalletId2 = 'id_1';
                    var expectedWallet2 = new WalletStub(setupWalletId2);

                    service.fetchWalletsList()
                        .then(function() {
                            service.setActiveWalletById(setupWalletId1)
                                .then(function(wallet) {
                                    wallet1 = wallet;
                                    spyOn(wallet1, "disablePolling");

                                    service.setActiveWalletById(setupWalletId2)
                                        .then(function(wallet) {
                                            expect(wallet1.disablePolling).toHaveBeenCalled();
                                            expect(wallet).toEqual(expectedWallet2);
                                            done();
                                        });
                                });
                        });

                    $rootScope.$apply();
                });

                xit("Should disable polling for current active wallet and enable polling for already initialized wallet", function(done) {
                    var setupWalletId1 = 'id_2';
                    var wallet1;

                    var setupWalletId2 = 'id_1';
                    var wallet2;

                    service.fetchWalletsList()
                        .then(function() {
                            service.setActiveWalletById(setupWalletId1)
                                .then(function(wallet) {
                                    wallet1 = wallet;
                                    spyOn(wallet1, "enablePolling");

                                    service.setActiveWalletById(setupWalletId2)
                                        .then(function(wallet) {
                                            wallet2 = wallet;
                                            spyOn(wallet2, "disablePolling");

                                            service.setActiveWalletById(setupWalletId1)
                                                .then(function(wallet) {
                                                    expect(wallet2.disablePolling).toHaveBeenCalled();
                                                    expect(wallet1.enablePolling).toHaveBeenCalled();
                                                    expect(wallet).toEqual(wallet1);
                                                    done();
                                                });
                                        });
                                });
                        });

                    $rootScope.$apply();
                });

                xit("Should not call walletService.initWallet when we switch between already initialized wallets", function(done) {
                    // Reset calls on initWallet
                    walletServiceStub.initWallet.calls.reset();
                    var setupWalletId1 = 'id_1';
                    var setupWalletId2 = 'id_2';

                    service.fetchWalletsList()
                        .then(function() {
                            service.setActiveWalletById(setupWalletId1)
                                .then(function() {
                                    expect(walletServiceStub.initWallet).toHaveBeenCalledWith(setupWalletId1);

                                    service.setActiveWalletById(setupWalletId2)
                                        .then(function() {
                                            expect(walletServiceStub.initWallet).toHaveBeenCalledWith(setupWalletId2);

                                            service.setActiveWalletById(setupWalletId1)
                                                .then(function() {
                                                    expect(walletServiceStub.initWallet.calls.count()).toEqual(2);
                                                    done();
                                                });
                                        });
                                });
                        });

                    $rootScope.$apply();
                });


            });
        });
    });
})();
