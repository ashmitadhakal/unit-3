// Javascript file by Ashmita, 2024

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
        //add basemap to map
        var asianCountries = map.append("path")
            .datum(basemap)
            .attr("class","countries")
            .attr("d",path);

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
    
        //add nepal provinces to map
        var nepal = map.selectAll(".regions")
            .data(nepalProvince)
            .enter()
            .append("path")
            .attr("class",function(d){
                return "regions " + d.properties.Name;
            })
            .attr("d",path);
    };
};
