module.exports = {
	"env": {
        "node": true,
        "browser": true,
		"commonjs": true,
        "es6": true,
        "jest": true
	},
	"extends": "eslint:recommended",
	"parserOptions": {
		"sourceType": "module",
		"ecmaVersion": 8
    },
    "globals": {
        "process": true
      },
	"rules": {
		"indent": [
			"error",
			"tab"
		],
		"linebreak-style": [
			"error",
			"windows"
		],
		"quotes": [
			"error",
			"single"
		],
		"semi": [
			"error",
			"never"
        ],
        "no-unused-vars": ["error", { "vars": "all", "args": "none", "ignoreRestSiblings": false }],
        'no-console': 0
    },
};