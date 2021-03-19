const sonarqubeScanner =  require('sonarqube-scanner');
sonarqubeScanner(
    {
        serverUrl:  'http://192.168.1.109:9000',
	options : {
            'sonar.qualitygate.wait':  'true',
            'sonar.qualitygate.timeout':  '600'
	    }
    }, () => {});

