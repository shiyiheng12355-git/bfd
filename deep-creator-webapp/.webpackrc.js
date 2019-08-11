import path from 'path';

export default {
  "entry": "src/index.js",
  "extraBabelPlugins": [
    "transform-decorators-legacy",
    "transform-class-properties",
    ["import", { "libraryName": "antd", "libraryDirectory": "es", "style": true }]
  ],
  "env": {
    "development": {
      "extraBabelPlugins": [
        "dva-hmr"
      ],
      "define": {
        "BUILD_ENV": process.env.BUILD_ENV || "development"
      }
    },
    "production": {
      "define": {
        "BUILD_ENV": process.env.BUILD_ENV || "production"
      }
    }
  },
  "define": {
    "BUILD_ENV": process.env.BUILD_ENV || "production"
  },
  "alias": {
    "deep-creator-sdk": path.resolve(__dirname, './src/services/api')
  },
  "externals": {
    "g2": "G2",
    "g-cloud": "Cloud",
    "g2-plugin-slider": "G2.Plugin.slider"
  },
  "ignoreMomentLocale": true,
  "theme": "./src/theme.js",
  "html": {
    "template": "./src/index.ejs"
  },
  "disableDynamicImport": false,
  "hash": true

}
