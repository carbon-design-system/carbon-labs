import"./chartElement-Cz7RgHCZ.js";import{x as t}from"./lit-element-in3Y6axH.js";const se=[{title:"",prompt:"Make a pair-plot of all columns with scatter plots, use bar distributions when coloumns match",result:{$schema:"https://vega.github.io/schema/vega-lite/v5.json",data:{url:"https://raw.githubusercontent.com/vega/vega-datasets/main/data/cars.json"},repeat:{row:["Miles_per_Gallon","Cylinders","Displacement","Horsepower","Weight_in_lbs","Acceleration"],column:["Miles_per_Gallon","Cylinders","Displacement","Horsepower","Weight_in_lbs","Acceleration"]},spec:{layer:[{mark:{type:"point",tooltip:!0},encoding:{x:{field:{repeat:"column"},type:"quantitative",scale:{zero:!1}},y:{field:{repeat:"row"},type:"quantitative",scale:{zero:!1}}}},{transform:[{filter:"datum.repeat_row === datum.repeat_column"}],mark:"bar",encoding:{x:{field:{repeat:"column"},bin:!0,type:"quantitative"},y:{aggregate:"count",type:"quantitative"}}}]}}},{title:"",prompt:"Create two violin plots with sepal width",result:{$schema:"https://vega.github.io/schema/vega/v5.json",description:"A violin plot example showing distributions for iris sepal width.",width:300,height:400,padding:5,config:{axisBand:{bandPosition:1,tickExtra:!0,tickOffset:0}},signals:[{name:"plotWidth",update:"(width - 50)/3"},{name:"height",update:"height * 1"}],data:[{name:"iris",url:"https://raw.githubusercontent.com/mwaskom/seaborn-data/refs/heads/master/iris.csv",format:{type:"csv"},transform:[{type:"filter",expr:"datum.species != null && datum.sepal_width != null"}]},{name:"density",source:"iris",transform:[{type:"kde",field:"sepal_width",groupby:["species"],extent:[1,5]}]},{name:"stats",source:"iris",transform:[{type:"aggregate",groupby:["species"],fields:["sepal_width","sepal_width","sepal_width"],ops:["q1","median","q3"],as:["q1","median","q3"]}]}],scales:[{name:"layout",type:"band",range:"width",domain:{data:"iris",field:"species"}},{name:"yscale",type:"linear",range:"height",round:!0,domain:{data:"iris",field:"sepal_width"},domainMin:1,domainMax:5,zero:!1,nice:!0,reverse:!1},{name:"hscale",type:"linear",range:[0,{signal:"plotWidth"}],domain:{data:"density",field:"density"}},{name:"color",type:"ordinal",domain:{data:"iris",field:"species"},range:"category"}],axes:[{orient:"bottom",scale:"layout",zindex:1,title:"Species"},{orient:"left",scale:"yscale",zindex:1,title:"Sepal Width"}],marks:[{type:"group",from:{facet:{data:"density",name:"violin",groupby:"species"}},encode:{enter:{xc:{scale:"layout",field:"species",band:.5},width:{signal:"plotWidth"},height:{signal:"height"}}},data:[{name:"summary",source:"stats",transform:[{type:"filter",expr:"datum.species === parent.species"}]}],marks:[{type:"area",from:{data:"violin"},encode:{enter:{orient:{value:"horizontal"},fill:{scale:"color",field:{parent:"species"}}},update:{y:{field:"value",scale:"yscale"},xc:{signal:"plotWidth / 2"},width:{scale:"hscale",field:"density"}}}},{type:"rect",from:{data:"summary"},encode:{enter:{fill:{value:"black"},width:{value:2}},update:{y:{scale:"yscale",field:"q1"},y2:{scale:"yscale",field:"q3"},xc:{signal:"plotWidth / 2"}}}},{type:"rect",from:{data:"summary"},encode:{enter:{fill:{value:"black"},height:{value:2},width:{value:8}},update:{y:{scale:"yscale",field:"median"},xc:{signal:"plotWidth / 2"}}}}]}]}},{title:"Airline passengers example",prompt:"Show a repeating line chart with 6,8,24 and 36 month averages",result:{$schema:"https://vega.github.io/schema/vega-lite/v5.json",data:{url:"https://raw.githubusercontent.com/mwaskom/seaborn-data/master/flights.csv"},hconcat:[{vconcat:[{mark:"line",encoding:{x:{field:"date",type:"temporal",title:"Date"},y:{field:"passengers",type:"quantitative",title:"Passengers"}},transform:[{window:[{op:"mean",field:"passengers",as:"6-month-moving-average"}],frame:[-6,0]}],layer:[{mark:"line"},{mark:{type:"line",color:"red",strokeDash:[5,5]},encoding:{y:{field:"6-month-moving-average"}}}],title:"6-month Moving Average"},{mark:"line",encoding:{x:{field:"date",type:"temporal",title:"Date"},y:{field:"passengers",type:"quantitative",title:"Passengers"}},transform:[{window:[{op:"mean",field:"passengers",as:"8-month-moving-average"}],frame:[-8,0]}],layer:[{mark:"line"},{mark:{type:"line",color:"blue",strokeDash:[5,5]},encoding:{y:{field:"8-month-moving-average"}}}],title:"8-month Moving Average"}]},{vconcat:[{mark:"line",encoding:{x:{field:"date",type:"temporal",title:"Date"},y:{field:"passengers",type:"quantitative",title:"Passengers"}},transform:[{window:[{op:"mean",field:"passengers",as:"24-month-moving-average"}],frame:[-24,0]}],layer:[{mark:"line"},{mark:{type:"line",color:"green",strokeDash:[5,5]},encoding:{y:{field:"24-month-moving-average"}}}],title:"24-month Moving Average"},{mark:"line",encoding:{x:{field:"date",type:"temporal",title:"Date"},y:{field:"passengers",type:"quantitative",title:"Passengers"}},transform:[{window:[{op:"mean",field:"passengers",as:"36-month-moving-average"}],frame:[-36,0]}],layer:[{mark:"line"},{mark:{type:"line",color:"orange",strokeDash:[5,5]},encoding:{y:{field:"36-month-moving-average"}}}],title:"36-month Moving Average"}]}]}},{title:"",prompt:"Create two violin plots with sepal width",result:{$schema:"https://vega.github.io/schema/vega/v5.json",description:"A violin plot example showing distributions for iris sepal width.",width:300,height:400,padding:5,config:{axisBand:{bandPosition:1,tickExtra:!0,tickOffset:0}},signals:[{name:"plotWidth",update:"(width - 50)/3"},{name:"height",update:"height * 1"}],data:[{name:"iris",url:"https://raw.githubusercontent.com/mwaskom/seaborn-data/refs/heads/master/iris.csv",format:{type:"csv"},transform:[{type:"filter",expr:"datum.species != null && datum.sepal_length != null"}]},{name:"density",source:"iris",transform:[{type:"kde",field:"sepal_length",groupby:["species"],extent:[3,9]}]},{name:"stats",source:"iris",transform:[{type:"aggregate",groupby:["species"],fields:["sepal_length","sepal_length","sepal_length"],ops:["q1","median","q3"],as:["q1","median","q3"]}]}],scales:[{name:"layout",type:"band",range:"width",domain:{data:"iris",field:"species"}},{name:"yscale",type:"linear",range:"height",round:!0,domain:{data:"iris",field:"sepal_length"},domainMin:3,domainMax:9,zero:!1,nice:!0,reverse:!1},{name:"hscale",type:"linear",range:[0,{signal:"plotWidth"}],domain:{data:"density",field:"density"}},{name:"color",type:"ordinal",domain:{data:"iris",field:"species"},range:"category"}],axes:[{orient:"bottom",scale:"layout",zindex:1,title:"Species"},{orient:"left",scale:"yscale",zindex:1,title:"Sepal Width"}],marks:[{type:"group",from:{facet:{data:"density",name:"violin",groupby:"species"}},encode:{enter:{xc:{scale:"layout",field:"species",band:.5},width:{signal:"plotWidth"},height:{signal:"height"}}},data:[{name:"summary",source:"stats",transform:[{type:"filter",expr:"datum.species === parent.species"}]}],marks:[{type:"area",from:{data:"violin"},encode:{enter:{orient:{value:"horizontal"},fill:{scale:"color",field:{parent:"species"}}},update:{y:{field:"value",scale:"yscale"},xc:{signal:"plotWidth / 2"},width:{scale:"hscale",field:"density"}}}},{type:"rect",from:{data:"summary"},encode:{enter:{fill:{value:"black"},width:{value:2}},update:{y:{scale:"yscale",field:"q1"},y2:{scale:"yscale",field:"q3"},xc:{signal:"plotWidth / 2"}}}},{type:"rect",from:{data:"summary"},encode:{enter:{fill:{value:"black"},height:{value:2},width:{value:8}},update:{y:{scale:"yscale",field:"median"},xc:{signal:"plotWidth / 2"}}}}]}]}},{title:"",prompt:"",result:{$schema:"https://vega.github.io/schema/vega-lite/v5.json",data:{url:"https://vega.github.io/vega-lite/data/seattle-weather.csv"},title:"Daily Max Temperatures (C) in Cleveland, OH",config:{view:{strokeWidth:0,step:13},axis:{domain:!1}},mark:"rect",encoding:{x:{field:"date",timeUnit:"date",type:"ordinal",title:"Day",axis:{labelAngle:0,format:"%e"}},y:{field:"date",timeUnit:"month",type:"ordinal",title:"Month"},color:{field:"temp_max",aggregate:"max",type:"quantitative",legend:{title:null}}}}}],ce=[{name:"trellis",spec:{name:"trellis_barley",$schema:"https://vega.github.io/schema/vega-lite/v5.json",data:{url:"https://vega.github.io/vega-lite/data/barley.json"},mark:"point",height:{step:12},encoding:{facet:{field:"site",type:"ordinal",columns:2,sort:{op:"median",field:"yield"}},x:{aggregate:"median",field:"yield",type:"quantitative",scale:{zero:!1}},y:{field:"variety",type:"ordinal",sort:"-x"},color:{field:"year",type:"nominal"}}}},{name:"trellis_barley",spec:{name:"trellis_barley",$schema:"https://vega.github.io/schema/vega-lite/v5.json",data:{url:"https://vega.github.io/vega-lite/data/barley.json"},mark:"point",height:{step:12},encoding:{facet:{field:"site",type:"ordinal",columns:2,sort:{op:"median",field:"yield"}},x:{aggregate:"median",field:"yield",type:"quantitative",scale:{zero:!1}},y:{field:"variety",type:"ordinal",sort:"-x"},color:{field:"year",type:"nominal"}}}},{name:"hconcat",spec:{$schema:"https://vega.github.io/schema/vega-lite/v5.json",description:"Horizontally concatenated charts that show different types of discretizing scales.",data:{values:[{a:"A",b:28},{a:"B",b:55},{a:"C",b:43},{a:"D",b:91},{a:"E",b:81},{a:"F",b:53},{a:"G",b:19},{a:"H",b:87},{a:"I",b:52}]},hconcat:[{mark:"circle",encoding:{y:{field:"b",type:"nominal",sort:null,axis:{ticks:!1,domain:!1,title:null}},size:{field:"b",type:"quantitative",scale:{type:"quantize"}},color:{field:"b",type:"quantitative",scale:{type:"quantize",zero:!0},legend:{title:"Quantize"}}}},{mark:"circle",encoding:{y:{field:"b",type:"nominal",sort:null,axis:{ticks:!1,domain:!1,title:null}},size:{field:"b",type:"quantitative",scale:{type:"quantile",range:[80,160,240,320,400]}},color:{field:"b",type:"quantitative",scale:{type:"quantile",scheme:"magma"},legend:{format:"d",title:"Quantile"}}}},{mark:"circle",encoding:{y:{field:"b",type:"nominal",sort:null,axis:{ticks:!1,domain:!1,title:null}},size:{field:"b",type:"quantitative",scale:{type:"threshold",domain:[30,70],range:[80,200,320]}},color:{field:"b",type:"quantitative",scale:{type:"threshold",domain:[30,70],scheme:"viridis"},legend:{title:"Threshold"}}}}],resolve:{scale:{color:"independent",size:"independent"}}}},{name:"vconcat",spec:{$schema:"https://vega.github.io/schema/vega-lite/v5.json",description:"Horizontally concatenated charts that show different types of discretizing scales.",data:{values:[{a:"A",b:28},{a:"B",b:55},{a:"C",b:43},{a:"D",b:91},{a:"E",b:81},{a:"F",b:53},{a:"G",b:19},{a:"H",b:87},{a:"I",b:52}]},vconcat:[{mark:"circle",encoding:{x:{field:"b",type:"nominal",sort:null,axis:{ticks:!1,domain:!1,title:null}},size:{field:"b",type:"quantitative",scale:{type:"quantize"}},color:{field:"b",type:"quantitative",scale:{type:"quantize",zero:!0},legend:{title:"Quantize"}}}},{mark:"circle",encoding:{x:{field:"b",type:"nominal",sort:null,axis:{ticks:!1,domain:!1,title:null}},size:{field:"b",type:"quantitative",scale:{type:"quantile",range:[80,160,240,320,400]}},color:{field:"b",type:"quantitative",scale:{type:"quantile",scheme:"magma"},legend:{format:"d",title:"Quantile"}}}},{mark:"circle",encoding:{x:{field:"b",type:"nominal",sort:null,axis:{ticks:!1,domain:!1,title:null}},size:{field:"b",type:"quantitative",scale:{type:"threshold",domain:[30,70],range:[80,200,320]}},color:{field:"b",type:"quantitative",scale:{type:"threshold",domain:[30,70],scheme:"viridis"},legend:{title:"Threshold"}}}}],resolve:{scale:{color:"independent",size:"independent"}}}},{name:"concat",spec:{$schema:"https://vega.github.io/schema/vega-lite/v5.json",description:"A population pyramid for the US in 2000.",data:{url:"https://vega.github.io/vega-lite/data/population.json"},transform:[{filter:"datum.year == 2000"},{calculate:"datum.sex == 2 ? 'Female' : 'Male'",as:"gender"}],spacing:0,hconcat:[{transform:[{filter:{field:"gender",equal:"Female"}}],title:"Female",mark:"bar",encoding:{y:{field:"age",axis:null,sort:"descending"},x:{aggregate:"sum",field:"people",title:"population",axis:{format:"s"},sort:"descending"},color:{field:"gender",scale:{range:["#675193","#ca8861"]},legend:null}}},{width:20,view:{stroke:null},mark:{type:"text",align:"center"},encoding:{y:{field:"age",type:"ordinal",axis:null,sort:"descending"},text:{field:"age",type:"quantitative"}}},{transform:[{filter:{field:"gender",equal:"Male"}}],title:"Male",mark:"bar",encoding:{y:{field:"age",title:null,axis:null,sort:"descending"},x:{aggregate:"sum",field:"people",title:"population",axis:{format:"s"}},color:{field:"gender",legend:null}}}],config:{view:{stroke:null},axis:{grid:!1}}}},{name:"repeat",spec:{$schema:"https://vega.github.io/schema/vega-lite/v5.json",repeat:{row:["Horsepower","Acceleration","Miles_per_Gallon"],column:["Miles_per_Gallon","Acceleration","Horsepower"]},spec:{data:{url:"https://vega.github.io/vega-lite/examples/data/cars.json"},mark:"point",params:[{name:"brush",select:{type:"interval",resolve:"union",on:"[pointerdown[event.shiftKey], window:pointerup] > window:pointermove!",translate:"[pointerdown[event.shiftKey], window:pointerup] > window:pointermove!",zoom:"wheel![event.shiftKey]"}},{name:"grid",select:{type:"interval",resolve:"global",translate:"[pointerdown[!event.shiftKey], window:pointerup] > window:pointermove!",zoom:"wheel![!event.shiftKey]"},bind:"scales"}],encoding:{x:{field:{repeat:"column"},type:"quantitative"},y:{field:{repeat:"row"},type:"quantitative",axis:{minExtent:30}},color:{condition:{param:"brush",field:"Origin",type:"nominal"},value:"grey"}}}}},{name:"repeat and layer",spec:{$schema:"https://vega.github.io/schema/vega-lite/v5.json",data:{url:"https://vega.github.io/vega-lite/examples/data/movies.json"},repeat:{layer:["US Gross","Worldwide Gross"]},spec:{mark:"line",encoding:{x:{bin:!0,field:"IMDB Rating",type:"quantitative"},y:{aggregate:"mean",field:{repeat:"layer"},type:"quantitative",title:"Mean of US and Worldwide Gross"},color:{datum:{repeat:"layer"},type:"nominal"}}}}},{name:"concat",spec:{$schema:"https://vega.github.io/schema/vega-lite/v5.json",description:"Two horizonally concatenated charts that show a histogram of precipitation in Seattle and the relationship between min and max temperature.",data:{url:"https://vega.github.io/vega-lite/data/seattle-weather.csv"},transform:[{filter:"datum.location === 'Seattle'"}],columns:2,concat:[{mark:"bar",encoding:{x:{timeUnit:"month",field:"date",type:"ordinal"},y:{aggregate:"mean",field:"precipitation"}}},{mark:"bar",encoding:{x:{timeUnit:"month",field:"date",type:"ordinal"},y:{aggregate:"median",field:"precipitation"}}},{mark:"point",encoding:{x:{field:"temp_min",bin:!0},y:{field:"temp_max",bin:!0},size:{aggregate:"count"}}}]}}];/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const pe={title:"Components/Experimental/Chart",component:"clabs-chat-chart"},re={content:{},debugMode:!1,carbonify:!0,containerHeight:"300px",containerWidth:"100%",chartTheme:"g100",renderMethod:"canvas",loading:!0,disableOptions:!1,disableEditor:!1,disableCodeInspector:!1,disableExport:!1,disableFullscreen:!1,enableMultiSelection:!1,enableSingleSelection:!1,enableZooming:!1,enableLegendFiltering:!1,enableTooltip:!1},ne={content:{control:{type:"object"},default:"",description:"content - Specification string including data.values"},debugMode:{control:{type:"boolean"},default:!0,description:"debug-mode - Enable explicit error details in chart viewer"},carbonify:{control:{type:"boolean"},default:!0,description:"carbonify - Enable post-hoc carbon charts styling"},containerHeight:{control:{type:"text"},default:"246px",description:"container-height - Must be valid CSS"},containerWidth:{control:{type:"text"},default:"100%",description:"container-width - Must be valid CSS"},chartTheme:{control:{type:"select"},default:"white",description:"theme - Chart color theme",options:["white","g100"]},renderMethod:{control:{type:"select"},default:"canvas",description:"canvas - Chart rendering mode",options:["canvas","svg"]},loading:{control:{type:"boolean"},default:!0,description:"loading - enabled by default until spec is displayed"},disableOptions:{control:{type:"boolean"},default:!1,description:"disable-options - Hide button in options"},disableEditor:{control:{type:"boolean"},default:!1,description:"disable-editor - Hide button in options"},disableFullscreen:{control:{type:"boolean"},default:!1,description:"disable-fullscreen - Hide button in options"},disableCodeInspector:{control:{type:"boolean"},default:!1,description:"disable-code-inspector - Hide button in options"},disableExport:{control:{type:"boolean"},default:!1,description:"disable-export - Hide button in options"},enableZooming:{control:{type:"boolean"},default:!1,description:"enable-zooming - Enable zooming in charts"},enableTooltip:{control:{type:"boolean"},default:!1,description:"enable-tooltip - Enable tooltip in charts"},enableLegendFiltering:{control:{type:"boolean"},default:!1,description:"enable-legend-filtering - Allow users to filter data using legend"},enableMultiSelection:{control:{type:"boolean"},default:!1,description:"enable-multi-selections - Allow users to select multi items in groups with brush"},enableSingleSelection:{control:{type:"boolean"},default:!1,description:"enable-single-selections - Allow users to select a single item"}},M={render:()=>t` <clabs-chat-chart
    content="${`{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"IBM stock price over time.","data":{"values":[{"symbol":"IBM","date":"Jan 1 2000","price":100.52},{"symbol":"IBM","date":"Feb 1 2000","price":92.11},{"symbol":"IBM","date":"Mar 1 2000","price":106.11},{"symbol":"IBM","date":"Apr 1 2000","price":99.95},{"symbol":"IBM","date":"May 1 2000","price":96.31},{"symbol":"IBM","date":"Jun 1 2000","price":98.33},{"symbol":"IBM","date":"Jul 1 2000","price":100.74},{"symbol":"IBM","date":"Aug 1 2000","price":118.62},{"symbol":"IBM","date":"Sep 1 2000","price":101.19},{"symbol":"IBM","date":"Oct 1 2000","price":88.5},{"symbol":"IBM","date":"Nov 1 2000","price":84.12},{"symbol":"IBM","date":"Dec 1 2000","price":76.47},{"symbol":"IBM","date":"Jan 1 2001","price":100.76},{"symbol":"IBM","date":"Feb 1 2001","price":89.98},{"symbol":"IBM","date":"Mar 1 2001","price":86.63},{"symbol":"IBM","date":"Apr 1 2001","price":103.7},{"symbol":"IBM","date":"May 1 2001","price":100.82},{"symbol":"IBM","date":"Jun 1 2001","price":102.35},{"symbol":"IBM","date":"Jul 1 2001","price":94.87},{"symbol":"IBM","date":"Aug 1 2001","price":90.25},{"symbol":"IBM","date":"Sep 1 2001","price":82.82},{"symbol":"IBM","date":"Oct 1 2001","price":97.58},{"symbol":"IBM","date":"Nov 1 2001","price":104.5},{"symbol":"IBM","date":"Dec 1 2001","price":109.36},{"symbol":"IBM","date":"Jan 1 2002","price":97.54},{"symbol":"IBM","date":"Feb 1 2002","price":88.82},{"symbol":"IBM","date":"Mar 1 2002","price":94.15},{"symbol":"IBM","date":"Apr 1 2002","price":75.82},{"symbol":"IBM","date":"May 1 2002","price":72.97},{"symbol":"IBM","date":"Jun 1 2002","price":65.31},{"symbol":"IBM","date":"Jul 1 2002","price":63.86},{"symbol":"IBM","date":"Aug 1 2002","price":68.52},{"symbol":"IBM","date":"Sep 1 2002","price":53.01},{"symbol":"IBM","date":"Oct 1 2002","price":71.76},{"symbol":"IBM","date":"Nov 1 2002","price":79.16},{"symbol":"IBM","date":"Dec 1 2002","price":70.58},{"symbol":"IBM","date":"Jan 1 2003","price":71.22},{"symbol":"IBM","date":"Feb 1 2003","price":71.13},{"symbol":"IBM","date":"Mar 1 2003","price":71.57},{"symbol":"IBM","date":"Apr 1 2003","price":77.47},{"symbol":"IBM","date":"May 1 2003","price":80.48},{"symbol":"IBM","date":"Jun 1 2003","price":75.42},{"symbol":"IBM","date":"Jul 1 2003","price":74.28},{"symbol":"IBM","date":"Aug 1 2003","price":75.12},{"symbol":"IBM","date":"Sep 1 2003","price":80.91},{"symbol":"IBM","date":"Oct 1 2003","price":81.96},{"symbol":"IBM","date":"Nov 1 2003","price":83.08},{"symbol":"IBM","date":"Dec 1 2003","price":85.05},{"symbol":"IBM","date":"Jan 1 2004","price":91.06},{"symbol":"IBM","date":"Feb 1 2004","price":88.7},{"symbol":"IBM","date":"Mar 1 2004","price":84.41},{"symbol":"IBM","date":"Apr 1 2004","price":81.04},{"symbol":"IBM","date":"May 1 2004","price":81.59},{"symbol":"IBM","date":"Jun 1 2004","price":81.19},{"symbol":"IBM","date":"Jul 1 2004","price":80.19},{"symbol":"IBM","date":"Aug 1 2004","price":78.17},{"symbol":"IBM","date":"Sep 1 2004","price":79.13},{"symbol":"IBM","date":"Oct 1 2004","price":82.84},{"symbol":"IBM","date":"Nov 1 2004","price":87.15},{"symbol":"IBM","date":"Dec 1 2004","price":91.16},{"symbol":"IBM","date":"Jan 1 2005","price":86.39},{"symbol":"IBM","date":"Feb 1 2005","price":85.78},{"symbol":"IBM","date":"Mar 1 2005","price":84.66},{"symbol":"IBM","date":"Apr 1 2005","price":70.77},{"symbol":"IBM","date":"May 1 2005","price":70.18},{"symbol":"IBM","date":"Jun 1 2005","price":68.93},{"symbol":"IBM","date":"Jul 1 2005","price":77.53},{"symbol":"IBM","date":"Aug 1 2005","price":75.07},{"symbol":"IBM","date":"Sep 1 2005","price":74.7},{"symbol":"IBM","date":"Oct 1 2005","price":76.25},{"symbol":"IBM","date":"Nov 1 2005","price":82.98},{"symbol":"IBM","date":"Dec 1 2005","price":76.73},{"symbol":"IBM","date":"Jan 1 2006","price":75.89},{"symbol":"IBM","date":"Feb 1 2006","price":75.09},{"symbol":"IBM","date":"Mar 1 2006","price":77.17},{"symbol":"IBM","date":"Apr 1 2006","price":77.05},{"symbol":"IBM","date":"May 1 2006","price":75.04},{"symbol":"IBM","date":"Jun 1 2006","price":72.15},{"symbol":"IBM","date":"Jul 1 2006","price":72.7},{"symbol":"IBM","date":"Aug 1 2006","price":76.35},{"symbol":"IBM","date":"Sep 1 2006","price":77.26},{"symbol":"IBM","date":"Oct 1 2006","price":87.06},{"symbol":"IBM","date":"Nov 1 2006","price":86.95},{"symbol":"IBM","date":"Dec 1 2006","price":91.9},{"symbol":"IBM","date":"Jan 1 2007","price":93.79},{"symbol":"IBM","date":"Feb 1 2007","price":88.18},{"symbol":"IBM","date":"Mar 1 2007","price":89.44},{"symbol":"IBM","date":"Apr 1 2007","price":96.98},{"symbol":"IBM","date":"May 1 2007","price":101.54},{"symbol":"IBM","date":"Jun 1 2007","price":100.25},{"symbol":"IBM","date":"Jul 1 2007","price":105.4},{"symbol":"IBM","date":"Aug 1 2007","price":111.54},{"symbol":"IBM","date":"Sep 1 2007","price":112.6},{"symbol":"IBM","date":"Oct 1 2007","price":111},{"symbol":"IBM","date":"Nov 1 2007","price":100.9},{"symbol":"IBM","date":"Dec 1 2007","price":103.7},{"symbol":"IBM","date":"Jan 1 2008","price":102.75},{"symbol":"IBM","date":"Feb 1 2008","price":109.64},{"symbol":"IBM","date":"Mar 1 2008","price":110.87},{"symbol":"IBM","date":"Apr 1 2008","price":116.23},{"symbol":"IBM","date":"May 1 2008","price":125.14},{"symbol":"IBM","date":"Jun 1 2008","price":114.6},{"symbol":"IBM","date":"Jul 1 2008","price":123.74},{"symbol":"IBM","date":"Aug 1 2008","price":118.16},{"symbol":"IBM","date":"Sep 1 2008","price":113.53},{"symbol":"IBM","date":"Oct 1 2008","price":90.24},{"symbol":"IBM","date":"Nov 1 2008","price":79.65},{"symbol":"IBM","date":"Dec 1 2008","price":82.15},{"symbol":"IBM","date":"Jan 1 2009","price":89.46},{"symbol":"IBM","date":"Feb 1 2009","price":90.32},{"symbol":"IBM","date":"Mar 1 2009","price":95.09},{"symbol":"IBM","date":"Apr 1 2009","price":101.29},{"symbol":"IBM","date":"May 1 2009","price":104.85},{"symbol":"IBM","date":"Jun 1 2009","price":103.01},{"symbol":"IBM","date":"Jul 1 2009","price":116.34},{"symbol":"IBM","date":"Aug 1 2009","price":117},{"symbol":"IBM","date":"Sep 1 2009","price":118.55},{"symbol":"IBM","date":"Oct 1 2009","price":119.54},{"symbol":"IBM","date":"Nov 1 2009","price":125.79},{"symbol":"IBM","date":"Dec 1 2009","price":130.32},{"symbol":"IBM","date":"Jan 1 2010","price":121.85},{"symbol":"IBM","date":"Feb 1 2010","price":127.16},{"symbol":"IBM","date":"Mar 1 2010","price":125.55}]},"transform":[{"filter":"datum.symbol==='IBM'"}],"mark":{"type":"area","line":{"color":"darkgreen"},"color":{"x1":1,"y1":1,"x2":1,"y2":0,"gradient":"linear","stops":[{"offset":0,"color":"white"},{"offset":1,"color":"darkgreen"}]}},"encoding":{"x":{"field":"date","type":"temporal"},"y":{"field":"price","type":"quantitative"}}}`}">
  </clabs-chat-chart>`},x={render:()=>t`
    <div style="display:flex;gap:16px;">
      <clabs-chat-chart
        thumbnail
        content="${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Stock prices of 5 Tech Companies over Time.","data":{"url":"https://vega.github.io/vega-lite/data/stocks.csv"},"mark":{"type":"line","point":{"filled":false}},"encoding":{"x":{"timeUnit":"year","field":"date"},"y":{"aggregate":"mean","field":"price","type":"quantitative"},"color":{"field":"symbol","type":"nominal"}}}'}"
        container-height="156px"
        container-width="156px">
      </clabs-chat-chart>
      <clabs-chat-chart
        thumbnail
        content="${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Boxplot example with random data","data":{"values":[{"group":"Group A","value":34},{"group":"Group A","value":28},{"group":"Group A","value":55},{"group":"Group B","value":91},{"group":"Group B","value":81},{"group":"Group B","value":67},{"group":"Group C","value":45},{"group":"Group C","value":66},{"group":"Group C","value":73},{"group":"Group D","value":28},{"group":"Group D","value":35},{"group":"Group D","value":56},{"group":"Group E","value":12},{"group":"Group E","value":45},{"group":"Group E","value":99}]},"mark":"boxplot","encoding":{"y":{"field":"group","type":"nominal"},"x":{"field":"value","type":"quantitative"}}}'}"
        container-height="156px"
        container-width="156px">
      </clabs-chat-chart>
      <clabs-chat-chart
        thumbnail
        content="${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","data":{"url":"https://vega.github.io/vega-lite/data/seattle-weather.csv"},"title":"Daily Max Temperatures (C) in Cleveland, OH","config":{"view":{"strokeWidth":0,"step":13},"axis":{"domain":false}},"mark":"rect","encoding":{"x":{"field":"date","timeUnit":"date","type":"ordinal","title":"Day","axis":{"labelAngle":0,"format":"%e"}},"y":{"field":"date","timeUnit":"month","type":"ordinal","title":"Month"},"color":{"field":"temp_max","aggregate":"max","type":"quantitative","legend":{"title":null}}}}'}"
        container-height="156px"
        container-width="156px">
      </clabs-chat-chart>
      <clabs-chat-chart
        thumbnail
        content="${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"A scatterplot showing body mass and flipper lengths of penguins.","data":{"url":"https://vega.github.io/vega-lite/examples/data/penguins.json"},"mark":"point","encoding":{"x":{"field":"Flipper Length (mm)","type":"quantitative","scale":{"zero":false}},"y":{"field":"Body Mass (g)","type":"quantitative","scale":{"zero":false}},"color":{"field":"Species","type":"nominal"}}}'}"
        container-height="156px"
        container-width="156px">
      </clabs-chat-chart>
      <clabs-chat-chart
        thumbnail
        content="${`{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","title":"Deaths by natural disasters","data":{"url":"https://vega.github.io/vega-lite/examples/data/disasters.csv"},"width":600,"height":400,"transform":[{"filter":"datum.Entity !== 'All natural disasters'"}],"mark":{"type":"circle","opacity":0.8,"stroke":"black","strokeWidth":1},"encoding":{"x":{"field":"Year","type":"temporal","axis":{"grid":false}},"y":{"field":"Entity","type":"nominal","axis":{"title":""}},"size":{"field":"Deaths","type":"quantitative","title":"Annual Global Deaths","legend":{"clipHeight":30},"scale":{"rangeMax":5000}},"color":{"field":"Entity","type":"nominal","legend":null}}}`}"
        container-height="156px"
        container-width="156px">
      </clabs-chat-chart>
    </div>
  `},B={argTypes:ne,args:re,parameters:{controls:{expanded:!0},layout:"fullscreen"},render:({chartTheme:e})=>t`<h3>Single layer Charts:</h3>
    <br />
    <h4>Comparative line chart</h4>
    <clabs-chat-chart
      theme="${e}"
      content="${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Stock prices of 5 Tech Companies over Time.","data":{"url":"https://vega.github.io/vega-lite/data/stocks.csv"},"mark":{"type":"line","point":{"filled":false}},"encoding":{"x":{"timeUnit":"year","field":"date"},"y":{"aggregate":"mean","field":"price","type":"quantitative"},"color":{"field":"symbol","type":"nominal"}}}'}"
      container-height="400px">
    </clabs-chat-chart>
    <br />
    <h4>Box Plot</h4>
    <br />
    <clabs-chat-chart
      theme="${e}"
      content="${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Boxplot example with random data","data":{"values":[{"group":"Group A","value":34},{"group":"Group A","value":28},{"group":"Group A","value":55},{"group":"Group B","value":91},{"group":"Group B","value":81},{"group":"Group B","value":67},{"group":"Group C","value":45},{"group":"Group C","value":66},{"group":"Group C","value":73},{"group":"Group D","value":28},{"group":"Group D","value":35},{"group":"Group D","value":56},{"group":"Group E","value":12},{"group":"Group E","value":45},{"group":"Group E","value":99}]},"mark":"boxplot","encoding":{"y":{"field":"group","type":"nominal"},"x":{"field":"value","type":"quantitative"}}}'}"
      container-height="400px">
    </clabs-chat-chart>
    <br />
    <h4>Stream Graph</h4>
    <br />
    <clabs-chat-chart
      theme="${e}"
      content="${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","width":300,"height":200,"data":{"url":"https://vega.github.io/vega-lite/data/unemployment-across-industries.json"},"mark":"area","encoding":{"x":{"timeUnit":"yearmonth","field":"date","axis":{"domain":false,"format":"%Y","tickSize":0}},"y":{"aggregate":"sum","field":"count","axis":null,"stack":"center"},"color":{"field":"series","scale":{"scheme":"category20b"}}}}'}"
      container-height="400px">
    </clabs-chat-chart>
    <br />
    <h4>Line Chart</h4>
    <br />
    <clabs-chat-chart
      theme="${e}"
      content="${`{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"IBM stock price over time","data":{"values":[{"symbol":"IBM","date":"Jan 1 2000","price":100.52},{"symbol":"IBM","date":"Feb 1 2000","price":92.11},{"symbol":"IBM","date":"Mar 1 2000","price":106.11},{"symbol":"IBM","date":"Apr 1 2000","price":99.95},{"symbol":"IBM","date":"May 1 2000","price":96.31},{"symbol":"IBM","date":"Jun 1 2000","price":98.33},{"symbol":"IBM","date":"Jul 1 2000","price":100.74},{"symbol":"IBM","date":"Aug 1 2000","price":118.62},{"symbol":"IBM","date":"Sep 1 2000","price":101.19},{"symbol":"IBM","date":"Oct 1 2000","price":88.5},{"symbol":"IBM","date":"Nov 1 2000","price":84.12},{"symbol":"IBM","date":"Dec 1 2000","price":76.47},{"symbol":"IBM","date":"Jan 1 2001","price":100.76},{"symbol":"IBM","date":"Feb 1 2001","price":89.98},{"symbol":"IBM","date":"Mar 1 2001","price":86.63},{"symbol":"IBM","date":"Apr 1 2001","price":103.7},{"symbol":"IBM","date":"May 1 2001","price":100.82},{"symbol":"IBM","date":"Jun 1 2001","price":102.35},{"symbol":"IBM","date":"Jul 1 2001","price":94.87},{"symbol":"IBM","date":"Aug 1 2001","price":90.25},{"symbol":"IBM","date":"Sep 1 2001","price":82.82},{"symbol":"IBM","date":"Oct 1 2001","price":97.58},{"symbol":"IBM","date":"Nov 1 2001","price":104.5},{"symbol":"IBM","date":"Dec 1 2001","price":109.36},{"symbol":"IBM","date":"Jan 1 2002","price":97.54},{"symbol":"IBM","date":"Feb 1 2002","price":88.82},{"symbol":"IBM","date":"Mar 1 2002","price":94.15},{"symbol":"IBM","date":"Apr 1 2002","price":75.82},{"symbol":"IBM","date":"May 1 2002","price":72.97},{"symbol":"IBM","date":"Jun 1 2002","price":65.31},{"symbol":"IBM","date":"Jul 1 2002","price":63.86},{"symbol":"IBM","date":"Aug 1 2002","price":68.52},{"symbol":"IBM","date":"Sep 1 2002","price":53.01},{"symbol":"IBM","date":"Oct 1 2002","price":71.76},{"symbol":"IBM","date":"Nov 1 2002","price":79.16},{"symbol":"IBM","date":"Dec 1 2002","price":70.58},{"symbol":"IBM","date":"Jan 1 2003","price":71.22},{"symbol":"IBM","date":"Feb 1 2003","price":71.13},{"symbol":"IBM","date":"Mar 1 2003","price":71.57},{"symbol":"IBM","date":"Apr 1 2003","price":77.47},{"symbol":"IBM","date":"May 1 2003","price":80.48},{"symbol":"IBM","date":"Jun 1 2003","price":75.42},{"symbol":"IBM","date":"Jul 1 2003","price":74.28},{"symbol":"IBM","date":"Aug 1 2003","price":75.12},{"symbol":"IBM","date":"Sep 1 2003","price":80.91},{"symbol":"IBM","date":"Oct 1 2003","price":81.96},{"symbol":"IBM","date":"Nov 1 2003","price":83.08},{"symbol":"IBM","date":"Dec 1 2003","price":85.05},{"symbol":"IBM","date":"Jan 1 2004","price":91.06},{"symbol":"IBM","date":"Feb 1 2004","price":88.7},{"symbol":"IBM","date":"Mar 1 2004","price":84.41},{"symbol":"IBM","date":"Apr 1 2004","price":81.04},{"symbol":"IBM","date":"May 1 2004","price":81.59},{"symbol":"IBM","date":"Jun 1 2004","price":81.19},{"symbol":"IBM","date":"Jul 1 2004","price":80.19},{"symbol":"IBM","date":"Aug 1 2004","price":78.17},{"symbol":"IBM","date":"Sep 1 2004","price":79.13},{"symbol":"IBM","date":"Oct 1 2004","price":82.84},{"symbol":"IBM","date":"Nov 1 2004","price":87.15},{"symbol":"IBM","date":"Dec 1 2004","price":91.16},{"symbol":"IBM","date":"Jan 1 2005","price":86.39},{"symbol":"IBM","date":"Feb 1 2005","price":85.78},{"symbol":"IBM","date":"Mar 1 2005","price":84.66},{"symbol":"IBM","date":"Apr 1 2005","price":70.77},{"symbol":"IBM","date":"May 1 2005","price":70.18},{"symbol":"IBM","date":"Jun 1 2005","price":68.93},{"symbol":"IBM","date":"Jul 1 2005","price":77.53},{"symbol":"IBM","date":"Aug 1 2005","price":75.07},{"symbol":"IBM","date":"Sep 1 2005","price":74.7},{"symbol":"IBM","date":"Oct 1 2005","price":76.25},{"symbol":"IBM","date":"Nov 1 2005","price":82.98},{"symbol":"IBM","date":"Dec 1 2005","price":76.73},{"symbol":"IBM","date":"Jan 1 2006","price":75.89},{"symbol":"IBM","date":"Feb 1 2006","price":75.09},{"symbol":"IBM","date":"Mar 1 2006","price":77.17},{"symbol":"IBM","date":"Apr 1 2006","price":77.05},{"symbol":"IBM","date":"May 1 2006","price":75.04},{"symbol":"IBM","date":"Jun 1 2006","price":72.15},{"symbol":"IBM","date":"Jul 1 2006","price":72.7},{"symbol":"IBM","date":"Aug 1 2006","price":76.35},{"symbol":"IBM","date":"Sep 1 2006","price":77.26},{"symbol":"IBM","date":"Oct 1 2006","price":87.06},{"symbol":"IBM","date":"Nov 1 2006","price":86.95},{"symbol":"IBM","date":"Dec 1 2006","price":91.9},{"symbol":"IBM","date":"Jan 1 2007","price":93.79},{"symbol":"IBM","date":"Feb 1 2007","price":88.18},{"symbol":"IBM","date":"Mar 1 2007","price":89.44},{"symbol":"IBM","date":"Apr 1 2007","price":96.98},{"symbol":"IBM","date":"May 1 2007","price":101.54},{"symbol":"IBM","date":"Jun 1 2007","price":100.25},{"symbol":"IBM","date":"Jul 1 2007","price":105.4},{"symbol":"IBM","date":"Aug 1 2007","price":111.54},{"symbol":"IBM","date":"Sep 1 2007","price":112.6},{"symbol":"IBM","date":"Oct 1 2007","price":111},{"symbol":"IBM","date":"Nov 1 2007","price":100.9},{"symbol":"IBM","date":"Dec 1 2007","price":103.7},{"symbol":"IBM","date":"Jan 1 2008","price":102.75},{"symbol":"IBM","date":"Feb 1 2008","price":109.64},{"symbol":"IBM","date":"Mar 1 2008","price":110.87},{"symbol":"IBM","date":"Apr 1 2008","price":116.23},{"symbol":"IBM","date":"May 1 2008","price":125.14},{"symbol":"IBM","date":"Jun 1 2008","price":114.6},{"symbol":"IBM","date":"Jul 1 2008","price":123.74},{"symbol":"IBM","date":"Aug 1 2008","price":118.16},{"symbol":"IBM","date":"Sep 1 2008","price":113.53},{"symbol":"IBM","date":"Oct 1 2008","price":90.24},{"symbol":"IBM","date":"Nov 1 2008","price":79.65},{"symbol":"IBM","date":"Dec 1 2008","price":82.15},{"symbol":"IBM","date":"Jan 1 2009","price":89.46},{"symbol":"IBM","date":"Feb 1 2009","price":90.32},{"symbol":"IBM","date":"Mar 1 2009","price":95.09},{"symbol":"IBM","date":"Apr 1 2009","price":101.29},{"symbol":"IBM","date":"May 1 2009","price":104.85},{"symbol":"IBM","date":"Jun 1 2009","price":103.01},{"symbol":"IBM","date":"Jul 1 2009","price":116.34},{"symbol":"IBM","date":"Aug 1 2009","price":117},{"symbol":"IBM","date":"Sep 1 2009","price":118.55},{"symbol":"IBM","date":"Oct 1 2009","price":119.54},{"symbol":"IBM","date":"Nov 1 2009","price":125.79},{"symbol":"IBM","date":"Dec 1 2009","price":130.32},{"symbol":"IBM","date":"Jan 1 2010","price":121.85},{"symbol":"IBM","date":"Feb 1 2010","price":127.16},{"symbol":"IBM","date":"Mar 1 2010","price":125.55}]},"transform":[{"filter":"datum.symbol==='IBM'"}],"mark":{"type":"area","line":{"color":"darkgreen"},"color":{"x1":1,"y1":1,"x2":1,"y2":0,"gradient":"linear","stops":[{"offset":0,"color":"white"},{"offset":1,"color":"darkgreen"}]}},"encoding":{"x":{"field":"date","type":"temporal"},"y":{"field":"price","type":"quantitative"}}}`}"
      container-height="300px">
    </clabs-chat-chart>
    <br />
    <h4>Bar Chart</h4>
    <br />
    <clabs-chat-chart
      theme="${e}"
      content="${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","title":"A simple bar chart with embedded data","data":{"values":[{"x axis value":"A","y axis value":28000},{"x axis value":"B","y axis value":55000},{"x axis value":"C","y axis value":43000},{"x axis value":"D","y axis value":91000},{"x axis value":"E","y axis value":81000},{"x axis value":"F","y axis value":53000},{"x axis value":"G","y axis value":19000},{"x axis value":"H","y axis value":87000},{"x axis value":"I","y axis value":52000}]},"mark":"bar","encoding":{"x":{"field":"x axis value","type":"nominal","axis":{"labelAngle":0}},"y":{"field":"y axis value","type":"quantitative"}}}'}"
      container-height="350px">
    </clabs-chat-chart>
    <br />
    <h4>Horizontal Multi Bar Chart</h4>
    <br />
    <clabs-chat-chart
      theme="${e}"
      content="${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","data":{"url":"https://vega.github.io/vega-lite/data/barley.json"},"mark":"bar","encoding":{"x":{"aggregate":"sum","field":"yield"},"y":{"field":"variety"},"color":{"field":"site"}}}'}"
      container-height="350px">
    </clabs-chat-chart>
    <br />
    <h4>Pie Chart</h4>
    <br />
    <clabs-chat-chart
      theme="${e}"
      content="${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","title":"Pie chart example","data":{"values":[{"category":"A","value":18},{"category":"B","value":10},{"category":"C","value":2}]},"mark":{"type":"arc","innerRadius":0},"encoding":{"theta":{"field":"value","type":"quantitative"},"color":{"field":"category","type":"nominal"}}}'}"
      container-height="300px">
    </clabs-chat-chart>
    <br />
    <h4>Donut Chart</h4>
    <br />
    <clabs-chat-chart
      theme="${e}"
      content="${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"A simple donut chart with embedded data.","data":{"values":[{"category":1,"value":4},{"category":2,"value":6},{"category":3,"value":10},{"category":4,"value":3},{"category":5,"value":7},{"category":6,"value":8}]},"mark":{"type":"arc","innerRadius":50},"encoding":{"theta":{"field":"value","type":"quantitative"},"color":{"field":"category","type":"nominal"}}}'}"
      container-height="300px">
    </clabs-chat-chart>
    <br />
    <h4>Heatmap</h4>
    <br />
    <clabs-chat-chart
      theme="${e}"
      content="${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","data":{"url":"https://vega.github.io/vega-lite/data/seattle-weather.csv"},"title":"Daily Max Temperatures (C) in Cleveland, OH","config":{"view":{"strokeWidth":0,"step":13},"axis":{"domain":false}},"mark":"rect","encoding":{"x":{"field":"date","timeUnit":"date","type":"ordinal","title":"Day","axis":{"labelAngle":0,"format":"%e"}},"y":{"field":"date","timeUnit":"month","type":"ordinal","title":"Month"},"color":{"field":"temp_max","aggregate":"max","type":"quantitative","legend":{"title":null}}}}'}"
      container-height="400px">
    </clabs-chat-chart>
    <br />
    <h4>Scatter Plot</h4>
    <br />
    <clabs-chat-chart
      theme="${e}"
      content="${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"A scatterplot showing body mass and flipper lengths of penguins.","data":{"url":"https://vega.github.io/vega-lite/examples/data/penguins.json"},"mark":"point","encoding":{"x":{"field":"Flipper Length (mm)","type":"quantitative","scale":{"zero":false}},"y":{"field":"Body Mass (g)","type":"quantitative","scale":{"zero":false}},"color":{"field":"Species","type":"nominal"}}}'}"
      container-height="400px"
      @on-multi-selection="${a=>{console.log(a)}}">
    </clabs-chat-chart>
    <br />
    <h4>Bubble Plot</h4>
    <br />
    <clabs-chat-chart
      theme="${e}"
      content="${`{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","title":"Deaths by natural disasters","data":{"url":"https://vega.github.io/vega-lite/examples/data/disasters.csv"},"width":600,"height":400,"transform":[{"filter":"datum.Entity !== 'All natural disasters'"}],"mark":{"type":"circle","opacity":0.8,"stroke":"black","strokeWidth":1},"encoding":{"x":{"field":"Year","type":"temporal","axis":{"grid":false}},"y":{"field":"Entity","type":"nominal","axis":{"title":""}},"size":{"field":"Deaths","type":"quantitative","title":"Annual Global Deaths","legend":{"clipHeight":30},"scale":{"rangeMax":5000}},"color":{"field":"Entity","type":"nominal","legend":null}}}`}"
      container-height="500px">
    </clabs-chat-chart>
    <br />
    <h4>Gradiented Map</h4>
    <br />
    <clabs-chat-chart
      theme="${e}"
      content="${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","title":"US Unemployment by county","data":{"url":"https://vega.github.io/editor/data/us-10m.json","format":{"type":"topojson","feature":"counties"}},"transform":[{"lookup":"id","from":{"data":{"url":"https://vega.github.io/editor/data/unemployment.tsv"},"key":"id","fields":["rate"]}}],"projection":{"type":"albersUsa"},"mark":"geoshape","encoding":{"color":{"field":"rate","type":"quantitative"}}}'}"
      container-height="500px">
    </clabs-chat-chart>
    <br />
    <h4>Orthographic world map</h4>
    <br />
    <clabs-chat-chart
      theme="${e}"
      content="${'{"$schema": "https://vega.github.io/schema/vega-lite/v5.json","width": 500,"height": 300,"params": [{"name": "projection","value": "orthographic"}],"data": {"url": "https://vega.github.io/vega-lite/examples/data/world-110m.json","format": {"type": "topojson", "feature": "countries"}},"projection": {"type": {"expr": "projection"}},"mark": {"type": "geoshape", "fill": "lightgray", "stroke": "gray"}}'}"
      container-height="450px">
    </clabs-chat-chart>
    <br />
    <br />
    <h3>Repeating layer Charts:</h3>
    <br />
    <h4>Interactive multi-scatter plot</h4>
    <br />
    <clabs-chat-chart
      theme="${e}"
      content="${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","repeat":{"row":["Horsepower","Acceleration","Miles_per_Gallon"],"column":["Miles_per_Gallon","Acceleration","Horsepower"]},"spec":{"data":{"url":"https://vega.github.io/vega-lite/examples/data/cars.json"},"mark":"point","params":[{"name":"brush","select":{"type":"interval","resolve":"union","on":"[pointerdown[event.shiftKey], window:pointerup] > window:pointermove!","translate":"[pointerdown[event.shiftKey], window:pointerup] > window:pointermove!","zoom":"wheel![event.shiftKey]"}},{"name":"grid","select":{"type":"interval","resolve":"global","translate":"[pointerdown[!event.shiftKey], window:pointerup] > window:pointermove!","zoom":"wheel![!event.shiftKey]"},"bind":"scales"}],"encoding":{"x":{"field":{"repeat":"column"},"type":"quantitative"},"y":{"field":{"repeat":"row"},"type":"quantitative","axis":{"minExtent":30}},"color":{"condition":{"param":"brush","field":"Origin","type":"nominal"},"value":"grey"}}}}'}"
      container-height="650px">
    </clabs-chat-chart>
    <br />
    <h4>Multi histogram</h4>
    <br />
    <clabs-chat-chart
      theme="${e}"
      content="${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","repeat":["Horsepower","Miles_per_Gallon","Acceleration","Displacement"],"columns":2,"spec":{"data":{"url":"https://vega.github.io/vega-lite/examples/data/cars.json"},"mark":"bar","encoding":{"x":{"field":{"repeat":"repeat"},"bin":true},"y":{"aggregate":"count"},"color":{"field":"Origin"}}}}'}"
      container-height="400px">
    </clabs-chat-chart>
    <br />
    <br />
    <h3>Multi-layer charts:</h3>
    <br />
    <h4>Map + lines</h4>
    <br />
    <clabs-chat-chart
      theme="${e}"
      content="${`{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","width":700,"height":500,"view":{"stroke":"transparent"},"layer":[{"data":{"url":"https://vega.github.io/vega-lite/examples/data/londonBoroughs.json","format":{"type":"topojson","feature":"boroughs"}},"mark":{"type":"geoshape","stroke":"white","strokeWidth":2},"encoding":{"color":{"value":"#eee"}}},{"data":{"url":"https://vega.github.io/vega-lite/examples/data/londonCentroids.json","format":{"type":"json"}},"transform":[{"calculate":"indexof (datum.name, ' ') > 0  ? substring(datum.name,0,indexof(datum.name, ' ')) : datum.name","as":"bLabel"}],"mark":"text","encoding":{"longitude":{"field":"cx","type":"quantitative"},"latitude":{"field":"cy","type":"quantitative"},"text":{"field":"bLabel","type":"nominal"},"size":{"value":8},"opacity":{"value":0.6}}},{"data":{"url":"https://vega.github.io/vega-lite/examples/data/londonTubeLines.json","format":{"type":"topojson","feature":"line"}},"mark":{"type":"geoshape","filled":false,"strokeWidth":2},"encoding":{"color":{"field":"id","type":"nominal","legend":{"title":null,"orient":"bottom-right","offset":0},"scale":{"domain":["Bakerloo","Central","Circle","District","DLR","Hammersmith & City","Jubilee","Metropolitan","Northern","Piccadilly","Victoria","Waterloo & City"],"range":["rgb(137,78,36)","rgb(220,36,30)","rgb(255,206,0)","rgb(1,114,41)","rgb(0,175,173)","rgb(215,153,175)","rgb(106,114,120)","rgb(114,17,84)","rgb(0,0,0)","rgb(0,24,168)","rgb(0,160,226)","rgb(106,187,170)"]}}}}]}`}"
      container-height="450px">
    </clabs-chat-chart>
    <br />
    <h4>Parallel Coordinates</h4>
    <br />
    <clabs-chat-chart
      theme="${e}"
      content="${`{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Parallel coordinates example","data":{"url":"https://vega.github.io/vega-lite/examples/data/penguins.json"},"width":600,"height":300,"transform":[{"filter":"datum['Beak Length (mm)']"},{"window":[{"op":"count","as":"index"}]},{"fold":["Beak Length (mm)","Beak Depth (mm)","Flipper Length (mm)","Body Mass (g)"]},{"joinaggregate":[{"op":"min","field":"value","as":"min"},{"op":"max","field":"value","as":"max"}],"groupby":["key"]},{"calculate":"(datum.value - datum.min) / (datum.max-datum.min)","as":"norm_val"},{"calculate":"(datum.min + datum.max) / 2","as":"mid"}],"layer":[{"mark":{"type":"rule","color":"#ccc"},"encoding":{"detail":{"aggregate":"count"},"x":{"field":"key"}}},{"mark":"line","encoding":{"color":{"type":"nominal","field":"Species"},"detail":{"type":"nominal","field":"index"},"opacity":{"value":0.3},"x":{"type":"nominal","field":"key"},"y":{"type":"quantitative","field":"norm_val","axis":null},"tooltip":[{"type":"quantitative","field":"Beak Length (mm)"},{"type":"quantitative","field":"Beak Depth (mm)"},{"type":"quantitative","field":"Flipper Length (mm)"},{"type":"quantitative","field":"Body Mass (g)"}]}},{"encoding":{"x":{"type":"nominal","field":"key"},"y":{"value":0}},"layer":[{"mark":{"type":"text","style":"label"},"encoding":{"text":{"aggregate":"max","field":"max"}}},{"mark":{"type":"tick","style":"tick","size":8,"color":"#ccc"}}]},{"encoding":{"x":{"type":"nominal","field":"key"},"y":{"value":150}},"layer":[{"mark":{"type":"text","style":"label"},"encoding":{"text":{"aggregate":"min","field":"mid"}}},{"mark":{"type":"tick","style":"tick","size":8,"color":"#ccc"}}]},{"encoding":{"x":{"type":"nominal","field":"key"},"y":{"value":300}},"layer":[{"mark":{"type":"text","style":"label"},"encoding":{"text":{"aggregate":"min","field":"min"}}},{"mark":{"type":"tick","style":"tick","size":8,"color":"#ccc"}}]}],"config":{"axisX":{"domain":false,"labelAngle":0,"tickColor":"#ccc","title":null},"view":{"stroke":null},"style":{"label":{"baseline":"middle","align":"right","dx":-5},"tick":{"orient":"horizontal"}}}}`}"
      container-height="500px">
    </clabs-chat-chart>
    <br />
    <br />
    <h4>30 day rolling average</h4>
    <clabs-chat-chart
      theme="${e}"
      content="${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Plot showing a 30 day rolling average with raw values in the background.","width":400,"height":300,"data":{"url":"https://vega.github.io/vega-lite/data/seattle-weather.csv"},"transform":[{"window":[{"field":"temp_max","op":"mean","as":"rolling_mean"}],"frame":[-15,15]}],"encoding":{"x":{"field":"date","type":"temporal","title":"Date"},"y":{"type":"quantitative","axis":{"title":"Max Temperature and Rolling Mean"}}},"layer":[{"mark":{"type":"point","opacity":0.3},"encoding":{"y":{"field":"temp_max","title":"Max Temperature"}}},{"mark":{"type":"line","color":"red","size":3},"encoding":{"y":{"field":"rolling_mean","title":"Rolling Mean of Max Temperature"}}}]}'}"
      container-height="350px">
    </clabs-chat-chart>
    <br />
    <h4>Candle stick chart</h4>
    <br />
    <clabs-chat-chart
      theme="${e}"
      content="${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","width":400,"description":"A candlestick chart","data":{"url":"https://vega.github.io/vega-lite/examples/data/ohlc.json"},"encoding":{"x":{"field":"date","type":"temporal","title":"Date in 2009","axis":{"format":"%m/%d","labelAngle":-45,"title":"Date in 2009"}},"y":{"type":"quantitative","scale":{"zero":false},"axis":{"title":"Price"}},"color":{"condition":{"test":"datum.open < datum.close","value":"#24a148"},"value":"#fa4d56"}},"layer":[{"mark":"rule","encoding":{"y":{"field":"low"},"y2":{"field":"high"}}},{"mark":"bar","encoding":{"y":{"field":"open"},"y2":{"field":"close"}}}]}'}"
      container-height="350px">
    </clabs-chat-chart>
    <br />`},I={render:()=>t`
      ${se.map(e=>t` <h4>${e.title}</h4>
            <i>${e.prompt}</i>
            <clabs-chat-chart
              container-height="600px"
              container-width="800px"
              content="${JSON.stringify(e.result)}">
            </clabs-chat-chart>`)}
    `},$={render:()=>t`
      ${ce.map(e=>t` <h4>${e.name}</h4>
            <clabs-chat-chart
              container-height="600px"
              container-width="800px"
              debug-mode
              content="${JSON.stringify(e.spec)}">
            </clabs-chat-chart>`)}
    `},w={render:()=>t` <h4>Interactive multi-scatter plot</h4>
    <br />
    <clabs-chat-chart
      content="${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","repeat":{"row":["Horsepower","Acceleration","Miles_per_Gallon"],"column":["Miles_per_Gallon","Acceleration","Horsepower"]},"spec":{"data":{"url":"https://vega.github.io/vega-lite/examples/data/cars.json"},"mark":"point","params":[{"name":"brush","select":{"type":"interval","resolve":"union","on":"[pointerdown[event.shiftKey], window:pointerup] > window:pointermove!","translate":"[pointerdown[event.shiftKey], window:pointerup] > window:pointermove!","zoom":"wheel![event.shiftKey]"}},{"name":"grid","select":{"type":"interval","resolve":"global","translate":"[pointerdown[!event.shiftKey], window:pointerup] > window:pointermove!","zoom":"wheel![!event.shiftKey]"},"bind":"scales"}],"encoding":{"x":{"field":{"repeat":"column"},"type":"quantitative"},"y":{"field":{"repeat":"row"},"type":"quantitative","axis":{"minExtent":30}},"color":{"condition":{"param":"brush","field":"Origin","type":"nominal"},"value":"grey"}}}}'}"
      container-height="450px"
      container-width="600px">
    </clabs-chat-chart>
    <br />
    <clabs-chat-chart
      content="${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","repeat":{"row":["Horsepower","Acceleration","Miles_per_Gallon"],"column":["Miles_per_Gallon","Acceleration","Horsepower"]},"spec":{"data":{"url":"https://vega.github.io/vega-lite/examples/data/cars.json"},"mark":"point","params":[{"name":"brush","select":{"type":"interval","resolve":"union","on":"[pointerdown[event.shiftKey], window:pointerup] > window:pointermove!","translate":"[pointerdown[event.shiftKey], window:pointerup] > window:pointermove!","zoom":"wheel![event.shiftKey]"}},{"name":"grid","select":{"type":"interval","resolve":"global","translate":"[pointerdown[!event.shiftKey], window:pointerup] > window:pointermove!","zoom":"wheel![!event.shiftKey]"},"bind":"scales"}],"encoding":{"x":{"field":{"repeat":"column"},"type":"quantitative"},"y":{"field":{"repeat":"row"},"type":"quantitative","axis":{"minExtent":30}},"color":{"condition":{"param":"brush","field":"Origin","type":"nominal"},"value":"grey"}}}}'}"
      container-height="950px">
    </clabs-chat-chart>
    <br />
    <h4>Multi histogram</h4>
    <br />
    <clabs-chat-chart
      content="${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","repeat":["Horsepower","Miles_per_Gallon","Acceleration","Displacement"],"columns":2,"spec":{"data":{"url":"https://vega.github.io/vega-lite/examples/data/cars.json"},"mark":"bar","encoding":{"x":{"field":{"repeat":"repeat"},"bin":true},"y":{"aggregate":"count"},"color":{"field":"Origin"}}}}'}"
      container-height="450px"
      container-width="800px">
    </clabs-chat-chart>
    <br />
    <clabs-chat-chart
      content="${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","repeat":["Horsepower","Miles_per_Gallon","Acceleration","Displacement"],"columns":2,"spec":{"data":{"url":"https://vega.github.io/vega-lite/examples/data/cars.json"},"mark":"bar","encoding":{"x":{"field":{"repeat":"repeat"},"bin":true},"y":{"aggregate":"count"},"color":{"field":"Origin"}}}}'}"
      container-height="600px"
      container-width="400px">
    </clabs-chat-chart>
    <br />
    <clabs-chat-chart
      content="${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","repeat":["Horsepower","Miles_per_Gallon","Acceleration","Displacement"],"columns":2,"spec":{"data":{"url":"https://vega.github.io/vega-lite/examples/data/cars.json"},"mark":"bar","encoding":{"x":{"field":{"repeat":"repeat"},"bin":true},"y":{"aggregate":"count"},"color":{"field":"Origin"}}}}'}"
      container-height="1000px">
    </clabs-chat-chart>
    <br />`},k={render:()=>t`
    <h4>Map + lines</h4>
    <br />
    <clabs-chat-chart
      content="${`{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","width":700,"height":500,"view":{"stroke":"transparent"},"layer":[{"data":{"url":"https://vega.github.io/vega-lite/examples/data/londonBoroughs.json","format":{"type":"topojson","feature":"boroughs"}},"mark":{"type":"geoshape","stroke":"white","strokeWidth":2},"encoding":{"color":{"value":"#eee"}}},{"data":{"url":"https://vega.github.io/vega-lite/examples/data/londonCentroids.json","format":{"type":"json"}},"transform":[{"calculate":"indexof (datum.name, ' ') > 0  ? substring(datum.name,0,indexof(datum.name, ' ')) : datum.name","as":"bLabel"}],"mark":"text","encoding":{"longitude":{"field":"cx","type":"quantitative"},"latitude":{"field":"cy","type":"quantitative"},"text":{"field":"bLabel","type":"nominal"},"size":{"value":8},"opacity":{"value":0.6}}},{"data":{"url":"https://vega.github.io/vega-lite/examples/data/londonTubeLines.json","format":{"type":"topojson","feature":"line"}},"mark":{"type":"geoshape","filled":false,"strokeWidth":2},"encoding":{"color":{"field":"id","type":"nominal","legend":{"title":null,"orient":"bottom-right","offset":0},"scale":{"domain":["Bakerloo","Central","Circle","District","DLR","Hammersmith & City","Jubilee","Metropolitan","Northern","Piccadilly","Victoria","Waterloo & City"],"range":["rgb(137,78,36)","rgb(220,36,30)","rgb(255,206,0)","rgb(1,114,41)","rgb(0,175,173)","rgb(215,153,175)","rgb(106,114,120)","rgb(114,17,84)","rgb(0,0,0)","rgb(0,24,168)","rgb(0,160,226)","rgb(106,187,170)"]}}}}]}`}"
      container-height="450px">
    </clabs-chat-chart>
    <br />
    <h4>Parallel Coordinates</h4>
    <br />
    <clabs-chat-chart
      content="${`{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Parallel coordinates example","data":{"url":"https://vega.github.io/vega-lite/examples/data/penguins.json"},"width":600,"height":300,"transform":[{"filter":"datum['Beak Length (mm)']"},{"window":[{"op":"count","as":"index"}]},{"fold":["Beak Length (mm)","Beak Depth (mm)","Flipper Length (mm)","Body Mass (g)"]},{"joinaggregate":[{"op":"min","field":"value","as":"min"},{"op":"max","field":"value","as":"max"}],"groupby":["key"]},{"calculate":"(datum.value - datum.min) / (datum.max-datum.min)","as":"norm_val"},{"calculate":"(datum.min + datum.max) / 2","as":"mid"}],"layer":[{"mark":{"type":"rule","color":"#ccc"},"encoding":{"detail":{"aggregate":"count"},"x":{"field":"key"}}},{"mark":"line","encoding":{"color":{"type":"nominal","field":"Species"},"detail":{"type":"nominal","field":"index"},"opacity":{"value":0.3},"x":{"type":"nominal","field":"key"},"y":{"type":"quantitative","field":"norm_val","axis":null},"tooltip":[{"type":"quantitative","field":"Beak Length (mm)"},{"type":"quantitative","field":"Beak Depth (mm)"},{"type":"quantitative","field":"Flipper Length (mm)"},{"type":"quantitative","field":"Body Mass (g)"}]}},{"encoding":{"x":{"type":"nominal","field":"key"},"y":{"value":0}},"layer":[{"mark":{"type":"text","style":"label"},"encoding":{"text":{"aggregate":"max","field":"max"}}},{"mark":{"type":"tick","style":"tick","size":8,"color":"#ccc"}}]},{"encoding":{"x":{"type":"nominal","field":"key"},"y":{"value":150}},"layer":[{"mark":{"type":"text","style":"label"},"encoding":{"text":{"aggregate":"min","field":"mid"}}},{"mark":{"type":"tick","style":"tick","size":8,"color":"#ccc"}}]},{"encoding":{"x":{"type":"nominal","field":"key"},"y":{"value":300}},"layer":[{"mark":{"type":"text","style":"label"},"encoding":{"text":{"aggregate":"min","field":"min"}}},{"mark":{"type":"tick","style":"tick","size":8,"color":"#ccc"}}]}],"config":{"axisX":{"domain":false,"labelAngle":0,"tickColor":"#ccc","title":null},"view":{"stroke":null},"style":{"label":{"baseline":"middle","align":"right","dx":-5},"tick":{"orient":"horizontal"}}}}`}"
      container-height="500px">
    </clabs-chat-chart>
    <br />
    <h4>Candle stick chart</h4>
    <br />
    <clabs-chat-chart
      content="${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","width":400,"description":"A candlestick chart","data":{"url":"https://vega.github.io/vega-lite/examples/data/ohlc.json"},"encoding":{"x":{"field":"date","type":"temporal","title":"Date in 2009","axis":{"format":"%m/%d","labelAngle":-45,"title":"Date in 2009"}},"y":{"type":"quantitative","scale":{"zero":false},"axis":{"title":"Price"}},"color":{"condition":{"test":"datum.open < datum.close","value":"#24a148"},"value":"#fa4d56"}},"layer":[{"mark":"rule","encoding":{"y":{"field":"low"},"y2":{"field":"high"}}},{"mark":"bar","encoding":{"y":{"field":"open"},"y2":{"field":"close"}}}]}'}"
      container-height="350px">
    </clabs-chat-chart>
    <br />
    <h4>30 day rolling average</h4>
    <br />
    <clabs-chat-chart
      content="${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Plot showing a 30 day rolling average with raw values in the background.","width":400,"height":300,"data":{"url":"https://vega.github.io/vega-lite/data/seattle-weather.csv"},"transform":[{"window":[{"field":"temp_max","op":"mean","as":"rolling_mean"}],"frame":[-15,15]}],"encoding":{"x":{"field":"date","type":"temporal","title":"Date"},"y":{"type":"quantitative","axis":{"title":"Max Temperature and Rolling Mean"}}},"layer":[{"mark":{"type":"point","opacity":0.3},"encoding":{"y":{"field":"temp_max","title":"Max Temperature"}}},{"mark":{"type":"line","color":"red","size":3},"encoding":{"y":{"field":"rolling_mean","title":"Rolling Mean of Max Temperature"}}}]}'}"
      container-height="350px">
    </clabs-chat-chart>
    <br />
  `},f=['{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Stock prices of 5 Tech Companies over Time.","data":{"url":"https://vega.github.io/vega-lite/data/stocks.csv"},"mark":{"type":"line","point":{"filled":false}},"encoding":{"x":{"timeUnit":"year","field":"date"},"y":{"aggregate":"mean","field":"price","type":"quantitative"},"color":{"field":"symbol","type":"nominal"}}}','{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"A simple donut chart with embedded data.","data":{"values":[{"category":1,"value":4},{"category":2,"value":6},{"category":3,"value":10},{"category":4,"value":3},{"category":5,"value":7},{"category":6,"value":8}]},"mark":{"type":"arc","innerRadius":50},"encoding":{"theta":{"field":"value","type":"quantitative"},"color":{"field":"category","type":"nominal"}}}','{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","repeat":["Horsepower","Miles_per_Gallon","Acceleration","Displacement"],"columns":2,"spec":{"data":{"url":"https://vega.github.io/vega-lite/examples/data/cars.json"},"mark":"bar","encoding":{"x":{"field":{"repeat":"repeat"},"bin":true},"y":{"aggregate":"count"},"color":{"field":"Origin"}}}}','{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Boxplot example with random data","data":{"values":[{"group":"Group A","value":34},{"group":"Group A","value":28},{"group":"Group A","value":55},{"group":"Group B","value":91},{"group":"Group B","value":81},{"group":"Group B","value":67},{"group":"Group C","value":45},{"group":"Group C","value":66},{"group":"Group C","value":73},{"group":"Group D","value":28},{"group":"Group D","value":35},{"group":"Group D","value":56},{"group":"Group E","value":12},{"group":"Group E","value":45},{"group":"Group E","value":99}]},"mark":"boxplot","encoding":{"y":{"field":"group","type":"nominal"},"x":{"field":"value","type":"quantitative"}}}','{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","repeat":{"row":["Horsepower","Acceleration"],"column":["Miles_per_Gallon","Acceleration"]},"spec":{"data":{"url":"https://vega.github.io/vega-lite/examples/data/cars.json"},"mark":"point","params":[{"name":"brush","select":{"type":"interval","resolve":"union","on":"[pointerdown[event.shiftKey], window:pointerup] > window:pointermove!","translate":"[pointerdown[event.shiftKey], window:pointerup] > window:pointermove!","zoom":"wheel![event.shiftKey]"}},{"name":"grid","select":{"type":"interval","resolve":"global","translate":"[pointerdown[!event.shiftKey], window:pointerup] > window:pointermove!","zoom":"wheel![!event.shiftKey]"},"bind":"scales"}],"encoding":{"x":{"field":{"repeat":"column"},"type":"quantitative"},"y":{"field":{"repeat":"row"},"type":"quantitative","axis":{"minExtent":30}},"color":{"condition":{"param":"brush","field":"Origin","type":"nominal"},"value":"grey"}}}}','{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","title":"US Unemployment by county","data":{"url":"https://vega.github.io/editor/data/us-10m.json","format":{"type":"topojson","feature":"counties"}},"transform":[{"lookup":"id","from":{"data":{"url":"https://vega.github.io/editor/data/unemployment.tsv"},"key":"id","fields":["rate"]}}],"projection":{"type":"albersUsa"},"mark":"geoshape","encoding":{"color":{"field":"rate","type":"quantitative"}}}'],A={argTypes:ne,args:re,parameters:{controls:{expanded:!0},layout:"fullscreen"},render:({content:e,debugMode:a,carbonify:i,containerHeight:l,containerWidth:o,chartTheme:r,renderMethod:n,loading:s,enableZooming:c,enableTooltip:p,enableLegendFiltering:d,enableMultiSelection:m,enableSingleSelection:h,disableOptions:g,disableEditor:b,disableCodeInspector:u,disableExport:y,disableFullscreen:v})=>t`
    <div style="display:grid; grid-template-columns: repeat(2,1fr); gap:16px;">
      <clabs-chat-chart
        content="${f[0]}"
        ?carbonify="${i}"
        ?debug-mode="${a}"
        container-height="${l}"
        container-width="${o}"
        theme="${r}"
        render-method="${n}"
        ?loading="${s}"
        ?enable-legend-filtering="${d}"
        ?enable-multi-selections="${m}"
        ?enable-single-selections="${h}"
        ?enable-zooming="${c}"
        ?enable-tooltip="${p}"
        ?disable-options="${g}"
        ?disable-editor="${b}"
        ?disable-code-inspector="${u}"
        ?disable-export="${y}"
        ?disable-fullscreen="${v}">
      </clabs-chat-chart>
      <clabs-chat-chart
        content="${f[1]}"
        ?carbonify="${i}"
        ?debug-mode="${a}"
        container-height="${l}"
        container-width="${o}"
        theme="${r}"
        render-method="${n}"
        ?loading="${s}"
        ?enable-legend-filtering="${d}"
        ?enable-multi-selections="${m}"
        ?enable-single-selections="${h}"
        ?enable-zooming="${c}"
        ?enable-tooltip="${p}"
        ?disable-options="${g}"
        ?disable-editor="${b}"
        ?disable-code-inspector="${u}"
        ?disable-export="${y}"
        ?disable-fullscreen="${v}">
      </clabs-chat-chart>
      <clabs-chat-chart
        content="${f[2]}"
        ?carbonify="${i}"
        ?debug-mode="${a}"
        container-height="${l}"
        container-width="${o}"
        theme="${r}"
        render-method="${n}"
        ?loading="${s}"
        ?enable-legend-filtering="${d}"
        ?enable-multi-selections="${m}"
        ?enable-single-selections="${h}"
        ?enable-zooming="${c}"
        ?enable-tooltip="${p}"
        ?disable-options="${g}"
        ?disable-editor="${b}"
        ?disable-code-inspector="${u}"
        ?disable-export="${y}"
        ?disable-fullscreen="${v}">
      </clabs-chat-chart>
      <clabs-chat-chart
        content="${f[3]}"
        ?carbonify="${i}"
        ?debug-mode="${a}"
        container-height="${l}"
        container-width="${o}"
        theme="${r}"
        render-method="${n}"
        ?loading="${s}"
        ?enable-legend-filtering="${d}"
        ?enable-multi-selections="${m}"
        ?enable-single-selections="${h}"
        ?enable-zooming="${c}"
        ?enable-tooltip="${p}"
        ?disable-options="${g}"
        ?disable-editor="${b}"
        ?disable-code-inspector="${u}"
        ?disable-export="${y}"
        ?disable-fullscreen="${v}">
      </clabs-chat-chart>
      <clabs-chat-chart
        content="${f[4]}"
        ?carbonify="${i}"
        ?debug-mode="${a}"
        container-height="${l}"
        container-width="${o}"
        theme="${r}"
        render-method="${n}"
        ?loading="${s}"
        ?enable-legend-filtering="${d}"
        ?enable-multi-selections="${m}"
        ?enable-single-selections="${h}"
        ?enable-zooming="${c}"
        ?enable-tooltip="${p}"
        ?disable-options="${g}"
        ?disable-editor="${b}"
        ?disable-code-inspector="${u}"
        ?disable-export="${y}"
        ?disable-fullscreen="${v}">
      </clabs-chat-chart>
      <clabs-chat-chart
        content="${f[5]}"
        ?carbonify="${i}"
        ?debug-mode="${a}"
        container-height="${l}"
        container-width="${o}"
        theme="${r}"
        render-method="${n}"
        ?loading="${s}"
        ?enable-legend-filtering="${d}"
        ?enable-multi-selections="${m}"
        ?enable-single-selections="${h}"
        ?enable-zooming="${c}"
        ?enable-tooltip="${p}"
        ?disable-options="${g}"
        ?disable-editor="${b}"
        ?disable-code-inspector="${u}"
        ?disable-export="${y}"
        ?disable-fullscreen="${v}">
      </clabs-chat-chart>
    </div>
    <br />
    <h4>Custom content input</h4>
    <hr />
    <clabs-chat-chart
      content="${JSON.stringify(e)}"
      ?carbonify="${i}"
      ?debug-mode="${a}"
      container-height="${l}"
      container-width="${o}"
      theme="${r}"
      render-method="${n}"
      ?loading="${s}"
      ?enable-legend-filtering="${d}"
      ?enable-multi-selections="${m}"
      ?enable-single-selections="${h}"
      ?enable-zooming="${c}"
      ?enable-tooltip="${p}"
      ?disable-options="${g}"
      ?disable-editor="${b}"
      ?disable-code-inspector="${u}"
      ?disable-export="${y}"
      ?disable-fullscreen="${v}">
    </clabs-chat-chart>
  `},j={render:()=>t` <clabs-chat-chart> </clabs-chat-chart>`},q={render:()=>t` <clabs-chat-chart
      @on-chart-error="${e=>console.log(e)}"
      content="${"{}"}">
    </clabs-chat-chart>`};var S,J,D;M.parameters={...M.parameters,docs:{...(S=M.parameters)==null?void 0:S.docs,source:{originalSource:`{
  /**
   * Renders the template for Showcase Storybook
   * @returns {TemplateResult<1>}
   */
  render: () => html\` <clabs-chat-chart
    content="\${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"IBM stock price over time.","data":{"values":[{"symbol":"IBM","date":"Jan 1 2000","price":100.52},{"symbol":"IBM","date":"Feb 1 2000","price":92.11},{"symbol":"IBM","date":"Mar 1 2000","price":106.11},{"symbol":"IBM","date":"Apr 1 2000","price":99.95},{"symbol":"IBM","date":"May 1 2000","price":96.31},{"symbol":"IBM","date":"Jun 1 2000","price":98.33},{"symbol":"IBM","date":"Jul 1 2000","price":100.74},{"symbol":"IBM","date":"Aug 1 2000","price":118.62},{"symbol":"IBM","date":"Sep 1 2000","price":101.19},{"symbol":"IBM","date":"Oct 1 2000","price":88.5},{"symbol":"IBM","date":"Nov 1 2000","price":84.12},{"symbol":"IBM","date":"Dec 1 2000","price":76.47},{"symbol":"IBM","date":"Jan 1 2001","price":100.76},{"symbol":"IBM","date":"Feb 1 2001","price":89.98},{"symbol":"IBM","date":"Mar 1 2001","price":86.63},{"symbol":"IBM","date":"Apr 1 2001","price":103.7},{"symbol":"IBM","date":"May 1 2001","price":100.82},{"symbol":"IBM","date":"Jun 1 2001","price":102.35},{"symbol":"IBM","date":"Jul 1 2001","price":94.87},{"symbol":"IBM","date":"Aug 1 2001","price":90.25},{"symbol":"IBM","date":"Sep 1 2001","price":82.82},{"symbol":"IBM","date":"Oct 1 2001","price":97.58},{"symbol":"IBM","date":"Nov 1 2001","price":104.5},{"symbol":"IBM","date":"Dec 1 2001","price":109.36},{"symbol":"IBM","date":"Jan 1 2002","price":97.54},{"symbol":"IBM","date":"Feb 1 2002","price":88.82},{"symbol":"IBM","date":"Mar 1 2002","price":94.15},{"symbol":"IBM","date":"Apr 1 2002","price":75.82},{"symbol":"IBM","date":"May 1 2002","price":72.97},{"symbol":"IBM","date":"Jun 1 2002","price":65.31},{"symbol":"IBM","date":"Jul 1 2002","price":63.86},{"symbol":"IBM","date":"Aug 1 2002","price":68.52},{"symbol":"IBM","date":"Sep 1 2002","price":53.01},{"symbol":"IBM","date":"Oct 1 2002","price":71.76},{"symbol":"IBM","date":"Nov 1 2002","price":79.16},{"symbol":"IBM","date":"Dec 1 2002","price":70.58},{"symbol":"IBM","date":"Jan 1 2003","price":71.22},{"symbol":"IBM","date":"Feb 1 2003","price":71.13},{"symbol":"IBM","date":"Mar 1 2003","price":71.57},{"symbol":"IBM","date":"Apr 1 2003","price":77.47},{"symbol":"IBM","date":"May 1 2003","price":80.48},{"symbol":"IBM","date":"Jun 1 2003","price":75.42},{"symbol":"IBM","date":"Jul 1 2003","price":74.28},{"symbol":"IBM","date":"Aug 1 2003","price":75.12},{"symbol":"IBM","date":"Sep 1 2003","price":80.91},{"symbol":"IBM","date":"Oct 1 2003","price":81.96},{"symbol":"IBM","date":"Nov 1 2003","price":83.08},{"symbol":"IBM","date":"Dec 1 2003","price":85.05},{"symbol":"IBM","date":"Jan 1 2004","price":91.06},{"symbol":"IBM","date":"Feb 1 2004","price":88.7},{"symbol":"IBM","date":"Mar 1 2004","price":84.41},{"symbol":"IBM","date":"Apr 1 2004","price":81.04},{"symbol":"IBM","date":"May 1 2004","price":81.59},{"symbol":"IBM","date":"Jun 1 2004","price":81.19},{"symbol":"IBM","date":"Jul 1 2004","price":80.19},{"symbol":"IBM","date":"Aug 1 2004","price":78.17},{"symbol":"IBM","date":"Sep 1 2004","price":79.13},{"symbol":"IBM","date":"Oct 1 2004","price":82.84},{"symbol":"IBM","date":"Nov 1 2004","price":87.15},{"symbol":"IBM","date":"Dec 1 2004","price":91.16},{"symbol":"IBM","date":"Jan 1 2005","price":86.39},{"symbol":"IBM","date":"Feb 1 2005","price":85.78},{"symbol":"IBM","date":"Mar 1 2005","price":84.66},{"symbol":"IBM","date":"Apr 1 2005","price":70.77},{"symbol":"IBM","date":"May 1 2005","price":70.18},{"symbol":"IBM","date":"Jun 1 2005","price":68.93},{"symbol":"IBM","date":"Jul 1 2005","price":77.53},{"symbol":"IBM","date":"Aug 1 2005","price":75.07},{"symbol":"IBM","date":"Sep 1 2005","price":74.7},{"symbol":"IBM","date":"Oct 1 2005","price":76.25},{"symbol":"IBM","date":"Nov 1 2005","price":82.98},{"symbol":"IBM","date":"Dec 1 2005","price":76.73},{"symbol":"IBM","date":"Jan 1 2006","price":75.89},{"symbol":"IBM","date":"Feb 1 2006","price":75.09},{"symbol":"IBM","date":"Mar 1 2006","price":77.17},{"symbol":"IBM","date":"Apr 1 2006","price":77.05},{"symbol":"IBM","date":"May 1 2006","price":75.04},{"symbol":"IBM","date":"Jun 1 2006","price":72.15},{"symbol":"IBM","date":"Jul 1 2006","price":72.7},{"symbol":"IBM","date":"Aug 1 2006","price":76.35},{"symbol":"IBM","date":"Sep 1 2006","price":77.26},{"symbol":"IBM","date":"Oct 1 2006","price":87.06},{"symbol":"IBM","date":"Nov 1 2006","price":86.95},{"symbol":"IBM","date":"Dec 1 2006","price":91.9},{"symbol":"IBM","date":"Jan 1 2007","price":93.79},{"symbol":"IBM","date":"Feb 1 2007","price":88.18},{"symbol":"IBM","date":"Mar 1 2007","price":89.44},{"symbol":"IBM","date":"Apr 1 2007","price":96.98},{"symbol":"IBM","date":"May 1 2007","price":101.54},{"symbol":"IBM","date":"Jun 1 2007","price":100.25},{"symbol":"IBM","date":"Jul 1 2007","price":105.4},{"symbol":"IBM","date":"Aug 1 2007","price":111.54},{"symbol":"IBM","date":"Sep 1 2007","price":112.6},{"symbol":"IBM","date":"Oct 1 2007","price":111},{"symbol":"IBM","date":"Nov 1 2007","price":100.9},{"symbol":"IBM","date":"Dec 1 2007","price":103.7},{"symbol":"IBM","date":"Jan 1 2008","price":102.75},{"symbol":"IBM","date":"Feb 1 2008","price":109.64},{"symbol":"IBM","date":"Mar 1 2008","price":110.87},{"symbol":"IBM","date":"Apr 1 2008","price":116.23},{"symbol":"IBM","date":"May 1 2008","price":125.14},{"symbol":"IBM","date":"Jun 1 2008","price":114.6},{"symbol":"IBM","date":"Jul 1 2008","price":123.74},{"symbol":"IBM","date":"Aug 1 2008","price":118.16},{"symbol":"IBM","date":"Sep 1 2008","price":113.53},{"symbol":"IBM","date":"Oct 1 2008","price":90.24},{"symbol":"IBM","date":"Nov 1 2008","price":79.65},{"symbol":"IBM","date":"Dec 1 2008","price":82.15},{"symbol":"IBM","date":"Jan 1 2009","price":89.46},{"symbol":"IBM","date":"Feb 1 2009","price":90.32},{"symbol":"IBM","date":"Mar 1 2009","price":95.09},{"symbol":"IBM","date":"Apr 1 2009","price":101.29},{"symbol":"IBM","date":"May 1 2009","price":104.85},{"symbol":"IBM","date":"Jun 1 2009","price":103.01},{"symbol":"IBM","date":"Jul 1 2009","price":116.34},{"symbol":"IBM","date":"Aug 1 2009","price":117},{"symbol":"IBM","date":"Sep 1 2009","price":118.55},{"symbol":"IBM","date":"Oct 1 2009","price":119.54},{"symbol":"IBM","date":"Nov 1 2009","price":125.79},{"symbol":"IBM","date":"Dec 1 2009","price":130.32},{"symbol":"IBM","date":"Jan 1 2010","price":121.85},{"symbol":"IBM","date":"Feb 1 2010","price":127.16},{"symbol":"IBM","date":"Mar 1 2010","price":125.55}]},"transform":[{"filter":"datum.symbol===\\'IBM\\'"}],"mark":{"type":"area","line":{"color":"darkgreen"},"color":{"x1":1,"y1":1,"x2":1,"y2":0,"gradient":"linear","stops":[{"offset":0,"color":"white"},{"offset":1,"color":"darkgreen"}]}},"encoding":{"x":{"field":"date","type":"temporal"},"y":{"field":"price","type":"quantitative"}}}'}">
  </clabs-chat-chart>\`
}`,...(D=(J=M.parameters)==null?void 0:J.docs)==null?void 0:D.source}}};var G,C,z;x.parameters={...x.parameters,docs:{...(G=x.parameters)==null?void 0:G.docs,source:{originalSource:`{
  /**
   * Renders the template for Showcase Storybook
   * @returns {TemplateResult<1>}
   */
  render: () => html\`
    <div style="display:flex;gap:16px;">
      <clabs-chat-chart
        thumbnail
        content="\${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Stock prices of 5 Tech Companies over Time.","data":{"url":"https://vega.github.io/vega-lite/data/stocks.csv"},"mark":{"type":"line","point":{"filled":false}},"encoding":{"x":{"timeUnit":"year","field":"date"},"y":{"aggregate":"mean","field":"price","type":"quantitative"},"color":{"field":"symbol","type":"nominal"}}}'}"
        container-height="156px"
        container-width="156px">
      </clabs-chat-chart>
      <clabs-chat-chart
        thumbnail
        content="\${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Boxplot example with random data","data":{"values":[{"group":"Group A","value":34},{"group":"Group A","value":28},{"group":"Group A","value":55},{"group":"Group B","value":91},{"group":"Group B","value":81},{"group":"Group B","value":67},{"group":"Group C","value":45},{"group":"Group C","value":66},{"group":"Group C","value":73},{"group":"Group D","value":28},{"group":"Group D","value":35},{"group":"Group D","value":56},{"group":"Group E","value":12},{"group":"Group E","value":45},{"group":"Group E","value":99}]},"mark":"boxplot","encoding":{"y":{"field":"group","type":"nominal"},"x":{"field":"value","type":"quantitative"}}}'}"
        container-height="156px"
        container-width="156px">
      </clabs-chat-chart>
      <clabs-chat-chart
        thumbnail
        content="\${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","data":{"url":"https://vega.github.io/vega-lite/data/seattle-weather.csv"},"title":"Daily Max Temperatures (C) in Cleveland, OH","config":{"view":{"strokeWidth":0,"step":13},"axis":{"domain":false}},"mark":"rect","encoding":{"x":{"field":"date","timeUnit":"date","type":"ordinal","title":"Day","axis":{"labelAngle":0,"format":"%e"}},"y":{"field":"date","timeUnit":"month","type":"ordinal","title":"Month"},"color":{"field":"temp_max","aggregate":"max","type":"quantitative","legend":{"title":null}}}}'}"
        container-height="156px"
        container-width="156px">
      </clabs-chat-chart>
      <clabs-chat-chart
        thumbnail
        content="\${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"A scatterplot showing body mass and flipper lengths of penguins.","data":{"url":"https://vega.github.io/vega-lite/examples/data/penguins.json"},"mark":"point","encoding":{"x":{"field":"Flipper Length (mm)","type":"quantitative","scale":{"zero":false}},"y":{"field":"Body Mass (g)","type":"quantitative","scale":{"zero":false}},"color":{"field":"Species","type":"nominal"}}}'}"
        container-height="156px"
        container-width="156px">
      </clabs-chat-chart>
      <clabs-chat-chart
        thumbnail
        content="\${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","title":"Deaths by natural disasters","data":{"url":"https://vega.github.io/vega-lite/examples/data/disasters.csv"},"width":600,"height":400,"transform":[{"filter":"datum.Entity !== \\'All natural disasters\\'"}],"mark":{"type":"circle","opacity":0.8,"stroke":"black","strokeWidth":1},"encoding":{"x":{"field":"Year","type":"temporal","axis":{"grid":false}},"y":{"field":"Entity","type":"nominal","axis":{"title":""}},"size":{"field":"Deaths","type":"quantitative","title":"Annual Global Deaths","legend":{"clipHeight":30},"scale":{"rangeMax":5000}},"color":{"field":"Entity","type":"nominal","legend":null}}}'}"
        container-height="156px"
        container-width="156px">
      </clabs-chat-chart>
    </div>
  \`
}`,...(z=(C=x.parameters)==null?void 0:C.docs)==null?void 0:z.source}}};var _,O,F;B.parameters={...B.parameters,docs:{...(_=B.parameters)==null?void 0:_.docs,source:{originalSource:`{
  argTypes: controls,
  args: defaultArgs,
  parameters: {
    controls: {
      expanded: true
    },
    layout: 'fullscreen'
  },
  /**
   * Renders the template for Showcase Storybook
   * @param {Object} args - arguments to be sent into the playbook
   * @param {string} args.chartTheme - theme for charts
   * @returns {TemplateResult<1>}
   */
  render: ({
    chartTheme
  }) => html\`<h3>Single layer Charts:</h3>
    <br />
    <h4>Comparative line chart</h4>
    <clabs-chat-chart
      theme="\${chartTheme}"
      content="\${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Stock prices of 5 Tech Companies over Time.","data":{"url":"https://vega.github.io/vega-lite/data/stocks.csv"},"mark":{"type":"line","point":{"filled":false}},"encoding":{"x":{"timeUnit":"year","field":"date"},"y":{"aggregate":"mean","field":"price","type":"quantitative"},"color":{"field":"symbol","type":"nominal"}}}'}"
      container-height="400px">
    </clabs-chat-chart>
    <br />
    <h4>Box Plot</h4>
    <br />
    <clabs-chat-chart
      theme="\${chartTheme}"
      content="\${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Boxplot example with random data","data":{"values":[{"group":"Group A","value":34},{"group":"Group A","value":28},{"group":"Group A","value":55},{"group":"Group B","value":91},{"group":"Group B","value":81},{"group":"Group B","value":67},{"group":"Group C","value":45},{"group":"Group C","value":66},{"group":"Group C","value":73},{"group":"Group D","value":28},{"group":"Group D","value":35},{"group":"Group D","value":56},{"group":"Group E","value":12},{"group":"Group E","value":45},{"group":"Group E","value":99}]},"mark":"boxplot","encoding":{"y":{"field":"group","type":"nominal"},"x":{"field":"value","type":"quantitative"}}}'}"
      container-height="400px">
    </clabs-chat-chart>
    <br />
    <h4>Stream Graph</h4>
    <br />
    <clabs-chat-chart
      theme="\${chartTheme}"
      content="\${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","width":300,"height":200,"data":{"url":"https://vega.github.io/vega-lite/data/unemployment-across-industries.json"},"mark":"area","encoding":{"x":{"timeUnit":"yearmonth","field":"date","axis":{"domain":false,"format":"%Y","tickSize":0}},"y":{"aggregate":"sum","field":"count","axis":null,"stack":"center"},"color":{"field":"series","scale":{"scheme":"category20b"}}}}'}"
      container-height="400px">
    </clabs-chat-chart>
    <br />
    <h4>Line Chart</h4>
    <br />
    <clabs-chat-chart
      theme="\${chartTheme}"
      content="\${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"IBM stock price over time","data":{"values":[{"symbol":"IBM","date":"Jan 1 2000","price":100.52},{"symbol":"IBM","date":"Feb 1 2000","price":92.11},{"symbol":"IBM","date":"Mar 1 2000","price":106.11},{"symbol":"IBM","date":"Apr 1 2000","price":99.95},{"symbol":"IBM","date":"May 1 2000","price":96.31},{"symbol":"IBM","date":"Jun 1 2000","price":98.33},{"symbol":"IBM","date":"Jul 1 2000","price":100.74},{"symbol":"IBM","date":"Aug 1 2000","price":118.62},{"symbol":"IBM","date":"Sep 1 2000","price":101.19},{"symbol":"IBM","date":"Oct 1 2000","price":88.5},{"symbol":"IBM","date":"Nov 1 2000","price":84.12},{"symbol":"IBM","date":"Dec 1 2000","price":76.47},{"symbol":"IBM","date":"Jan 1 2001","price":100.76},{"symbol":"IBM","date":"Feb 1 2001","price":89.98},{"symbol":"IBM","date":"Mar 1 2001","price":86.63},{"symbol":"IBM","date":"Apr 1 2001","price":103.7},{"symbol":"IBM","date":"May 1 2001","price":100.82},{"symbol":"IBM","date":"Jun 1 2001","price":102.35},{"symbol":"IBM","date":"Jul 1 2001","price":94.87},{"symbol":"IBM","date":"Aug 1 2001","price":90.25},{"symbol":"IBM","date":"Sep 1 2001","price":82.82},{"symbol":"IBM","date":"Oct 1 2001","price":97.58},{"symbol":"IBM","date":"Nov 1 2001","price":104.5},{"symbol":"IBM","date":"Dec 1 2001","price":109.36},{"symbol":"IBM","date":"Jan 1 2002","price":97.54},{"symbol":"IBM","date":"Feb 1 2002","price":88.82},{"symbol":"IBM","date":"Mar 1 2002","price":94.15},{"symbol":"IBM","date":"Apr 1 2002","price":75.82},{"symbol":"IBM","date":"May 1 2002","price":72.97},{"symbol":"IBM","date":"Jun 1 2002","price":65.31},{"symbol":"IBM","date":"Jul 1 2002","price":63.86},{"symbol":"IBM","date":"Aug 1 2002","price":68.52},{"symbol":"IBM","date":"Sep 1 2002","price":53.01},{"symbol":"IBM","date":"Oct 1 2002","price":71.76},{"symbol":"IBM","date":"Nov 1 2002","price":79.16},{"symbol":"IBM","date":"Dec 1 2002","price":70.58},{"symbol":"IBM","date":"Jan 1 2003","price":71.22},{"symbol":"IBM","date":"Feb 1 2003","price":71.13},{"symbol":"IBM","date":"Mar 1 2003","price":71.57},{"symbol":"IBM","date":"Apr 1 2003","price":77.47},{"symbol":"IBM","date":"May 1 2003","price":80.48},{"symbol":"IBM","date":"Jun 1 2003","price":75.42},{"symbol":"IBM","date":"Jul 1 2003","price":74.28},{"symbol":"IBM","date":"Aug 1 2003","price":75.12},{"symbol":"IBM","date":"Sep 1 2003","price":80.91},{"symbol":"IBM","date":"Oct 1 2003","price":81.96},{"symbol":"IBM","date":"Nov 1 2003","price":83.08},{"symbol":"IBM","date":"Dec 1 2003","price":85.05},{"symbol":"IBM","date":"Jan 1 2004","price":91.06},{"symbol":"IBM","date":"Feb 1 2004","price":88.7},{"symbol":"IBM","date":"Mar 1 2004","price":84.41},{"symbol":"IBM","date":"Apr 1 2004","price":81.04},{"symbol":"IBM","date":"May 1 2004","price":81.59},{"symbol":"IBM","date":"Jun 1 2004","price":81.19},{"symbol":"IBM","date":"Jul 1 2004","price":80.19},{"symbol":"IBM","date":"Aug 1 2004","price":78.17},{"symbol":"IBM","date":"Sep 1 2004","price":79.13},{"symbol":"IBM","date":"Oct 1 2004","price":82.84},{"symbol":"IBM","date":"Nov 1 2004","price":87.15},{"symbol":"IBM","date":"Dec 1 2004","price":91.16},{"symbol":"IBM","date":"Jan 1 2005","price":86.39},{"symbol":"IBM","date":"Feb 1 2005","price":85.78},{"symbol":"IBM","date":"Mar 1 2005","price":84.66},{"symbol":"IBM","date":"Apr 1 2005","price":70.77},{"symbol":"IBM","date":"May 1 2005","price":70.18},{"symbol":"IBM","date":"Jun 1 2005","price":68.93},{"symbol":"IBM","date":"Jul 1 2005","price":77.53},{"symbol":"IBM","date":"Aug 1 2005","price":75.07},{"symbol":"IBM","date":"Sep 1 2005","price":74.7},{"symbol":"IBM","date":"Oct 1 2005","price":76.25},{"symbol":"IBM","date":"Nov 1 2005","price":82.98},{"symbol":"IBM","date":"Dec 1 2005","price":76.73},{"symbol":"IBM","date":"Jan 1 2006","price":75.89},{"symbol":"IBM","date":"Feb 1 2006","price":75.09},{"symbol":"IBM","date":"Mar 1 2006","price":77.17},{"symbol":"IBM","date":"Apr 1 2006","price":77.05},{"symbol":"IBM","date":"May 1 2006","price":75.04},{"symbol":"IBM","date":"Jun 1 2006","price":72.15},{"symbol":"IBM","date":"Jul 1 2006","price":72.7},{"symbol":"IBM","date":"Aug 1 2006","price":76.35},{"symbol":"IBM","date":"Sep 1 2006","price":77.26},{"symbol":"IBM","date":"Oct 1 2006","price":87.06},{"symbol":"IBM","date":"Nov 1 2006","price":86.95},{"symbol":"IBM","date":"Dec 1 2006","price":91.9},{"symbol":"IBM","date":"Jan 1 2007","price":93.79},{"symbol":"IBM","date":"Feb 1 2007","price":88.18},{"symbol":"IBM","date":"Mar 1 2007","price":89.44},{"symbol":"IBM","date":"Apr 1 2007","price":96.98},{"symbol":"IBM","date":"May 1 2007","price":101.54},{"symbol":"IBM","date":"Jun 1 2007","price":100.25},{"symbol":"IBM","date":"Jul 1 2007","price":105.4},{"symbol":"IBM","date":"Aug 1 2007","price":111.54},{"symbol":"IBM","date":"Sep 1 2007","price":112.6},{"symbol":"IBM","date":"Oct 1 2007","price":111},{"symbol":"IBM","date":"Nov 1 2007","price":100.9},{"symbol":"IBM","date":"Dec 1 2007","price":103.7},{"symbol":"IBM","date":"Jan 1 2008","price":102.75},{"symbol":"IBM","date":"Feb 1 2008","price":109.64},{"symbol":"IBM","date":"Mar 1 2008","price":110.87},{"symbol":"IBM","date":"Apr 1 2008","price":116.23},{"symbol":"IBM","date":"May 1 2008","price":125.14},{"symbol":"IBM","date":"Jun 1 2008","price":114.6},{"symbol":"IBM","date":"Jul 1 2008","price":123.74},{"symbol":"IBM","date":"Aug 1 2008","price":118.16},{"symbol":"IBM","date":"Sep 1 2008","price":113.53},{"symbol":"IBM","date":"Oct 1 2008","price":90.24},{"symbol":"IBM","date":"Nov 1 2008","price":79.65},{"symbol":"IBM","date":"Dec 1 2008","price":82.15},{"symbol":"IBM","date":"Jan 1 2009","price":89.46},{"symbol":"IBM","date":"Feb 1 2009","price":90.32},{"symbol":"IBM","date":"Mar 1 2009","price":95.09},{"symbol":"IBM","date":"Apr 1 2009","price":101.29},{"symbol":"IBM","date":"May 1 2009","price":104.85},{"symbol":"IBM","date":"Jun 1 2009","price":103.01},{"symbol":"IBM","date":"Jul 1 2009","price":116.34},{"symbol":"IBM","date":"Aug 1 2009","price":117},{"symbol":"IBM","date":"Sep 1 2009","price":118.55},{"symbol":"IBM","date":"Oct 1 2009","price":119.54},{"symbol":"IBM","date":"Nov 1 2009","price":125.79},{"symbol":"IBM","date":"Dec 1 2009","price":130.32},{"symbol":"IBM","date":"Jan 1 2010","price":121.85},{"symbol":"IBM","date":"Feb 1 2010","price":127.16},{"symbol":"IBM","date":"Mar 1 2010","price":125.55}]},"transform":[{"filter":"datum.symbol===\\'IBM\\'"}],"mark":{"type":"area","line":{"color":"darkgreen"},"color":{"x1":1,"y1":1,"x2":1,"y2":0,"gradient":"linear","stops":[{"offset":0,"color":"white"},{"offset":1,"color":"darkgreen"}]}},"encoding":{"x":{"field":"date","type":"temporal"},"y":{"field":"price","type":"quantitative"}}}'}"
      container-height="300px">
    </clabs-chat-chart>
    <br />
    <h4>Bar Chart</h4>
    <br />
    <clabs-chat-chart
      theme="\${chartTheme}"
      content="\${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","title":"A simple bar chart with embedded data","data":{"values":[{"x axis value":"A","y axis value":28000},{"x axis value":"B","y axis value":55000},{"x axis value":"C","y axis value":43000},{"x axis value":"D","y axis value":91000},{"x axis value":"E","y axis value":81000},{"x axis value":"F","y axis value":53000},{"x axis value":"G","y axis value":19000},{"x axis value":"H","y axis value":87000},{"x axis value":"I","y axis value":52000}]},"mark":"bar","encoding":{"x":{"field":"x axis value","type":"nominal","axis":{"labelAngle":0}},"y":{"field":"y axis value","type":"quantitative"}}}'}"
      container-height="350px">
    </clabs-chat-chart>
    <br />
    <h4>Horizontal Multi Bar Chart</h4>
    <br />
    <clabs-chat-chart
      theme="\${chartTheme}"
      content="\${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","data":{"url":"https://vega.github.io/vega-lite/data/barley.json"},"mark":"bar","encoding":{"x":{"aggregate":"sum","field":"yield"},"y":{"field":"variety"},"color":{"field":"site"}}}'}"
      container-height="350px">
    </clabs-chat-chart>
    <br />
    <h4>Pie Chart</h4>
    <br />
    <clabs-chat-chart
      theme="\${chartTheme}"
      content="\${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","title":"Pie chart example","data":{"values":[{"category":"A","value":18},{"category":"B","value":10},{"category":"C","value":2}]},"mark":{"type":"arc","innerRadius":0},"encoding":{"theta":{"field":"value","type":"quantitative"},"color":{"field":"category","type":"nominal"}}}'}"
      container-height="300px">
    </clabs-chat-chart>
    <br />
    <h4>Donut Chart</h4>
    <br />
    <clabs-chat-chart
      theme="\${chartTheme}"
      content="\${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"A simple donut chart with embedded data.","data":{"values":[{"category":1,"value":4},{"category":2,"value":6},{"category":3,"value":10},{"category":4,"value":3},{"category":5,"value":7},{"category":6,"value":8}]},"mark":{"type":"arc","innerRadius":50},"encoding":{"theta":{"field":"value","type":"quantitative"},"color":{"field":"category","type":"nominal"}}}'}"
      container-height="300px">
    </clabs-chat-chart>
    <br />
    <h4>Heatmap</h4>
    <br />
    <clabs-chat-chart
      theme="\${chartTheme}"
      content="\${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","data":{"url":"https://vega.github.io/vega-lite/data/seattle-weather.csv"},"title":"Daily Max Temperatures (C) in Cleveland, OH","config":{"view":{"strokeWidth":0,"step":13},"axis":{"domain":false}},"mark":"rect","encoding":{"x":{"field":"date","timeUnit":"date","type":"ordinal","title":"Day","axis":{"labelAngle":0,"format":"%e"}},"y":{"field":"date","timeUnit":"month","type":"ordinal","title":"Month"},"color":{"field":"temp_max","aggregate":"max","type":"quantitative","legend":{"title":null}}}}'}"
      container-height="400px">
    </clabs-chat-chart>
    <br />
    <h4>Scatter Plot</h4>
    <br />
    <clabs-chat-chart
      theme="\${chartTheme}"
      content="\${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"A scatterplot showing body mass and flipper lengths of penguins.","data":{"url":"https://vega.github.io/vega-lite/examples/data/penguins.json"},"mark":"point","encoding":{"x":{"field":"Flipper Length (mm)","type":"quantitative","scale":{"zero":false}},"y":{"field":"Body Mass (g)","type":"quantitative","scale":{"zero":false}},"color":{"field":"Species","type":"nominal"}}}'}"
      container-height="400px"
      @on-multi-selection="\${e => {
    console.log(e);
  }}">
    </clabs-chat-chart>
    <br />
    <h4>Bubble Plot</h4>
    <br />
    <clabs-chat-chart
      theme="\${chartTheme}"
      content="\${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","title":"Deaths by natural disasters","data":{"url":"https://vega.github.io/vega-lite/examples/data/disasters.csv"},"width":600,"height":400,"transform":[{"filter":"datum.Entity !== \\'All natural disasters\\'"}],"mark":{"type":"circle","opacity":0.8,"stroke":"black","strokeWidth":1},"encoding":{"x":{"field":"Year","type":"temporal","axis":{"grid":false}},"y":{"field":"Entity","type":"nominal","axis":{"title":""}},"size":{"field":"Deaths","type":"quantitative","title":"Annual Global Deaths","legend":{"clipHeight":30},"scale":{"rangeMax":5000}},"color":{"field":"Entity","type":"nominal","legend":null}}}'}"
      container-height="500px">
    </clabs-chat-chart>
    <br />
    <h4>Gradiented Map</h4>
    <br />
    <clabs-chat-chart
      theme="\${chartTheme}"
      content="\${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","title":"US Unemployment by county","data":{"url":"https://vega.github.io/editor/data/us-10m.json","format":{"type":"topojson","feature":"counties"}},"transform":[{"lookup":"id","from":{"data":{"url":"https://vega.github.io/editor/data/unemployment.tsv"},"key":"id","fields":["rate"]}}],"projection":{"type":"albersUsa"},"mark":"geoshape","encoding":{"color":{"field":"rate","type":"quantitative"}}}'}"
      container-height="500px">
    </clabs-chat-chart>
    <br />
    <h4>Orthographic world map</h4>
    <br />
    <clabs-chat-chart
      theme="\${chartTheme}"
      content="\${'{"$schema": "https://vega.github.io/schema/vega-lite/v5.json","width": 500,"height": 300,"params": [{"name": "projection","value": "orthographic"}],"data": {"url": "https://vega.github.io/vega-lite/examples/data/world-110m.json","format": {"type": "topojson", "feature": "countries"}},"projection": {"type": {"expr": "projection"}},"mark": {"type": "geoshape", "fill": "lightgray", "stroke": "gray"}}'}"
      container-height="450px">
    </clabs-chat-chart>
    <br />
    <br />
    <h3>Repeating layer Charts:</h3>
    <br />
    <h4>Interactive multi-scatter plot</h4>
    <br />
    <clabs-chat-chart
      theme="\${chartTheme}"
      content="\${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","repeat":{"row":["Horsepower","Acceleration","Miles_per_Gallon"],"column":["Miles_per_Gallon","Acceleration","Horsepower"]},"spec":{"data":{"url":"https://vega.github.io/vega-lite/examples/data/cars.json"},"mark":"point","params":[{"name":"brush","select":{"type":"interval","resolve":"union","on":"[pointerdown[event.shiftKey], window:pointerup] > window:pointermove!","translate":"[pointerdown[event.shiftKey], window:pointerup] > window:pointermove!","zoom":"wheel![event.shiftKey]"}},{"name":"grid","select":{"type":"interval","resolve":"global","translate":"[pointerdown[!event.shiftKey], window:pointerup] > window:pointermove!","zoom":"wheel![!event.shiftKey]"},"bind":"scales"}],"encoding":{"x":{"field":{"repeat":"column"},"type":"quantitative"},"y":{"field":{"repeat":"row"},"type":"quantitative","axis":{"minExtent":30}},"color":{"condition":{"param":"brush","field":"Origin","type":"nominal"},"value":"grey"}}}}'}"
      container-height="650px">
    </clabs-chat-chart>
    <br />
    <h4>Multi histogram</h4>
    <br />
    <clabs-chat-chart
      theme="\${chartTheme}"
      content="\${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","repeat":["Horsepower","Miles_per_Gallon","Acceleration","Displacement"],"columns":2,"spec":{"data":{"url":"https://vega.github.io/vega-lite/examples/data/cars.json"},"mark":"bar","encoding":{"x":{"field":{"repeat":"repeat"},"bin":true},"y":{"aggregate":"count"},"color":{"field":"Origin"}}}}'}"
      container-height="400px">
    </clabs-chat-chart>
    <br />
    <br />
    <h3>Multi-layer charts:</h3>
    <br />
    <h4>Map + lines</h4>
    <br />
    <clabs-chat-chart
      theme="\${chartTheme}"
      content="\${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","width":700,"height":500,"view":{"stroke":"transparent"},"layer":[{"data":{"url":"https://vega.github.io/vega-lite/examples/data/londonBoroughs.json","format":{"type":"topojson","feature":"boroughs"}},"mark":{"type":"geoshape","stroke":"white","strokeWidth":2},"encoding":{"color":{"value":"#eee"}}},{"data":{"url":"https://vega.github.io/vega-lite/examples/data/londonCentroids.json","format":{"type":"json"}},"transform":[{"calculate":"indexof (datum.name, \\' \\') > 0  ? substring(datum.name,0,indexof(datum.name, \\' \\')) : datum.name","as":"bLabel"}],"mark":"text","encoding":{"longitude":{"field":"cx","type":"quantitative"},"latitude":{"field":"cy","type":"quantitative"},"text":{"field":"bLabel","type":"nominal"},"size":{"value":8},"opacity":{"value":0.6}}},{"data":{"url":"https://vega.github.io/vega-lite/examples/data/londonTubeLines.json","format":{"type":"topojson","feature":"line"}},"mark":{"type":"geoshape","filled":false,"strokeWidth":2},"encoding":{"color":{"field":"id","type":"nominal","legend":{"title":null,"orient":"bottom-right","offset":0},"scale":{"domain":["Bakerloo","Central","Circle","District","DLR","Hammersmith & City","Jubilee","Metropolitan","Northern","Piccadilly","Victoria","Waterloo & City"],"range":["rgb(137,78,36)","rgb(220,36,30)","rgb(255,206,0)","rgb(1,114,41)","rgb(0,175,173)","rgb(215,153,175)","rgb(106,114,120)","rgb(114,17,84)","rgb(0,0,0)","rgb(0,24,168)","rgb(0,160,226)","rgb(106,187,170)"]}}}}]}'}"
      container-height="450px">
    </clabs-chat-chart>
    <br />
    <h4>Parallel Coordinates</h4>
    <br />
    <clabs-chat-chart
      theme="\${chartTheme}"
      content="\${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Parallel coordinates example","data":{"url":"https://vega.github.io/vega-lite/examples/data/penguins.json"},"width":600,"height":300,"transform":[{"filter":"datum[\\'Beak Length (mm)\\']"},{"window":[{"op":"count","as":"index"}]},{"fold":["Beak Length (mm)","Beak Depth (mm)","Flipper Length (mm)","Body Mass (g)"]},{"joinaggregate":[{"op":"min","field":"value","as":"min"},{"op":"max","field":"value","as":"max"}],"groupby":["key"]},{"calculate":"(datum.value - datum.min) / (datum.max-datum.min)","as":"norm_val"},{"calculate":"(datum.min + datum.max) / 2","as":"mid"}],"layer":[{"mark":{"type":"rule","color":"#ccc"},"encoding":{"detail":{"aggregate":"count"},"x":{"field":"key"}}},{"mark":"line","encoding":{"color":{"type":"nominal","field":"Species"},"detail":{"type":"nominal","field":"index"},"opacity":{"value":0.3},"x":{"type":"nominal","field":"key"},"y":{"type":"quantitative","field":"norm_val","axis":null},"tooltip":[{"type":"quantitative","field":"Beak Length (mm)"},{"type":"quantitative","field":"Beak Depth (mm)"},{"type":"quantitative","field":"Flipper Length (mm)"},{"type":"quantitative","field":"Body Mass (g)"}]}},{"encoding":{"x":{"type":"nominal","field":"key"},"y":{"value":0}},"layer":[{"mark":{"type":"text","style":"label"},"encoding":{"text":{"aggregate":"max","field":"max"}}},{"mark":{"type":"tick","style":"tick","size":8,"color":"#ccc"}}]},{"encoding":{"x":{"type":"nominal","field":"key"},"y":{"value":150}},"layer":[{"mark":{"type":"text","style":"label"},"encoding":{"text":{"aggregate":"min","field":"mid"}}},{"mark":{"type":"tick","style":"tick","size":8,"color":"#ccc"}}]},{"encoding":{"x":{"type":"nominal","field":"key"},"y":{"value":300}},"layer":[{"mark":{"type":"text","style":"label"},"encoding":{"text":{"aggregate":"min","field":"min"}}},{"mark":{"type":"tick","style":"tick","size":8,"color":"#ccc"}}]}],"config":{"axisX":{"domain":false,"labelAngle":0,"tickColor":"#ccc","title":null},"view":{"stroke":null},"style":{"label":{"baseline":"middle","align":"right","dx":-5},"tick":{"orient":"horizontal"}}}}'}"
      container-height="500px">
    </clabs-chat-chart>
    <br />
    <br />
    <h4>30 day rolling average</h4>
    <clabs-chat-chart
      theme="\${chartTheme}"
      content="\${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Plot showing a 30 day rolling average with raw values in the background.","width":400,"height":300,"data":{"url":"https://vega.github.io/vega-lite/data/seattle-weather.csv"},"transform":[{"window":[{"field":"temp_max","op":"mean","as":"rolling_mean"}],"frame":[-15,15]}],"encoding":{"x":{"field":"date","type":"temporal","title":"Date"},"y":{"type":"quantitative","axis":{"title":"Max Temperature and Rolling Mean"}}},"layer":[{"mark":{"type":"point","opacity":0.3},"encoding":{"y":{"field":"temp_max","title":"Max Temperature"}}},{"mark":{"type":"line","color":"red","size":3},"encoding":{"y":{"field":"rolling_mean","title":"Rolling Mean of Max Temperature"}}}]}'}"
      container-height="350px">
    </clabs-chat-chart>
    <br />
    <h4>Candle stick chart</h4>
    <br />
    <clabs-chat-chart
      theme="\${chartTheme}"
      content="\${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","width":400,"description":"A candlestick chart","data":{"url":"https://vega.github.io/vega-lite/examples/data/ohlc.json"},"encoding":{"x":{"field":"date","type":"temporal","title":"Date in 2009","axis":{"format":"%m/%d","labelAngle":-45,"title":"Date in 2009"}},"y":{"type":"quantitative","scale":{"zero":false},"axis":{"title":"Price"}},"color":{"condition":{"test":"datum.open < datum.close","value":"#24a148"},"value":"#fa4d56"}},"layer":[{"mark":"rule","encoding":{"y":{"field":"low"},"y2":{"field":"high"}}},{"mark":"bar","encoding":{"y":{"field":"open"},"y2":{"field":"close"}}}]}'}"
      container-height="350px">
    </clabs-chat-chart>
    <br />\`
}`,...(F=(O=B.parameters)==null?void 0:O.docs)==null?void 0:F.source}}};var E,T,H;I.parameters={...I.parameters,docs:{...(E=I.parameters)==null?void 0:E.docs,source:{originalSource:`{
  /**
   * Renders the template for Showcase Storybook
   * @returns {TemplateResult<1>}
   */
  render: () => html\`
      \${complexExamples.map(item => html\` <h4>\${item.title}</h4>
            <i>\${item.prompt}</i>
            <clabs-chat-chart
              container-height="600px"
              container-width="800px"
              content="\${JSON.stringify(item.result)}">
            </clabs-chat-chart>\`)}
    \`
}`,...(H=(T=I.parameters)==null?void 0:T.docs)==null?void 0:H.source}}};var L,N,W;$.parameters={...$.parameters,docs:{...(L=$.parameters)==null?void 0:L.docs,source:{originalSource:`{
  /**
   * Renders the template for Showcase Storybook
   * @returns {TemplateResult<1>}
   */
  render: () => html\`
      \${otherExamples.map(item => html\` <h4>\${item.name}</h4>
            <clabs-chat-chart
              container-height="600px"
              container-width="800px"
              debug-mode
              content="\${JSON.stringify(item.spec)}">
            </clabs-chat-chart>\`)}
    \`
}`,...(W=(N=$.parameters)==null?void 0:N.docs)==null?void 0:W.source}}};var R,K,P;w.parameters={...w.parameters,docs:{...(R=w.parameters)==null?void 0:R.docs,source:{originalSource:`{
  /**
   * Renders the template for Showcase Storybook
   * @returns {TemplateResult<1>}
   */
  render: () => html\` <h4>Interactive multi-scatter plot</h4>
    <br />
    <clabs-chat-chart
      content="\${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","repeat":{"row":["Horsepower","Acceleration","Miles_per_Gallon"],"column":["Miles_per_Gallon","Acceleration","Horsepower"]},"spec":{"data":{"url":"https://vega.github.io/vega-lite/examples/data/cars.json"},"mark":"point","params":[{"name":"brush","select":{"type":"interval","resolve":"union","on":"[pointerdown[event.shiftKey], window:pointerup] > window:pointermove!","translate":"[pointerdown[event.shiftKey], window:pointerup] > window:pointermove!","zoom":"wheel![event.shiftKey]"}},{"name":"grid","select":{"type":"interval","resolve":"global","translate":"[pointerdown[!event.shiftKey], window:pointerup] > window:pointermove!","zoom":"wheel![!event.shiftKey]"},"bind":"scales"}],"encoding":{"x":{"field":{"repeat":"column"},"type":"quantitative"},"y":{"field":{"repeat":"row"},"type":"quantitative","axis":{"minExtent":30}},"color":{"condition":{"param":"brush","field":"Origin","type":"nominal"},"value":"grey"}}}}'}"
      container-height="450px"
      container-width="600px">
    </clabs-chat-chart>
    <br />
    <clabs-chat-chart
      content="\${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","repeat":{"row":["Horsepower","Acceleration","Miles_per_Gallon"],"column":["Miles_per_Gallon","Acceleration","Horsepower"]},"spec":{"data":{"url":"https://vega.github.io/vega-lite/examples/data/cars.json"},"mark":"point","params":[{"name":"brush","select":{"type":"interval","resolve":"union","on":"[pointerdown[event.shiftKey], window:pointerup] > window:pointermove!","translate":"[pointerdown[event.shiftKey], window:pointerup] > window:pointermove!","zoom":"wheel![event.shiftKey]"}},{"name":"grid","select":{"type":"interval","resolve":"global","translate":"[pointerdown[!event.shiftKey], window:pointerup] > window:pointermove!","zoom":"wheel![!event.shiftKey]"},"bind":"scales"}],"encoding":{"x":{"field":{"repeat":"column"},"type":"quantitative"},"y":{"field":{"repeat":"row"},"type":"quantitative","axis":{"minExtent":30}},"color":{"condition":{"param":"brush","field":"Origin","type":"nominal"},"value":"grey"}}}}'}"
      container-height="950px">
    </clabs-chat-chart>
    <br />
    <h4>Multi histogram</h4>
    <br />
    <clabs-chat-chart
      content="\${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","repeat":["Horsepower","Miles_per_Gallon","Acceleration","Displacement"],"columns":2,"spec":{"data":{"url":"https://vega.github.io/vega-lite/examples/data/cars.json"},"mark":"bar","encoding":{"x":{"field":{"repeat":"repeat"},"bin":true},"y":{"aggregate":"count"},"color":{"field":"Origin"}}}}'}"
      container-height="450px"
      container-width="800px">
    </clabs-chat-chart>
    <br />
    <clabs-chat-chart
      content="\${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","repeat":["Horsepower","Miles_per_Gallon","Acceleration","Displacement"],"columns":2,"spec":{"data":{"url":"https://vega.github.io/vega-lite/examples/data/cars.json"},"mark":"bar","encoding":{"x":{"field":{"repeat":"repeat"},"bin":true},"y":{"aggregate":"count"},"color":{"field":"Origin"}}}}'}"
      container-height="600px"
      container-width="400px">
    </clabs-chat-chart>
    <br />
    <clabs-chat-chart
      content="\${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","repeat":["Horsepower","Miles_per_Gallon","Acceleration","Displacement"],"columns":2,"spec":{"data":{"url":"https://vega.github.io/vega-lite/examples/data/cars.json"},"mark":"bar","encoding":{"x":{"field":{"repeat":"repeat"},"bin":true},"y":{"aggregate":"count"},"color":{"field":"Origin"}}}}'}"
      container-height="1000px">
    </clabs-chat-chart>
    <br />\`
}`,...(P=(K=w.parameters)==null?void 0:K.docs)==null?void 0:P.source}}};var U,Y,Z;k.parameters={...k.parameters,docs:{...(U=k.parameters)==null?void 0:U.docs,source:{originalSource:`{
  /**
   * Renders the template for Showcase Storybook
   * @returns {TemplateResult<1>}
   */
  render: () => html\`
    <h4>Map + lines</h4>
    <br />
    <clabs-chat-chart
      content="\${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","width":700,"height":500,"view":{"stroke":"transparent"},"layer":[{"data":{"url":"https://vega.github.io/vega-lite/examples/data/londonBoroughs.json","format":{"type":"topojson","feature":"boroughs"}},"mark":{"type":"geoshape","stroke":"white","strokeWidth":2},"encoding":{"color":{"value":"#eee"}}},{"data":{"url":"https://vega.github.io/vega-lite/examples/data/londonCentroids.json","format":{"type":"json"}},"transform":[{"calculate":"indexof (datum.name, \\' \\') > 0  ? substring(datum.name,0,indexof(datum.name, \\' \\')) : datum.name","as":"bLabel"}],"mark":"text","encoding":{"longitude":{"field":"cx","type":"quantitative"},"latitude":{"field":"cy","type":"quantitative"},"text":{"field":"bLabel","type":"nominal"},"size":{"value":8},"opacity":{"value":0.6}}},{"data":{"url":"https://vega.github.io/vega-lite/examples/data/londonTubeLines.json","format":{"type":"topojson","feature":"line"}},"mark":{"type":"geoshape","filled":false,"strokeWidth":2},"encoding":{"color":{"field":"id","type":"nominal","legend":{"title":null,"orient":"bottom-right","offset":0},"scale":{"domain":["Bakerloo","Central","Circle","District","DLR","Hammersmith & City","Jubilee","Metropolitan","Northern","Piccadilly","Victoria","Waterloo & City"],"range":["rgb(137,78,36)","rgb(220,36,30)","rgb(255,206,0)","rgb(1,114,41)","rgb(0,175,173)","rgb(215,153,175)","rgb(106,114,120)","rgb(114,17,84)","rgb(0,0,0)","rgb(0,24,168)","rgb(0,160,226)","rgb(106,187,170)"]}}}}]}'}"
      container-height="450px">
    </clabs-chat-chart>
    <br />
    <h4>Parallel Coordinates</h4>
    <br />
    <clabs-chat-chart
      content="\${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Parallel coordinates example","data":{"url":"https://vega.github.io/vega-lite/examples/data/penguins.json"},"width":600,"height":300,"transform":[{"filter":"datum[\\'Beak Length (mm)\\']"},{"window":[{"op":"count","as":"index"}]},{"fold":["Beak Length (mm)","Beak Depth (mm)","Flipper Length (mm)","Body Mass (g)"]},{"joinaggregate":[{"op":"min","field":"value","as":"min"},{"op":"max","field":"value","as":"max"}],"groupby":["key"]},{"calculate":"(datum.value - datum.min) / (datum.max-datum.min)","as":"norm_val"},{"calculate":"(datum.min + datum.max) / 2","as":"mid"}],"layer":[{"mark":{"type":"rule","color":"#ccc"},"encoding":{"detail":{"aggregate":"count"},"x":{"field":"key"}}},{"mark":"line","encoding":{"color":{"type":"nominal","field":"Species"},"detail":{"type":"nominal","field":"index"},"opacity":{"value":0.3},"x":{"type":"nominal","field":"key"},"y":{"type":"quantitative","field":"norm_val","axis":null},"tooltip":[{"type":"quantitative","field":"Beak Length (mm)"},{"type":"quantitative","field":"Beak Depth (mm)"},{"type":"quantitative","field":"Flipper Length (mm)"},{"type":"quantitative","field":"Body Mass (g)"}]}},{"encoding":{"x":{"type":"nominal","field":"key"},"y":{"value":0}},"layer":[{"mark":{"type":"text","style":"label"},"encoding":{"text":{"aggregate":"max","field":"max"}}},{"mark":{"type":"tick","style":"tick","size":8,"color":"#ccc"}}]},{"encoding":{"x":{"type":"nominal","field":"key"},"y":{"value":150}},"layer":[{"mark":{"type":"text","style":"label"},"encoding":{"text":{"aggregate":"min","field":"mid"}}},{"mark":{"type":"tick","style":"tick","size":8,"color":"#ccc"}}]},{"encoding":{"x":{"type":"nominal","field":"key"},"y":{"value":300}},"layer":[{"mark":{"type":"text","style":"label"},"encoding":{"text":{"aggregate":"min","field":"min"}}},{"mark":{"type":"tick","style":"tick","size":8,"color":"#ccc"}}]}],"config":{"axisX":{"domain":false,"labelAngle":0,"tickColor":"#ccc","title":null},"view":{"stroke":null},"style":{"label":{"baseline":"middle","align":"right","dx":-5},"tick":{"orient":"horizontal"}}}}'}"
      container-height="500px">
    </clabs-chat-chart>
    <br />
    <h4>Candle stick chart</h4>
    <br />
    <clabs-chat-chart
      content="\${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","width":400,"description":"A candlestick chart","data":{"url":"https://vega.github.io/vega-lite/examples/data/ohlc.json"},"encoding":{"x":{"field":"date","type":"temporal","title":"Date in 2009","axis":{"format":"%m/%d","labelAngle":-45,"title":"Date in 2009"}},"y":{"type":"quantitative","scale":{"zero":false},"axis":{"title":"Price"}},"color":{"condition":{"test":"datum.open < datum.close","value":"#24a148"},"value":"#fa4d56"}},"layer":[{"mark":"rule","encoding":{"y":{"field":"low"},"y2":{"field":"high"}}},{"mark":"bar","encoding":{"y":{"field":"open"},"y2":{"field":"close"}}}]}'}"
      container-height="350px">
    </clabs-chat-chart>
    <br />
    <h4>30 day rolling average</h4>
    <br />
    <clabs-chat-chart
      content="\${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Plot showing a 30 day rolling average with raw values in the background.","width":400,"height":300,"data":{"url":"https://vega.github.io/vega-lite/data/seattle-weather.csv"},"transform":[{"window":[{"field":"temp_max","op":"mean","as":"rolling_mean"}],"frame":[-15,15]}],"encoding":{"x":{"field":"date","type":"temporal","title":"Date"},"y":{"type":"quantitative","axis":{"title":"Max Temperature and Rolling Mean"}}},"layer":[{"mark":{"type":"point","opacity":0.3},"encoding":{"y":{"field":"temp_max","title":"Max Temperature"}}},{"mark":{"type":"line","color":"red","size":3},"encoding":{"y":{"field":"rolling_mean","title":"Rolling Mean of Max Temperature"}}}]}'}"
      container-height="350px">
    </clabs-chat-chart>
    <br />
  \`
}`,...(Z=(Y=k.parameters)==null?void 0:Y.docs)==null?void 0:Z.source}}};var Q,V,X;A.parameters={...A.parameters,docs:{...(Q=A.parameters)==null?void 0:Q.docs,source:{originalSource:`{
  argTypes: controls,
  args: defaultArgs,
  parameters: {
    controls: {
      expanded: true
    },
    layout: 'fullscreen'
  },
  /**
   * Renders the template for Playground Storybook
   * @param {Object} args - arguments to be sent into the playbook
   * @param {string} args.content - vega specification as a string
   * @param {boolean} args.debugMode - show explicit error messages in component
   * @param {boolean} args.carbonify - enable post-hoc carbon charts styling
   * @param {string} args.containerHeight - CSS string for container height
   * @param {string} args.containerWidth - CSS string for container width
   * @param {boolean} args.chartTheme - string to apply theme
   * @param {boolean} args.renderMethod - string to pick rendering
   * @param {boolean} args.loading - boolean to disable loading animation
   * @param {boolean} args.enableZooming - boolean to enable chart zooming
   * @param {boolean} args.enableTooltip - boolean to enable tooltip in chart
   * @param {boolean} args.enableLegendFiltering - boolean to enable filters in legend
   * @param {boolean} args.enableMultiSelection - boolean to enable brush selection
   * @param {boolean} args.enableSingleSelection - boolean to enable click selection
   * @param {boolean} args.disableOptions - hide option buttons
   * @param {boolean} args.disableEditor - hide edit button
   * @param {boolean} args.disableCodeInspector - hide inspector button
   * @param {boolean} args.disableExport - hide export button
   * @param {boolean} args.disableFullscreen - hide fullscreen button
   * @returns {TemplateResult<1>}
   */
  render: ({
    content,
    debugMode,
    carbonify,
    containerHeight,
    containerWidth,
    chartTheme,
    renderMethod,
    loading,
    enableZooming,
    enableTooltip,
    enableLegendFiltering,
    enableMultiSelection,
    enableSingleSelection,
    disableOptions,
    disableEditor,
    disableCodeInspector,
    disableExport,
    disableFullscreen
  }) => html\`
    <div style="display:grid; grid-template-columns: repeat(2,1fr); gap:16px;">
      <clabs-chat-chart
        content="\${playgroundExamples[0]}"
        ?carbonify="\${carbonify}"
        ?debug-mode="\${debugMode}"
        container-height="\${containerHeight}"
        container-width="\${containerWidth}"
        theme="\${chartTheme}"
        render-method="\${renderMethod}"
        ?loading="\${loading}"
        ?enable-legend-filtering="\${enableLegendFiltering}"
        ?enable-multi-selections="\${enableMultiSelection}"
        ?enable-single-selections="\${enableSingleSelection}"
        ?enable-zooming="\${enableZooming}"
        ?enable-tooltip="\${enableTooltip}"
        ?disable-options="\${disableOptions}"
        ?disable-editor="\${disableEditor}"
        ?disable-code-inspector="\${disableCodeInspector}"
        ?disable-export="\${disableExport}"
        ?disable-fullscreen="\${disableFullscreen}">
      </clabs-chat-chart>
      <clabs-chat-chart
        content="\${playgroundExamples[1]}"
        ?carbonify="\${carbonify}"
        ?debug-mode="\${debugMode}"
        container-height="\${containerHeight}"
        container-width="\${containerWidth}"
        theme="\${chartTheme}"
        render-method="\${renderMethod}"
        ?loading="\${loading}"
        ?enable-legend-filtering="\${enableLegendFiltering}"
        ?enable-multi-selections="\${enableMultiSelection}"
        ?enable-single-selections="\${enableSingleSelection}"
        ?enable-zooming="\${enableZooming}"
        ?enable-tooltip="\${enableTooltip}"
        ?disable-options="\${disableOptions}"
        ?disable-editor="\${disableEditor}"
        ?disable-code-inspector="\${disableCodeInspector}"
        ?disable-export="\${disableExport}"
        ?disable-fullscreen="\${disableFullscreen}">
      </clabs-chat-chart>
      <clabs-chat-chart
        content="\${playgroundExamples[2]}"
        ?carbonify="\${carbonify}"
        ?debug-mode="\${debugMode}"
        container-height="\${containerHeight}"
        container-width="\${containerWidth}"
        theme="\${chartTheme}"
        render-method="\${renderMethod}"
        ?loading="\${loading}"
        ?enable-legend-filtering="\${enableLegendFiltering}"
        ?enable-multi-selections="\${enableMultiSelection}"
        ?enable-single-selections="\${enableSingleSelection}"
        ?enable-zooming="\${enableZooming}"
        ?enable-tooltip="\${enableTooltip}"
        ?disable-options="\${disableOptions}"
        ?disable-editor="\${disableEditor}"
        ?disable-code-inspector="\${disableCodeInspector}"
        ?disable-export="\${disableExport}"
        ?disable-fullscreen="\${disableFullscreen}">
      </clabs-chat-chart>
      <clabs-chat-chart
        content="\${playgroundExamples[3]}"
        ?carbonify="\${carbonify}"
        ?debug-mode="\${debugMode}"
        container-height="\${containerHeight}"
        container-width="\${containerWidth}"
        theme="\${chartTheme}"
        render-method="\${renderMethod}"
        ?loading="\${loading}"
        ?enable-legend-filtering="\${enableLegendFiltering}"
        ?enable-multi-selections="\${enableMultiSelection}"
        ?enable-single-selections="\${enableSingleSelection}"
        ?enable-zooming="\${enableZooming}"
        ?enable-tooltip="\${enableTooltip}"
        ?disable-options="\${disableOptions}"
        ?disable-editor="\${disableEditor}"
        ?disable-code-inspector="\${disableCodeInspector}"
        ?disable-export="\${disableExport}"
        ?disable-fullscreen="\${disableFullscreen}">
      </clabs-chat-chart>
      <clabs-chat-chart
        content="\${playgroundExamples[4]}"
        ?carbonify="\${carbonify}"
        ?debug-mode="\${debugMode}"
        container-height="\${containerHeight}"
        container-width="\${containerWidth}"
        theme="\${chartTheme}"
        render-method="\${renderMethod}"
        ?loading="\${loading}"
        ?enable-legend-filtering="\${enableLegendFiltering}"
        ?enable-multi-selections="\${enableMultiSelection}"
        ?enable-single-selections="\${enableSingleSelection}"
        ?enable-zooming="\${enableZooming}"
        ?enable-tooltip="\${enableTooltip}"
        ?disable-options="\${disableOptions}"
        ?disable-editor="\${disableEditor}"
        ?disable-code-inspector="\${disableCodeInspector}"
        ?disable-export="\${disableExport}"
        ?disable-fullscreen="\${disableFullscreen}">
      </clabs-chat-chart>
      <clabs-chat-chart
        content="\${playgroundExamples[5]}"
        ?carbonify="\${carbonify}"
        ?debug-mode="\${debugMode}"
        container-height="\${containerHeight}"
        container-width="\${containerWidth}"
        theme="\${chartTheme}"
        render-method="\${renderMethod}"
        ?loading="\${loading}"
        ?enable-legend-filtering="\${enableLegendFiltering}"
        ?enable-multi-selections="\${enableMultiSelection}"
        ?enable-single-selections="\${enableSingleSelection}"
        ?enable-zooming="\${enableZooming}"
        ?enable-tooltip="\${enableTooltip}"
        ?disable-options="\${disableOptions}"
        ?disable-editor="\${disableEditor}"
        ?disable-code-inspector="\${disableCodeInspector}"
        ?disable-export="\${disableExport}"
        ?disable-fullscreen="\${disableFullscreen}">
      </clabs-chat-chart>
    </div>
    <br />
    <h4>Custom content input</h4>
    <hr />
    <clabs-chat-chart
      content="\${JSON.stringify(content)}"
      ?carbonify="\${carbonify}"
      ?debug-mode="\${debugMode}"
      container-height="\${containerHeight}"
      container-width="\${containerWidth}"
      theme="\${chartTheme}"
      render-method="\${renderMethod}"
      ?loading="\${loading}"
      ?enable-legend-filtering="\${enableLegendFiltering}"
      ?enable-multi-selections="\${enableMultiSelection}"
      ?enable-single-selections="\${enableSingleSelection}"
      ?enable-zooming="\${enableZooming}"
      ?enable-tooltip="\${enableTooltip}"
      ?disable-options="\${disableOptions}"
      ?disable-editor="\${disableEditor}"
      ?disable-code-inspector="\${disableCodeInspector}"
      ?disable-export="\${disableExport}"
      ?disable-fullscreen="\${disableFullscreen}">
    </clabs-chat-chart>
  \`
}`,...(X=(V=A.parameters)==null?void 0:V.docs)==null?void 0:X.source}}};var ee,te,ae;j.parameters={...j.parameters,docs:{...(ee=j.parameters)==null?void 0:ee.docs,source:{originalSource:`{
  /**
   * Renders the template for Showcase Storybook
   * @returns {TemplateResult<1>}
   */
  render: () => html\` <clabs-chat-chart> </clabs-chat-chart>\`
}`,...(ae=(te=j.parameters)==null?void 0:te.docs)==null?void 0:ae.source}}};var ie,le,oe;q.parameters={...q.parameters,docs:{...(ie=q.parameters)==null?void 0:ie.docs,source:{originalSource:`{
  /**
   * Renders the template for Showcase Storybook
   * @returns {TemplateResult<1>}
   */
  render: () => html\` <clabs-chat-chart
      @on-chart-error="\${event => console.log(event)}"
      content="\${'{}'}">
    </clabs-chat-chart>\`
}`,...(oe=(le=q.parameters)==null?void 0:le.docs)==null?void 0:oe.source}}};const de=["Default","Thumbnails","Showcase","ComplexExamples","FacetingTest","RepeatingLayerCharts","MultiLayerCharts","Playground","ChartSkeleton","ChartError"],ge=Object.freeze(Object.defineProperty({__proto__:null,ChartError:q,ChartSkeleton:j,ComplexExamples:I,Default:M,FacetingTest:$,MultiLayerCharts:k,Playground:A,RepeatingLayerCharts:w,Showcase:B,Thumbnails:x,__namedExportsOrder:de,default:pe},Symbol.toStringTag,{value:"Module"}));export{ge as C};
