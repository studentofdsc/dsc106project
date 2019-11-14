['mousemove', 'touchmove', 'touchstart'].forEach(function (eventType){
    document.getElementById('container').addEventListener(
        eventType,
        function (e){
            var chart
            var point
            var i
            var event
            for (i = 0; i < Highcharts.charts.length; i = i + 1){
                chart = Highcharts.charts[i]
                event = chart.pointer.normalize(e)
                point = chart.series[0].searchPoint(event, true)
                if (point){
                    point.highlight(e)
                }
            }
        }
    );
});
Highcharts.Pointer.prototype.reset = function (){
    return undefined
};
Highcharts.Point.prototype.highlight = function (event){
    event = this.series.chart.pointer.normalize(event)
    this.onMouseOver()
    this.series.chart.tooltip.refresh(this);
    this.series.chart.xAxis[0].drawCrosshair(event, this)
};
function syncExtremes(e){
    var thisChart = this.chart

    if (e.trigger !== 'syncExtremes'){ 
        Highcharts.each(Highcharts.charts, function (chart){
            if (chart !== thisChart){
                if (chart.xAxis[0].setExtremes){
                    chart.xAxis[0].setExtremes(
                        e.min,
                        e.max,
                        undefined,
                        false,
                        {trigger: 'syncExtremes'}
                    );
                }
            }
        });
    }
}


var global_timestamp_to_val_dict = {}


function parse_json(jsonData) {
    var energyData = jsonData.filter(function(elm) {
        return elm['type'] === 'power' && elm['id'] !== 'Springfield.fuel_tech.rooftop_solar.power';
    }).map(function(elm) {
        return {
          values: elm['history']['data'],
          text: elm['id'].substring(22)
        };
    });

    var startTime = jsonData[0]['history']['start']*1000

    for (i = 0; i < energyData.length;i++){
        var sampled_value_lst = []
        var timestamp = jsonData[0]['history']['start']*1000
        var energy_id = jsonData[i]['id'].substring(22)
        for (j = 0; j < energyData[i]['values'].length;j+=6){
            var sampled_value = energyData[i]['values'][j]
            var sampled_value_with_timestamp = [timestamp,sampled_value]
            if (timestamp in global_timestamp_to_val_dict){
                global_timestamp_to_val_dict[timestamp].push([energy_id,sampled_value])
            }
            else{
                global_timestamp_to_val_dict[timestamp] = [[energy_id,sampled_value]]
            }
            sampled_value_lst.push(sampled_value_with_timestamp)
            timestamp += 1000*60*30

        }
        energyData[i]['values'] = sampled_value_lst
    }
    console.debug(global_timestamp_to_val_dict)


    area_chart = Highcharts.chart('container', { 
        chart:{
            type: 'area'
        },
        title:{
            text:'Energy Springfield',
            align:'left'
        },
        xAxis:{
            crosshair:true,
            type:'datetime'
        },
        yAxis:{
            title:'MW'
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
            },
            series:{
                states:{
                    hover:{
                        enabled:false
                    },
                    inactive:{
                        opacity:1
                    }
                }
            }
        },
        tooltip:{
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
                fontsize:'8px'
            }
        },
        series:[{
            name:energyData[1]['text'],
            data:energyData[1]['values'],
            color:'#C74523',
            tooltip:{
                valuePrefix:'Distillate ',
                valueSuffix:' '+jsonData[1]['units']
            }
        },{
            name:energyData[2]['text'],
            data:energyData[2]['values'],
            color:'#FDB462',
            tooltip:{
                valuePrefix:'Gas (CCGT) ',
                valueSuffix:' '+jsonData[2]['units']
            }
        },{
            name:energyData[3]['text'],
            data:energyData[3]['values'],
            color:'#4582B4',
            tooltip:{
                valuePrefix:'Hydro ',
                valueSuffix:' '+jsonData[3]['units']
            }
        },{
            name:energyData[4]['text'],
            data:energyData[4]['values'],
            color:'#88AFD0',
            tooltip:{
                valuePrefix:'Pumps ',
                valueSuffix:' '+jsonData[4]['units']
            }
        },{
            name:energyData[5]['text'],
            data:energyData[5]['values'],
            color:'#437607',
            tooltip:{
                valuePrefix:'Wind ',
                valueSuffix:' '+jsonData[5]['units']
            }
        },{
            name:energyData[6]['text'],
            data:energyData[6]['values'],
            color:'#977AB1',
            tooltip:{
                valuePrefix:' Exports ',
                valueSuffix:' '+jsonData[6]['units']
            }
        },{
            name:energyData[0]['text'],
            data:energyData[0]['values'],
            color:'#121212',
            tooltip:{
                valuePrefix:'Black Coal ',
                valueSuffix:' '+jsonData[0]['units']
            }
        }]
	});



    var priceData = jsonData.filter(function(elm) {
        return elm['type'] === 'price'
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





    var tempData = jsonData.filter(function(elm){
        return elm['type'] === 'temperature'
    }).map(function(elm){
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

    var point_data_lst = global_timestamp_to_val_dict[startTime]

    var pie_chart = Highcharts.chart('container_pie',{
            chart:{
                type:'pie'
            },
            title:{
                text:""
            },
            series:[{
                data:[{
                    name:point_data_lst[0][0],
                    y:point_data_lst[0][1],
                    color:'#121212'
                },{
                    name:point_data_lst[1][0],
                    y:point_data_lst[1][1],
                    color:'#C74523'
                },{
                    name:point_data_lst[2][0],
                    y:point_data_lst[2][1],
                    color:'#FDB462'
                },{
                    name:point_data_lst[3][0],
                    y:point_data_lst[3][1],
                    color:'#4582B4'
                },{
                    name:point_data_lst[4][0],
                    y:point_data_lst[4][1],
                    color:'#88AFD0'
                },{
                    name:point_data_lst[5][0],
                    y:point_data_lst[5][1],
                    color:'#437607'
                },{
                    name:point_data_lst[6][0],
                    y:point_data_lst[6][1],
                    color:'#977AB1'
                }]
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
    }
    httpRequest.open('GET', filePath)
    httpRequest.send()
}

function doMain() {

    fetchJSONFile('springfield.json',parse_json)
}

document.onload = doMain()