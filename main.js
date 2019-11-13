
['mousemove', 'touchmove', 'touchstart'].forEach(function (eventType) {
    document.getElementById('container').addEventListener(
        eventType,
        function (e) {
            var chart,
                point,
                i,
                event;

            for (i = 0; i < Highcharts.charts.length; i = i + 1) {
                chart = Highcharts.charts[i];
                // Find coordinates within the chart
                event = chart.pointer.normalize(e);
                // Get the hovered point
                point = chart.series[0].searchPoint(event, true);

                if (point) {
                    point.highlight(e);
                }
            }
        }
    );
});

/**
 * Override the reset function, we don't need to hide the tooltips and
 * crosshairs.
 */
Highcharts.Pointer.prototype.reset = function () {
    return undefined;
};

/**
 * Highlight a point by showing tooltip, setting hover state and draw crosshair
 */
Highcharts.Point.prototype.highlight = function (event) {
    event = this.series.chart.pointer.normalize(event);
    this.onMouseOver(); // Show the hover marker
    this.series.chart.tooltip.refresh(this); // Show the tooltip
    this.series.chart.xAxis[0].drawCrosshair(event, this); // Show the crosshair
};

/**
 * Synchronize zooming through the setExtremes event handler.
 */
function syncExtremes(e) {
    var thisChart = this.chart;

    if (e.trigger !== 'syncExtremes') { // Prevent feedback loop
        Highcharts.each(Highcharts.charts, function (chart) {
            if (chart !== thisChart) {
                if (chart.xAxis[0].setExtremes) { // It is null while updating
                    chart.xAxis[0].setExtremes(
                        e.min,
                        e.max,
                        undefined,
                        false,
                        { trigger: 'syncExtremes' }
                    );
                }
            }
        });
    }
}

