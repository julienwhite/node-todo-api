function bar(length, symbol) {
  var output = '';
  for(var i=0; i<length; i++)
  { output += symbol.toString(); }
  return output;
};

function title(message) {
  var titleBar = bar((20 + message.length),'=');
  var titleSpace = bar(10, ' ').toString();
  return `\n${titleBar}\n${titleSpace}${message}\n${titleBar}`;
};

function subtitle(message) {
  var subtitleBar = bar((message.length),'-');
  return `\n${message}\n${subtitleBar}`;
};


module.exports = {
bar,
title,
subtitle
}
