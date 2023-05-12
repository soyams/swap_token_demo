const express = require('express');
const app = express();
const port = 3000 || process.env.PORT;
const Web3 = require('web3');
const app_connect = require('./connection/app.js');
const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use('/', express.static('public_static'));

app.get("/getTokenList",(req,res)=>{
  app_connect._tokenList(_response=>{
    res.send(_response.tokens)
  })
})
app.post("/estimateSwapAmount",(req,res)=>{
  var _option=req.body
  console.log(_option)
  app_connect._getEstimate(_option,_response=>{
    res.send(_response)

  })
})

app.post("/swapToken",(req,res)=>{
  var _option =req.body
  app_connect._swapToken(_option,_res=>{
    res.send(_res)
  })
})

app.listen(port, () => {

  app_connect.web3 = new Web3(new Web3.providers.HttpProvider(process.env.RPC_URL_GOERLI+process.env.INFURA_API_KEY));
  // console.log(app_connect.web3)
  console.log("Express Listening at http://localhost:" + port);

});
