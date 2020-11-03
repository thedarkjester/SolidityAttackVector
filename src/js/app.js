
App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    return await App.initWeb3();
  },

  initWeb3: async function() {
   // Modern dapp browsers...
if (window.ethereum) {
  App.web3Provider = window.ethereum;
  try {
    // Request account access
    await window.ethereum.enable();
  } catch (error) {
    // User denied account access...
    console.error("User denied account access")
  }
}
// Legacy dapp browsers...
else if (window.web3) {
  App.web3Provider = window.web3.currentProvider;
}
// If no injected web3 instance is detected, fall back to Ganache
else {
  App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:8545');
}
  web3 = new Web3(App.web3Provider);
    return App.initContract();
  },

  initContract: function() {
    $.getJSON('AttackVector.json', function(data) {
      
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var AttackVectorArtifact = data;
      App.contracts.AttackVector = TruffleContract(AttackVectorArtifact);
    
      // Set the provider for our contract
      App.contracts.AttackVector.setProvider(App.web3Provider);
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '#setText', App.handleSetText);
    $(document).on('click', '#getText', App.handleGetText);
    $(document).on('click', '#getSafeText', App.handleSafeGetText);
    $(document).on('click', '#getValidatedText', App.getValidatedText);
    
  },  
  getGoodValidatedText: function(event) {
    event.preventDefault();
    var contractInstance;

    web3.eth.getAccounts(function(error, accounts) {

    App.contracts.AttackVector.deployed().then(function(instance) {
    contractInstance = instance;

    // store the evil script on the blockchain
    return contractInstance.getValidatedText();
    })
    .then(function(retrievedData){
      $("#attackedDivErrorMessage").html(retrievedData);
    }).catch(function(err) {
      console.log(err.message);
    });
   });
  },
  handleSetText: function(event) {
    event.preventDefault();
    var contractInstance;

    web3.eth.getAccounts(function(error, accounts) {

    App.contracts.AttackVector.deployed().then(function(instance) {
    contractInstance = instance;

    // store the evil script on the blockchain
    return contractInstance.setTextField("<script>alert('I just did a javascript drive-by attack');</script>");
    }).catch(function(err) {
      console.log(err.message);
   });
   });
  },
  handleGetText: function(event) {
    event.preventDefault();
    var contractInstance;

    web3.eth.getAccounts(function(error, accounts) {

    App.contracts.AttackVector.deployed().then(function(instance) {
    contractInstance = instance;

    // store the evil script on the blockchain
    return contractInstance.getTextField();
    })
    .then(function(retrievedData){
       $("#attackedDiv").html(retrievedData);
    })
    .catch(function(err) {
      console.log(err.message);
     });
   });
  },

  handleSafeGetText: function(event) {
    event.preventDefault();
    var contractInstance;

    web3.eth.getAccounts(function(error, accounts) {

    App.contracts.AttackVector.deployed().then(function(instance) {
    contractInstance = instance;

    // store the evil script on the blockchain
    return contractInstance.getTextField();
    })
    .then(function(retrievedData){
       $("#safeDiv").text(retrievedData);
    })
    .catch(function(err) {
      console.log(err.message);
     });
   });
  },
};

$(function() {
  $(window).load(function() {

    App.init();
  });
});
