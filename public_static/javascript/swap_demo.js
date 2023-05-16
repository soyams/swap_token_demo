const Web3=require('web3');

var web3;

App = {
  web3Provider: null,
  account:'0x0',

  _init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    if(typeof window.ethereum!=undefined){
      App.web3Provider=window.ethereum
      Promise.resolve(window.ethereum.request({method:'eth_requestAccounts'})).then(function(_acc){
        // window.ethereum.defaultAccount=_acc[0];

      }).catch(function(err){
        console.log(err);
        alert('No selected account found..User rejected the request')
      });
     
    }
    else if(window.web3){
      App.web3Provider=window.web3.currentProvider;
    }
    else{
      App.web3Provider=new Web3.providers.HttpProvider("http://127.0.0.1:8545");
    }
    web3=new Web3(App.web3Provider);
    console.log(web3)
       
    window.ethereum.on('chainChanged',(_chainId)=>{
      App._clear();
      App.get_account();
    })
    window.ethereum.on('accountsChanged',(_account)=>{
      App._clear();
      App.get_account();
    })
    App.get_account();
  },

  get_account: async function(){
   await web3.eth.getAccounts(async function(err,_acc){
      web3.eth.defaultAccount=_acc[0];
      await window.ethereum.request({'method':'eth_chainId'}).then(_id=>{
        alert("Connected Chain Id: "+_id+" & Connected Account: "+web3.eth.defaultAccount)
      })
      App.get_account_info();
    });
    
    
  },
  get_account_info:async function(_account=web3.eth.defaultAccount){
    document.getElementById("accountText").style.display="block";
    document.getElementById('connectedAccountAddress').innerHTML=web3.eth.defaultAccount;
    document.getElementById('connect').innerHTML="connected";
    document.getElementById('toAddress').disabled=false;
    document.getElementById('toAddress').value=web3.eth.defaultAccount;
    document.getElementById('toAddress').disabled=true;

    await web3.eth.getBalance(web3.eth.defaultAccount,(err,currentBalance)=>{
      document.getElementById("walletBalance").innerHTML=web3.fromWei(JSON.parse(currentBalance),'ether')+'Eth'
    })
    return App.getTokenList();//work here
  },

  getTokenList:async function(){//use api

    var chainId=await window.ethereum.request({'method':'eth_chainId'}).then(_id=>{
      return _id
    })
    console.log(chainId)
    
    if(chainId=='0x1'){
      document.getElementById('mainnet_div_fromToken').style.display='block';
      document.getElementById('mainnet_div_toToken').style.display='block';
      document.getElementById('testnet_div_fromToken').style.display='none';
      document.getElementById('testnet_div_toToken').style.display='none';
      document.getElementById('testnet__fromToken').style.display='none';
      document.getElementById('testnet__toToken').style.display='none';

      $.get('/getTokenList').then(tokens=>{
        console.log(tokens)    
        this._addList(tokens);
      })
    }
    else if(chainId=='0x5'){

      document.getElementById('mainnet_div_fromToken').style.display='none';
      document.getElementById('mainnet_div_toToken').style.display='none';
      document.getElementById('testnet_div_fromToken').style.display='block';
      document.getElementById('testnet_div_toToken').style.display='block';
      document.getElementById('testnet__fromToken').style.display='none';
      document.getElementById('testnet__toToken').style.display='none';
      _tokenList=await $.get('/getTokenList').then(tokens=>{
        return tokens;
      })

    }
    else{
      document.getElementById('mainnet_div_fromToken').style.display='none';
      document.getElementById('mainnet_div_toToken').style.display='none';
      document.getElementById('testnet_div_fromToken').style.display='none';
      document.getElementById('testnet_div_toToken').style.display='none';
      document.getElementById('testnet__fromToken').style.display='block';
      document.getElementById('testnet__toToken').style.display='block';
    }
  },
  _addList:function (tokenList) { //working

    _ptag1=document.getElementById("selectFromToken");
    _br=document.createElement('br')
   
    for(i=0;i<tokenList.length;i++){

      _options=document.createElement("option");
      _options.value=tokenList[i].symbol

      _img=document.createElement("img")
      _img.src=tokenList[i].logoURI;

      _dataValue=" "+tokenList[i].symbol
      // _dataValue=tokenList[i].name+" - "+tokenList[i].symbol
      _dataNode=document.createTextNode(_dataValue);
      
      _options.appendChild(_img)
      _options.appendChild(_dataNode)

      _ptag1.appendChild(_options);
      _ptag1.appendChild(_br)

    }
    _ptag2=document.getElementById("selectToToken");
    for(i=0;i<tokenList.length;i++){

      _options=document.createElement("option");
      _options.value=tokenList[i].symbol

      _img=document.createElement("img")
      _img.src=tokenList[i].logoURI;

      _dataValue=" "+tokenList[i].symbol
      // _dataValue=tokenList[i].name+" - "+tokenList[i].symbol
      _dataNode=document.createTextNode(_dataValue);
      
      _options.appendChild(_img)
      _options.appendChild(_dataNode)

      _ptag2.appendChild(_options);
      _ptag2.appendChild(_br)

    }

  },
  _getEstimate:async function(){
    
    if(document.getElementById('connect').innerHTML=='connected'){

      var chainId=await window.ethereum.request({'method':'eth_chainId'}).then(_id=>{
        return _id
      })

      if(chainId=='0x1'){
        _fromToken=document.getElementById('selectFromToken').value
        _toToken=document.getElementById('selectToToken').value
        _tokenSymbol=document.getElementById('fromToken').options[document.getElementById('fromToken').selectedIndex].text
        _decimalVal=18;
        console.log(_tokenList) 
        for(i=0;i<_tokenList.length;i++){
          if(_tokenSymbol==_tokenList[i].symbol){
            _decimalVal=_tokenList[i].decimals
            break;
          }
        }
      }
      else if(chainId=='0x5'){
        _fromToken=document.getElementById('fromToken').value;// WETH
        _toToken=document.getElementById('toToken').value;// USDC
        _tokenSymbol=document.getElementById('fromToken').options[document.getElementById('fromToken').selectedIndex].text
        _decimalVal=18;

        for(i=0;i<_tokenList.length;i++){
          if(_tokenSymbol==_tokenList[i].symbol){
            _decimalVal=_tokenList[i].decimals
            break;
          }
        }
      }
      else{
          _fromToken=document.getElementById('_fromToken').value;//0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6 - WETH
          _toToken=document.getElementById('_toToken').value;//0x07865c6E87B9F70255377e024ace6630C1Eaa37F - USDC
      }
      
      _slippagePercentage=document.getElementById('slippage_percent').value
      _taker=document.getElementById('toAddress').value;

      _chainId=await window.ethereum.request({"method":"eth_chainId"})
      _amount=parseFloat(document.getElementById('amount').value);//1000000000000
      
      if(_amount>0){
        if(_taker!=""){
          if(_fromToken.length>0 && _toToken.length>0 && _fromToken!="select" && _toToken!="select"){
            if(_fromToken!=_toToken)
            {
              Promise.resolve($.post('/estimateSwapAmount',{chainId:_chainId,from:_fromToken,to:_toToken,amount:_amount,slippage:_slippagePercentage,decimalVal:_decimalVal,taker:_taker})).then(_response=>{

                if(_response.status!=false){
                  console.log(_response.data)
                  alert("Estimate Exchange Values fetched!! Go for Swap..")//and here
                  document.getElementById('swapToken').disabled=false
                  document.getElementById('expected_amount').value=_response.data.buyAmount
                  document.getElementById('swapInfo').style.display="block"
                  document.getElementById('_estimateGas').style.display="block"
                  document.getElementById('estimate_gas').innerHTML=_response.data.estimatedGas;
                  document.getElementById('_currentPrice').style.display="block"
                  document.getElementById('currentPrice').innerHTML=_response.data.price;
                  document.getElementById('hr_1').style.display="block";
                  document.getElementById('hr_1').style.marginBottom="0px";
                  document.getElementById('hr_2').style.marginTop="10px";
                }
                else{
                  console.log(_response)
                  // alert('Validation Failed');
                  alert("status: "+_response.data.status+" , Message: "+_response.data.message+" & Error: "+_response.data.code)
                }
                
              }).catch(err=>{
                console.log(err)  
                alert("status: "+err.status+" , Error Code: "+err.responseJSON.code+" & Error: "+err.responseJSON.reason)
              })
            }
            else{
              alert("Sell token & Buy token must be different.")
            }
            
          }
          else{
            alert("Required detail missing..select token")
          }
        }
        else{
          alert("connect with wallet.")
        }
      }else{
        alert("amount must be greater than 0.")
      }
    }
    else{
      console.log("connect to wallet first")
      alert("connect to wallet first.")
    }
    
  },
  _swapApproval:async function(response){

    const _fromTokenAddress=response.sellTokenAddress
    const _maxApproval=response.sellAmount
    const _allowanceTarget=response.allowanceTarget

    const _taker=response.from

    const erc20=[
        {
            "constant": true,
            "inputs": [],
            "name": "name",
            "outputs": [
                {
                    "name": "",
                    "type": "string"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_spender",
                    "type": "address"
                },
                {
                    "name": "_value",
                    "type": "uint256"
                }
            ],
            "name": "approve",
            "outputs": [
                {
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "totalSupply",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_from",
                    "type": "address"
                },
                {
                    "name": "_to",
                    "type": "address"
                },
                {
                    "name": "_value",
                    "type": "uint256"
                }
            ],
            "name": "transferFrom",
            "outputs": [
                {
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "decimals",
            "outputs": [
                {
                    "name": "",
                    "type": "uint8"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_owner",
                    "type": "address"
                }
            ],
            "name": "balanceOf",
            "outputs": [
                {
                    "name": "balance",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "symbol",
            "outputs": [
                {
                    "name": "",
                    "type": "string"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_to",
                    "type": "address"
                },
                {
                    "name": "_value",
                    "type": "uint256"
                }
            ],
            "name": "transfer",
            "outputs": [
                {
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_owner",
                    "type": "address"
                },
                {
                    "name": "_spender",
                    "type": "address"
                }
            ],
            "name": "allowance",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "payable": true,
            "stateMutability": "payable",
            "type": "fallback"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "owner",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "name": "spender",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "Approval",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "from",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "name": "to",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "Transfer",
            "type": "event"
        }
    ];        

    const tokenContract= web3.eth.contract(erc20).at(_fromTokenAddress)
    try{
      await tokenContract.approve(_allowanceTarget,_maxApproval,async (err,txId)=>{//,{from:_taker,gas:"15000000"}
        console.log(txId)
        if(txId!=undefined)
        {
            await web3.eth.getTransactionReceipt(txId,async (err,txReceipt)=>{
                console.log(txReceipt)
                // if(txReceipt!=null){//set it to not null
                //  alert("transaction approval done")
                    await web3.eth.sendTransaction(response,async(err,swapTxId)=>{//getting error while swapping   ,{from:_taker,value:response.sellAmount,gas:'15000000'}  ,maxFeePerGas:web3.toWei('5','Gwei'),maxPriorityFeePerGas:web3.toWei('1.5',"Gwei")
                        console.log(swapTxId)
                        if(swapTxId!=undefined){
                          alert("Swap Token Transaction Done!!! Wait a While & Check you balance..")
                
                          await web3.eth.getTransactionReceipt(swapTxId,_isSwap=>{
                            console.log(_isSwap)
                            if(_isSwap!=null){
                                alert("Swap Token Transaction Receipt generated..")
                            }
                            else{
                                alert("Token couldn't be swapped..receipt didn't get generated.")
                            }
                         })
                        }
                        else{
                          alert("Token couldn't be swapped..Transaction revert.")
                        }
                    })
                // }
                // else{
                //     console.log("transaction approval receipt generation reverted")
                // }   
            })
        }
        else{
            console.log("Transaction Approval Revert");
            alert("Transaction Approval Revert");
        }
       
      });
    }catch(err){
        console.log(err)
        return false;
    }
},
  _swapToken:async function()
  {//api for trADING
    if(document.getElementById('connect').innerHTML=='connected')
    {

      var chainId=await window.ethereum.request({'method':'eth_chainId'}).then(_id=>{
        return _id
      })

      if(chainId=='0x1'){
        _fromToken=document.getElementById('selectFromToken').value
        _toToken=document.getElementById('selectToToken').value
        _tokenSymbol=document.getElementById('fromToken').options[document.getElementById('fromToken').selectedIndex].text
        _decimalVal=18;
        console.log(_tokenList) 
        for(i=0;i<_tokenList.length;i++){
          if(_tokenSymbol==_tokenList[i].symbol){
            _decimalVal=_tokenList[i].decimals
            break;
          }
        }
      }
      else if(chainId=='0x5'){
        _fromToken=document.getElementById('fromToken').value;//- WETH
        _toToken=document.getElementById('toToken').value;//- USDC
        _tokenSymbol=document.getElementById('fromToken').options[document.getElementById('fromToken').selectedIndex].text
        _decimalVal=18;

        for(i=0;i<_tokenList.length;i++){
          if(_tokenSymbol==_tokenList[i].symbol){
            _decimalVal=_tokenList[i].decimals
            break;
          }
        }
      }
      else{
          _fromToken=document.getElementById('_fromToken').value;//0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6 - WETH
          _toToken=document.getElementById('_toToken').value;//0x07865c6E87B9F70255377e024ace6630C1Eaa37F - USDC
      }

      var _slippagePercentage=document.getElementById('slippage_percent').value//default=0.01%
      var _taker=document.getElementById('toAddress').value;
      var _chainId=await window.ethereum.request({"method":"eth_chainId"})
      var _amount=parseFloat(document.getElementById('amount').value);
      if(_amount>0){
        if(_taker!=""){
          if(_fromToken.length>0 && _toToken.length>0 && _fromToken!="select" && _toToken!="select")
          {
            if(_fromToken!=_toToken)
            {
              try
              {
                response=await $.post('/swapToken',{chainId:_chainId,from:_fromToken,to:_toToken,amount:_amount,slippage:_slippagePercentage,decimalVal:_decimalVal,taker:_taker}).then(async _response=>{
                  return _response;
                }) 
                  
                if(response.status!=false){
                  console.log(response) 
                  alert("Get Exchange Quotes Details!!! Ready for Approval..")
                  await App._swapApproval(response.data)
                }
                else{
                  console.log(response.data)
                  // alert("BAD REQUEST")
                  alert("status: "+response.data.status+" , Message: "+response.data.message+" & Error: "+response.data.code)
                }
              }
              catch(err){
                console.log(err)
                // alert("status: "+err.status+" , Error Code: "+err.responseJSON.code+" & Error: "+err.responseJSON.reason)
              }
            }
            else{
              alert("Sell token & Buy token must be different.")
            }
        }
          else{
            alert("Required detail missing..select token.")
          }
        }
        else{
          alert("connect with wallet")
        }
      }else{
        alert("amount must be greater than 0.")
      }
    }
    else{
      console.log("connect to wallet first")
      alert("connect to wallet first.")
    }
  },
  

_clear:function(){
    document.getElementById('_fromToken').value=""
    document.getElementById('_toToken').value=""
    document.getElementById('fromToken').value="select"
    document.getElementById('toToken').value="select"
    document.getElementById('amount').value=""
    document.getElementById('expected_amount').value=""
    document.getElementById('slippage_percent').value="1"
  // document.getElementById('toAddress').value=""
    document.getElementById('estimate_gas').innerHTML=0;
    document.getElementById('currentPrice').innerHTML=0
    document.getElementById('swapToken').disabled=true
    document.getElementById('selectFromToken').value="select"
    document.getElementById('selectToToken').value="select"

}

};
