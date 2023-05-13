const axios=require('axios');
const Web3=require('web3');
require('dotenv').config();

module.exports={
    
    _tokenList:(callback)=>{

        var url="https://tokens.coingecko.com/uniswap/all.json"
        Promise.resolve(axios.get(url)).then(_response=>{
            callback(_response.data)
          })
    },
    _getEstimate:(options,callback)=>{
        
        _chainId=options.chainId
        _fromToken=options.from
        _toToken=options.to
        _amount=options.amount
        _amountInWei=Web3.utils.toWei(_amount,'ether')
        _slippagePercentage=(options.slippage)/100
        _taker=options.taker
        _test=""
        if(_chainId!="0x1"){
            _testnet="goerli"
            _test=_testnet.concat(".")
        }
        var url="https://"+_test+"api.0x.org/swap/v1/price?sellToken="+_fromToken+"&buyToken="+_toToken+"&sellAmount="+_amountInWei+"&slippagePercentage="+_slippagePercentage+"&takerAddress="+_taker
        console.log(url)
        Promise.resolve(axios.get(url)).then(_response=>{
            console.log(_response.data)
            callback({status:true,data:_response.data})
        }).catch(err=>{
            console.log(err)
            callback({status:false,data:err})
        })
    },
     
    _swapToken:async(options,callback)=>{

        _chainId=options.chainId
        _fromToken=options.from
        _toToken=options.to
        _amount=options.amount
        _amountInWei=Web3.utils.toWei(_amount,'ether')
        _slippagePercentage=(options.slippage)/100
        _taker=options.taker
        _skipValidation=false
        _test=""
        if(_chainId!="0x1"){
            _testnet="goerli"
            _test=_testnet.concat(".")
            console.log(_test)
            _skipValidation=true
        }

        var swapUrl="https://"+_test+"api.0x.org/swap/v1/quote?sellToken="+_fromToken+"&buyToken="+_toToken+"&sellAmount="+_amountInWei+"&slippagePercentage="+_slippagePercentage+"&takerAddress="+_taker+"&skipValidation="+_skipValidation
        console.log(swapUrl)
        const header={
                '0x-api-key':process.env.SWAP_API_KEY
            }
        axios.get(swapUrl,{headers:header}).then(async(_res)=>{
            callback({status:true,data:_res.data})
        }).catch(err=>{
            console.log(err)
            callback({status:false,data:err})
        })
    }
}


