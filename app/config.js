require.config({
  // make components more sensible
  // expose lodash
  paths: {
    "components": "../bower_components",
    "jquery": "../bower_components/jquery/dist/jquery",
    "lodash": "../bower_components/lodash/dist/lodash",
    "moment": "../bower_components/moment/moment"
  }
});

require(["main"]);