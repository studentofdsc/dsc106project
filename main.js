var globalEnergyData = {
  keys: [],
  values: []
};

function updateGlobalEnergyData(data) {
  globalEnergyData['values'] = [];
  for (var idx = 0; idx < data[0]['values'].length; idx ++) {
    var energyBreakup = data.map(elm => {return elm['values'][idx]});
    globalEnergyData['values'].push(energyBreakup);
  }
  globalEnergyData['keys'] = data.map(elm => elm['text']);
}

function parse_json(jsonData) {
    var energyData = jsonData.filter(function(elm) {
        return elm['type'] === 'power';
    }).map(function(elm) {
        return {
          values: elm['history']['data'],
          text: elm['id']
        };
    });
    console.debug(energyData)
    updateGlobalEnergyData(energyData);
    console.debug(globalEnergyData)
    var globalEnergyData_dict = {}
    for (i = 0; i < globalEnergyData['keys'].length; i++){
        globalEnergyData_dict[globalEnergyData['keys'][i]] = globalEnergyData['values'][i]
    }
    console.debug(globalEnergyData_dict)

    Highcharts.chart('container', {
    	chart: {
    		type: 'area'
    	},
    	series: globalEnergyData_dict
	});

    // var priceData = jsonData.filter(function(elm) {
    //     return elm['type'] === 'price';
    // }).map(function(elm) {
    //     return {
    //       values: elm['data'],
    //       text: elm['id']
    //     };
    // });
    // var tempData = jsonData.filter(function(elm) {
    //     return elm['type'] === 'temperature';
    // }).map(function(elm) {
    //     return {
    //       values: elm['data'],
    //       text: elm['id']
    //     };
    // });
}
function fetchJSONFile(filePath, callbackFunc) {
    console.debug("Fetching file:", filePath);
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4) {
            if (httpRequest.status === 200 || httpRequest.status === 0) {
                console.info("Loaded file:", filePath);
                var data = JSON.parse(httpRequest.responseText);
                console.debug("Data parsed into valid JSON!");
                console.debug(data);
                if (callbackFunc) callbackFunc(data);
            } else {
                console.error("Error while fetching file", filePath, 
                    "with error:", httpRequest.statusText);
            }
        }
    };
    httpRequest.open('GET', filePath);
    httpRequest.send();
}

function doMain() {

    fetchJSONFile('springfield.json',parse_json);
}

document.onload = doMain();