// Javascript file by Ashmita, 2024

window.onload = setMap();

//set uo chloropleth map
function setMap(){
    //map frame dimensions
    var width = 900,
        height = 500;

    //create new svg container for map
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

    //create Albers equal area conic projection centered on Nepal
    var projection = d3.geoAlbers()
        .center([80.78,28.8])
        .rotate([-2,0,0])
        .parallels([1,10])
        .scale(6000)
        .translate([width / 3, height / 2]);
    var path = d3.geoPath()
        .projection(projection);

    //use Promise.all to parallelize asynchronous data loading
    var promises = [d3.csv("data/Educational_Institutions.csv"),
                    d3.json("data/Nepal_province.topojson")
                    ];
    Promise.all(promises).then(callback);

    function callback(data){
        
        //variable holding data from promises
        var csvData = data[0],
            provinces = data[1];
        
        //translate TOPOJSON to JSON
        var nepalProvince = topojson.feature(provinces, provinces.objects.province).features;
    
        //add nepal provinces to map
        var nepal = map.selectAll(".regions")
            .data(nepalProvince)
            .enter()
            .append("path")
            .attr("class",function(d){
                return "regions " + d.properties.name;
            })
            .attr("d",path);
    };
};