function parse_json(jsonData) {
    var energyData = jsonData.filter(function(elm) {
        return elm['type'] === 'power' && elm['id'] !== 'Springfield.fuel_tech.rooftop_solar.power';
    }).map(function(elm) {
        return {
          values: elm['history']['data'],
          text: elm['id'].substring(22)
        };
    });

    var startTime = Date(jsonData[0]['history']['start']*1000)

    for (i = 0; i < energyData.length;i++){
        var sampled_value_lst = []
        var timestamp = jsonData[0]['history']['start']*1000
        for (j = 0; j < energyData[i]['values'].length;j+=6){
            var sampled_value_with_timestamp = [timestamp,energyData[i]['values'][j]]
            sampled_value_lst.push(sampled_value_with_timestamp)
            timestamp += 1000*60*30

        }
        energyData[i]['values'] = sampled_value_lst
    }


    area_chart = Highcharts.chart('container', { 
        chart:{
            type: 'area'
        },
        title:{
            text:'Energy Springfield'
        },
        xAxis:{
            crosshair:true,
            type:'datetime'
        },
        legend:{
            align:'right',
            verticalAlign:'bottom',
            layout:'vertical',
            width:'50%'
        },
        plotOptions:{
            area:{
                stacking:'normal',
                events:{
                    mouseOver:function(){
                        this.update({
                            zIndex:1
                        })
                    }
                }
            }
        },
        tooltip:{
            positioner: function(){
                return{
                    x:this.chart.chartWidth - this.label.width-250,
                    y:10
                };
            },
            pointFormat:'{point.y}',
            borderWidth:0,
            backgroundColor:'none',
            headerFormat:'',
            shadow:false,
            style:{
                fontsize:'12px'
            }
        },
        series:[{
            name:energyData[1]['text'],
            data:energyData[1]['values'],
            tooltip:{
                valueSuffix:' '+jsonData[1]['units']
            }
        },{
            name:energyData[2]['text'],
            data:energyData[2]['values'],
            tooltip:{
                valueSuffix:' '+jsonData[2]['units']
            }
        },{
            name:energyData[3]['text'],
            data:energyData[3]['values'],
            tooltip:{
                valueSuffix:' '+jsonData[3]['units']
            }
        },{
            name:energyData[4]['text'],
            data:energyData[4]['values'],
            tooltip:{
                valueSuffix:' '+jsonData[4]['units']
            }
        },{
            name:energyData[5]['text'],
            data:energyData[5]['values'],
            tooltip:{
                valueSuffix:' '+jsonData[5]['units']
            }
        },{
            name:energyData[6]['text'],
            data:energyData[6]['values'],
            tooltip:{
                valueSuffix:' '+jsonData[6]['units']
            }
        },{
            name:energyData[0]['text'],
            data:energyData[0]['values'],
            tooltip:{
                valueSuffix:' '+jsonData[0]['units']
            }
        }]
	});

    // Highcharts.chart('container_donut',{
    //     chart:{
    //         type:'variablepie'
    //     },
    //     series:{
    //         innerSize:'50%',
    //         data:energyData[0]['values']
    //     }
    // })

    var priceData = jsonData.filter(function(elm) {
        return elm['type'] === 'price';
    }).map(function(elm) {
        return {
          values: elm['history']['data'],
          text: elm['id'].substring(22)

        };
    });
    for (i = 0; i < priceData.length;i++){
        var sampled_value_lst = []
        var timestamp = jsonData[0]['history']['start']*1000
        for (j = 0; j < priceData[i]['values'].length;j++){
            var sampled_value_with_timestamp = [timestamp,priceData[i]['values'][j]]
            sampled_value_lst.push(sampled_value_with_timestamp)
            timestamp += 1000*60*30

        }
        priceData[i]['values'] = sampled_value_lst
    }
    console.debug(priceData[0]['values'].length)

   price_line_chart = Highcharts.chart('container2',{
        xAxis:{
            crosshair:true,
            type:'datetime'
        },
        legend:{
            enabled:false
        },title:{
            text:'Price $/MWh'
        },tooltip:{
            positioner: function(){
                return{
                    x:this.chart.chartWidth - this.label.width,
                    y:10
                };
            },
            pointFormat:'{point.y}',
            borderWidth:0,
            backgroundColor:'none',
            headerFormat:'',
            shadow:false,
            style:{
                fontsize:'12px'
            }
        },
        series:[{
            name:priceData[0]['text'],
            data:priceData[0]['values'],
            tooltip:{
                valueSuffix:' '+'$/MWh'
            }
        }]
    })





    var tempData = jsonData.filter(function(elm) {
        return elm['type'] === 'temperature';
    }).map(function(elm) {
        return {
          values: elm['history']['data'],
          text: elm['id'].substring(22)
        };
    });

    for (i = 0; i < tempData.length;i++){
        var sampled_value_lst = []
        var timestamp = jsonData[0]['history']['start']*1000
        for (j = 0; j < tempData[i]['values'].length;j++){
            var sampled_value_with_timestamp = [timestamp,tempData[i]['values'][j]]
            sampled_value_lst.push(sampled_value_with_timestamp)
            timestamp += 1000*60*30

        }
        tempData[i]['values'] = sampled_value_lst
    }
    temp_line_chart = Highcharts.chart('container3',{
        xAxis:{
            crosshair:true,
            type:'datetime'
        },
        legend:{
            enabled:false
        },
        title:{
            text:'Temperature °F'
        },tooltip:{
            positioner: function(){
                return{
                    x:this.chart.chartWidth - this.label.width,
                    y:10
                };
            },
            pointFormat:'{point.y}',
            borderWidth:0,
            backgroundColor:'none',
            headerFormat:'',
            shadow:false,
            style:{
                fontsize:'12px'
            }
        },
        series:[{
            name:tempData[0]['text'],
            data:tempData[0]['values'],
            tooltip:{
                valueSuffix:' '+'°F'
            }
        }]
    })    

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