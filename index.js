
//Functions definitions-------------------------------------------------------------

function predict(req, res) {
  var predictTime = new timmer("Call Prediction API");
  console.log("request", req.query);
  predictionCombinations = fullDataset.getPredictionCombinations(req.query);
  predictTime.lapTime("combinations creation");

  const axios = require('axios')
 
  axios.post('https://smash-epny2zfy7q-ts.a.run.app/predict', predictionCombinations)
    .then(function (response) {
      predictTime.lapTime("Call completed");
      //Match combination with the response
      console.log("response",response.data.predictions);
      var i;
      var counter = 0;
      for (i of predictionCombinations.instances){
        i.ForecastTotal = response.data.predictions[counter++];
      // console.log("combine",response[counter]);
      }
      console.log("forecast",predictionCombinations);
      


      res.json(response.data);
      //return response.data;
    })
    .catch(function (error) {
      console.log(error);
    });

};
function loadBQforecast(req, res) {
  res.json(BQPrediction)
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

function loadData(req, res) {
  res.json(fullDataset.aggFilter("OREO SLUG"));
}


//Class Definitions-------------------------------------------------------------------------
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
class dataset {
  initialLoad = [];
  constructor() {
    this.datasetObj = [];
  }
  loadFromGCS(inObj) {
    const { Storage } = require('@google-cloud/storage');
    // Creates a client
    const storage = new Storage();
    const myBucket = storage.bucket('smashfiles');
    const file = myBucket.file('forecast/forecast.json');
    var fileLoad = new timmer("Load file");

    //-
    // Download a file into memory. The contents will be available as the second
    // argument in the demonstration below, `contents`.
    //-
    this.datasetObj = [];
    file.download(function (err, contents) {

      fileLoad.lapTime("Load complete");
      //convert from newline delimited JSON to Obj
      var lines = contents.toString().split(/\n/);
      lines.pop();
      fileLoad.lapTime("Split to array");
      var wrapped = "[" + lines.join(",") + "]";
      fileLoad.lapTime("Create string");
      var obj = JSON.parse(wrapped);
      fileLoad.lapTime("To json");
      console.log("debug", obj[2])
      inObj.datasetObj = obj;
      //this.datasetObj = obj;
      //dataset.initialLoad = obj;
    })

  }
  aggFilter(Prod) {
    var aggTimmer = new timmer("Start Aggregation and filter")
    var sumArray = [];
    var i;
    var a = 0;
    console.log("prod value", this.datasetObj[1].Product)
    console.log("input value", Prod)
    //summarise the data
    for (i of this.datasetObj) {
      if (String(Prod) == String(i.Product)) {
        var key = [String(i.Period).substring(0, 7), String(i.Product)].join('$$');
        sumArray[key] = (sumArray[key] ===
          undefined) ? [i.ForecastBaseline, i.ForecastTotal] : [sumArray[key][0] + i.ForecastBaseline, sumArray[key][1] + i.ForecastTotal];
      }
    }
    var tempDataset = [];
    for (key in sumArray) {
      var a = key.split('$$');
      var b = sumArray[key];
      var c = [a[0], b].flat();
      tempDataset.push(c);
    }
    tempDataset.sort();
    aggTimmer.lapTime("Agg Finished");
    console.log("Sum Array", tempDataset);
    return tempDataset;
  }
  getPredictionCombinations(filterJSON) {
    var promo = filterJSON.promo;
    var product = filterJSON.product;
    var period = filterJSON.period;
    var i;
    var resultLine;
    var resultArr = []  ;
    var outValue;
    for (i of this.datasetObj) {
      if (String(product) == String(i.Product)
        && String(period) == String(i.Period)) {
        resultLine = {
          "MONTH": period,
          "Distributor": i.Distributor,
          "product": i.Product,
          "OutletType": i.OutletType,
          "CountryFeatures": 'NOEVENT',
          "ProductFeatures": promo
        }
        resultArr.push(resultLine);
      }
    }
    var outValue = new Object();
    outValue.instances = resultArr;
    //console.log("out value", outValue);
    return outValue;
  }
}

//Load Gloabal----------------------------------------------------------------------------
console.log("COLD START");
var fullDataset = new dataset();
fullDataset.loadFromGCS(fullDataset);


//URL Routing--------------------------------------------------------------------
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
      case '/functions/loaddata':
        loadData(req, res); break;
      case '/loaddata':
        loadData(req, res); break;
      default:
        res.send("No URI found");
    }


    // res.json("xxxxx");

  }
};
