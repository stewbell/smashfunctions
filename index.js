exports.helloWorld = (req, res) => {
 

res.set('Access-Control-Allow-Origin', '*');

if (req.method === 'OPTIONS') {
  // Send response to OPTIONS requests
  res.set('Access-Control-Allow-Methods', 'PUT');
  res.set('Access-Control-Allow-Headers', '*');
  res.set('Access-Control-Max-Age', '3600');
  res.status(204).send('');
} else {
  inJSON = req.body
  const axios = require('axios');

  axios.post('https://smash-epny2zfy7q-ts.a.run.app/predict', inJSON)
  .then(function (response) {
    
    res.json(response.data);
  })
  .catch(function (error) {
    console.log(error);
  });


  
 
  //res.json(inJSON);
}
};
