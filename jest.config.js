module.exports = {
	roots: ['<rootDir>/src'],
	transform: {
	  '^.+\\.tsx?$': 'ts-jest',
	},
	testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
	"preset": "jest-preset-angular",
	"setupFilesAfterEnv": [
			"<rootDir>/setupJest.ts"
	],
	"transformIgnorePatterns": [
			"node_modules/(?!@ngrx|ngx-socket-io)" // Last any packages here that error
	],
	"transform": {
			"^.+\\.(ts|js|html)$": "ts-jest"
	},
	"testPathIgnorePatterns": [
			"<rootDir>/node_modules/",
			"<rootDir>/dist/",
			"<rootDir>/cypress/",
			"<rootDir>/src/test.ts",
	],
	testResultsProcessor: "jest-sonar-reporter",
	coverageReporters: ['text', 'lcov', 'clover', 'html'],

};