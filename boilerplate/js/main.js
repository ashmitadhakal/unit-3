// Javascript file by Ashmita, 2024

(function(){
    //pseudo-global variable
    var attrArray= ["ECD/PPCs","GeneralSchool","CLCs","TechSchools","TSLCLevel","TechnSchools","Unis","Campuses","Medical","OpenUnis"];
    var expressed = attrArray[3];       //initial attribute

    //begin script when window loads
    window.onload = setMap();

    //set uo chloropleth map
    function setMap(){
        //map frame dimensions
        var width = window.innerWidth*0.45,
            height = 400;

        //create new svg container for map
        var map = d3.select("body")
            .append("svg")
            .attr("class", "map")
            .attr("width", width)
            .attr("height", height);

        //create Albers equal area conic projection centered on Nepal
        var projection = d3.geoAlbers()
            .center([0,28.41])
            .rotate([-84.13,0,0])
            .parallels([26.93,29.88])
            .scale(3000)
            .translate([width / 2.1, height / 2]);
        var path = d3.geoPath()
            .projection(projection);

        //use Promise.all to parallelize asynchronous data loading
        var promises = [d3.csv("data/Educational_Institutions.csv"),
                        d3.json("data/Nepal_province.topojson"),
                        d3.json("data/basemap.topojson")
                        ];
        Promise.all(promises).then(callback);

        function callback(data){

            //variable holding data from promises
            var csvData = data[0],
                provinces = data[1],
                basemap = data[2];

            //translate TOPOJSON to JSON
            var nepalProvince = topojson.feature(provinces, provinces.objects.province).features,
                basemap = topojson.feature(basemap, basemap.objects.basemap);
            //console.log(csvData)
            //console.log(nepalProvince)
                //add basemap to map
            var asianCountries = map.append("path")
                .datum(basemap)
                .attr("class","countries")
                .attr("d",path);

            //place graticule in map
            setGraticule(map, path);

            //join csv data to GeoJson enumeration units
            nepal = joinData(nepalProvince, csvData);
            

            var colorScale = makeColorScale(csvData);

            //add enumeration units to the map
            setEnumerationUnits(nepalProvince, map, path, colorScale);

            setChart(csvData, colorScale);
        };
    };

    //function to create a coordinated bar chart
    function setChart(csvData, colorScale){
        //chart frame dimensions
        //chart frame dimensions
        var chartWidth = window.innerWidth * 0.425,
        chartHeight = 473,
        leftPadding = 25,
        rightPadding = 2,
        topBottomPadding = 5,
        chartInnerWidth = chartWidth - leftPadding - rightPadding,
        chartInnerHeight = chartHeight - topBottomPadding * 2,
        translate = "translate(" + leftPadding + "," + topBottomPadding + ")";

        //create a second svg element to hold the bar chart
        var chart = d3.select("body")
            .append("svg")
            .attr("width", chartWidth)
            .attr("height", chartHeight)
            .attr("class", "chart");

        //create a rectangle for chart background fill
        var chartBackground = chart.append("rect")
            .attr("class", "chartBackground")
            .attr("width", chartInnerWidth)
            .attr("height", chartInnerHeight)
            .attr("transform", translate);

        //create a scale to size bars proportionally to frame and for axis
        var yScale = d3.scaleLinear()
            .range([463, 0])
            .domain([0, 80]);

        //set bars for each province
        var bars = chart.selectAll(".bar")
            .data(csvData)
            .enter()
            .append("rect")
            .sort(function(a, b){
                return b[expressed]-a[expressed]
                })
            .attr("class", function(d){
                return "bar " + d.Provinces;
            })
            .attr("width", chartInnerWidth / csvData.length - 1)
            .attr("x", function(d, i){
                return i * (chartInnerWidth / csvData.length) + leftPadding;
            })
            .attr("height", function(d, i){
                return 463 - yScale(parseFloat(d[expressed]));
            })
            .attr("y", function(d, i){
                return yScale(parseFloat(d[expressed])) + topBottomPadding;
            })
            .style("fill", function(d){
                return colorScale(d[expressed]);
            });

        //create a text element for the chart title
        var chartTitle = chart.append("text")
            .attr("x", 40)
            .attr("y", 40)
            .attr("class", "chartTitle")
            .text("Number of Technical Schools in Each Province of Nepal");

        //create vertical axis generator
        var yAxis = d3.axisLeft()
            .scale(yScale);

        //place axis
        var axis = chart.append("g")
            .attr("class", "axis")
            .attr("transform", translate)
            .call(yAxis);

        //create frame for chart border
        var chartFrame = chart.append("rect")
            .attr("class", "chartFrame")
            .attr("width", chartInnerWidth)
            .attr("height", chartInnerHeight)
            .attr("transform", translate);

        //annotate bars with attribute value text
        var numbers = chart.selectAll(".numbers")
            .data(csvData)
            .enter()
            .append("text")
            .sort(function(a, b){
                return b[expressed]-a[expressed]
            })
            .attr("class", function(d){
                return "numbers " + d.provinces;
            })
            .attr("text-anchor", "middle")
            .attr("x", function(d, i){
                return i * (chartInnerWidth / csvData.length) + leftPadding + (chartInnerWidth / csvData.length - 1) / 2;
            })
            .attr("y", function(d){
                var barHeight = 463 - yScale(parseFloat(d[expressed]));
                return chartHeight - barHeight + 15;
            })
            .text(function(d){
                return d[expressed];
        });
        };
    
        function setGraticule(map, path){
            var graticule = d3.geoGraticule().step([5, 5]);
            
            //create graticule background
            var gratBackground = map.append('path')
                .datum(graticule.outline())
                .attr('class', 'gratBackground')
                .attr('d', path);
        
            var gratLines = map.selectAll('.gratLines')
                .data(graticule.lines())
                .enter()
                .append('path')
                .attr('class', 'gratLines')
                .attr('d', path);
        };

        function joinData(nepalProvince, csvData){
            //loop through CSV to assign each set of the scv attribute values to geojson region
            for (var i = 0; i < csvData.length; i++){
                var csvRegion = csvData[i];     //the current region
                var csvKey = csvRegion.Provinces;   //the csv primary key
                

                //loop through geojson region to find the correct region
                for (var j = 0; j < nepalProvince.length; j++){
                    var geojsonProps =  nepalProvince[j].properties;    //the current region geojson properties
                    var geojsonKey = geojsonProps.Name;         //the gepjson properties primary key
                // console.log("geojson key'", geojsonKey)

                    //where primary keys match. transfer csv data to gepjson properties object
                    if (geojsonKey == csvKey){
                        //assign all attributes and values
                        attrArray.forEach(function(attr){
                            var val = csvRegion[attr];  //get csv attribute value
                            geojsonProps[attr] = val;   //assign attribute and value to geojson properties
                        });
                    };
                };
            };
            console.log(nepalProvince)
            return nepalProvince;
        };

        //function to create color scale generator
        function makeColorScale(data) {
            var colorClasses = [
                "#feedde",
                "#fdd0a2",
                "#fdae6b",
                "#fd8d3c",
                "#f16913",
                "#d94801",
                "#8c2d04"
            ];

            //create color scale generator
            var colorScale = d3.scaleQuantile()
                .range(colorClasses);

            //build two-value array of minimum and maximum expressed attribute values
            var minmax = [
                d3.min(data, function(d) { return parseFloat(d[expressed]); }),
                d3.max(data, function(d) { return parseFloat(d[expressed]); })
                ];
            //assign array of expressed values as scale domain
            colorScale.domain(minmax);
            return colorScale;
        };

        function setEnumerationUnits(nepalProvince, map, path, colorScale){
            //draw front layer
            var regions = map.selectAll(".regions") 
                .data(nepalProvince)
                .enter()
                .append("path")
                .attr("class", function (d){
                    return "regions" + d.properties.Name;
                })
                .attr("d", path)        
                .style("fill", function(d){            
                    var value = d.properties[expressed];            
                    if(value) {                
                        return colorScale(d.properties[expressed]);            
                    } else {                
                        return "#ccc";            
                    }  
                })
        }; 
})();
