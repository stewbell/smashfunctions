
function predict(req, res) {
  var predictTime = new timmer("Call Prediction API");
  inJSON = req.body;
  const axios = require('axios')
  axios.post('https://smash-epny2zfy7q-ts.a.run.app/predict', inJSON)
    .then(function (response) {
      //console.log("response", response.data);
      predictTime.lapTime("Call completed")

      res.json(response.data);
      return response.data;
    })
    .catch(function (error) {
      console.log(error);
    });

};
function loadBQforecast(req, res) {
  query(`CALL \`modelsales1.model5.InitialProcedure\`();`).then(function (data) {
    BQPrediction = data;
    console.log(BQPrediction[0]);
    res.json(BQPrediction[0]);

  });


}

async function query(querySQL) {
  // Queries the U.S. given names dataset for the state of Texas.
  var BQqueryTimmer = new timmer("Load from BQ")
  const { BigQuery } = require('@google-cloud/bigquery');
  const bigquery = new BigQuery();
  //const query = `CALL \`modelsales1.model5.InitialProcedure\`();`;

  // For all options, see https://cloud.google.com/bigquery/docs/reference/rest/v2/jobs/query
  const options = {
    query: querySQL,
    // Location must match that of the dataset(s) referenced in the query.
    location: 'australia-southeast1',
  };
  // Run the query as a job
  const [job] = await bigquery.createQueryJob(options);
  console.log(`Job ${job.id} started.`);

  // Wait for the query to finish
  const [rows] = await job.getQueryResults();
  BQqueryTimmer.lapTime("Load Complete")
  return rows;

}

class timmer {
  constructor(label) {
    this.label = label
    var d = new Date();
    this.startTime = d.getTime();
    console.log(`${this.label} - Started`);
  }
  lapTime(lapComment) {
    var dd = new Date();
    var lapTimeMS = dd.getTime() - this.startTime;
    console.log(`${this.label} - ${lapComment} - ${lapTimeMS}ms`)
  }
}





var BQPrediction;
console.log("COLD START");
query(`CALL \`modelsales1.model5.InitialProcedure\`();`).then(function (data) {
  BQPrediction = data;
  console.log(BQPrediction[0]);
  
});


exports.helloWorld = (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    // Send response to OPTIONS requests
    res.set('Access-Control-Allow-Methods', 'PUT');
    res.set('Access-Control-Allow-Headers', '*');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
  } else {
    console.log("Incomming Path", req.path);

    switch (req.path) {
      case '/functions/predict':
        predict(req, res); break;
      case '/functions/loadBQforecast':
        loadBQforecast(req, res); break;
      case '/loadBQforecast':
        loadBQforecast(req, res); break;
      case '/functions/testLoadBQ':
        testloadBQ(req, res); break;
      default:
        res.send("No URI found");
    }


    // res.json("xxxxx");

  }
};
