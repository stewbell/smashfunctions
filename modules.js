
const timmer = require('./nodejsclasses.js');

exports.predict = function (req, res) {
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
exports.loadBQforecast = function (req, res) {

  console.log("Load BQ starting...");
  query();
  res.send("done")


}

async function query() {
  // Queries the U.S. given names dataset for the state of Texas.
  var BQqueryTimmer = new timmer("NodeJS load from BQ")
  const { BigQuery } = require('@google-cloud/bigquery');
  const bigquery = new BigQuery();
  const query = `CALL \`modelsales1.model5.InitialProcedure\`();`;

  // For all options, see https://cloud.google.com/bigquery/docs/reference/rest/v2/jobs/query
  const options = {
    query: query,
    // Location must match that of the dataset(s) referenced in the query.
    location: 'australia-southeast1',
  };
  // Run the query as a job
  const [job] = await bigquery.createQueryJob(options);
  console.log(`Job ${job.id} started.`);

  // Wait for the query to finish
  const [rows] = await job.getQueryResults();
  BQqueryTimmer.lapTime("Load Complete")
  // Print the results
  //console.log('Rows:', rows);
  //rows.forEach(row => console.log(row));
}
/*
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
module.exports = timmer
*/




