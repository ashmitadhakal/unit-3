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
        var width = 1100,
            height = 690;

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
        };
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
                "#D4B9DA",
                "#C994C7",
                "#DF65B0",
                "#DD1C77",
                "#980043"
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
                    return colorScale(d.properties[expressed]);
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
