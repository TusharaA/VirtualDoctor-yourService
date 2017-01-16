//defining the virtualDoctorController controller
virtualDoctor.controller('virtualDoctorController', function($scope, $http) {
	$scope.askQuestion = function() {
		$http({
			method : "POST",
			url : '/api/classify',
			data : {
				"questionText" : $scope.questionText
			}
		}).success(function(data) {
				$scope.results = data.results;
				window.location.assign('/result');
		}).error(function(error) {});
	};
	
	$scope.displayGraph = function() {
		window.location.assign('/displayGraph');
	};
	
	$scope.populate=function(medicalGraph)
	{
		var disease=[];
		var probability=[];
		var d=[];
		medicalGraph=JSON.parse(medicalGraph);
		for(var i=0;i<medicalGraph.length;i++){
			disease[i]=medicalGraph[i].class_name;
			probability[i]=medicalGraph[i].confidence*100;
			/*d=date[i].split('T');
			console.log(d[0]);
			date[i]=d[0];*/
		}
		
		
		var chart = new Highcharts.Chart({
            colors: ["#7cb5ec", "#f7a35c"],
            chart: {
                type: 'column',
                renderTo: 'container'
            },
    title: {
        text: 'Prediction graph'
    },
   
    xAxis: {
        categories: 
            disease
        ,
        crosshair: true
    },
    yAxis: {
        min: 0,
        title: {
            text: 'Ailment Prediction'
        }
    },
    tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0"><b>{point.y:.3f} </b></td></tr>',
        footerFormat: '</table>',
        shared: true,
        useHTML: true
    },
    plotOptions: {
        column: {
            pointPadding: 0.02,
            borderWidth: 0
        }
    },
    series: [{
        name: "Confidence",
        data: probability

    }]
});

	};
});
