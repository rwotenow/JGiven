/**
 * Utility functions
 */


String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

Array.prototype.pushArray = function (arr) {
  this.push.apply(this, arr);
};

var ONE_HOUR_IN_MS = 3600000;
var ONE_MINUTE_IN_MS = 60000;
var ONE_SECOND_IN_MS = 1000;

export function nanosToReadableUnit (nanos) {
  var msNum = nanos / 1000000;

  if (msNum < ONE_SECOND_IN_MS) {
    return Math.floor(msNum) + "ms";
  }

  if (msNum < ONE_MINUTE_IN_MS) {
    return parseFloat(msNum / 1000).toFixed(3) + "s";
  }

  var hours = Math.floor(msNum / ONE_HOUR_IN_MS);
  var mins = Math.floor((msNum - (hours * ONE_HOUR_IN_MS)) / ONE_MINUTE_IN_MS);
  var secs = Math.floor((msNum - (hours * ONE_HOUR_IN_MS + mins * ONE_MINUTE_IN_MS)) / ONE_SECOND_IN_MS);
  var ms = Math.floor(ms);

  var time = secs;
  var unit = "min";

  if (mins > 0) {
    if (secs < 10) {
      secs = "0" + secs;
    }
    time = mins + ":" + secs;
  }

  if (hours > 0) {
    if (mins < 10) {
      mins = "0" + mins;
    }
    time = hours + ":" + mins;
    unit = "h";
  }
  return time + unit;
}


export function undefinedOrEmpty (array) {
  return !array || array.length === 0;
}

export function getWordValue(word) {
  return word.argumentInfo ? word.argumentInfo.formattedValue : word.value
}

export function getTagName (tag) {
  return tag.name ? tag.name : tag.type;
}

export function getTagId (tag) {
  return tag.fullType ? tag.fullType : tag.type;
}

export function getTagKey (tag) {
  return getTagId(tag) + (tag.value ? '-' + tag.value : '');
}

export function tagToString (tag) {
  var res = '';

  if (!tag.value || tag.prependType) {
    res = getTagName(tag);
  }

  if (tag.value) {
    if (res) {
      res += '-';
    }
    res += tag.value;
  }

  return res;
}

export function splitClassName (fullQualifiedClassName) {
  var index = fullQualifiedClassName.lastIndexOf('.');
  var className = fullQualifiedClassName.substr(index + 1);
  var packageName = fullQualifiedClassName.substr(0, index);
  return {
    className: className,
    packageName: packageName
  };
}

export function getScenarioId (scenario) {
  return scenario.className + "." + scenario.testMethodName;
}

export function sortByDescription (scenarios) {
  var sortedScenarios = _.forEach(_.sortBy(scenarios, function (x) {
    return x.description.toLowerCase();
  }), function (x) {
    x.expanded = false;
  });

  // directly expand a scenario if it is the only one
  if (sortedScenarios.length === 1) {
    sortedScenarios[0].expanded = true;
  }

  return sortedScenarios;
}

export function getReadableExecutionStatus (status) {
  switch (status) {
    case 'SUCCESS':
      return 'Successful';
    case 'FAILED':
      return 'Failed';
    default:
      return 'Pending';
  }
}

export function ownProperties (obj) {
  var result = [];
  for (var p in obj) {
    if (obj.hasOwnProperty(p)) {
      result.push(p);
    }
  }
  return result;
}

export function deselectAll (options) {
  _.forEach(options, function (option) {
    option.selected = false;
  });
}

export function getArgumentList(wordList) {
  function isArgument(word) { return !!word.argumentInfo; }
  return _.chain(wordList)
          .filter(isArgument)
          .map(function (word) { return word.value; })
          .value();
}

export function parseNextInt(arr) {
    var numbers = _.takeWhile(arr, function (c) { return !isNaN(c) && c !== " "; }).join("");
    var parsedInt = parseInt(numbers);
    var result  = { integer : isNaN(parsedInt) ? undefined : parsedInt
                  , length  : numbers.length } ;
    return result;
}

export function replaceArguments(string, argumentList) {
    var separator = "$";
    var result    = [];
    var placeHolderCount = 0;

    for(var i = 0; i < string.length; ++i) {
        var c           = string.charAt(i);
        var lookahead   = string.charAt(i+1);
        var isSeparator = c          === separator;
        var escaped     = (lookahead === separator) && isSeparator;
        var argument    = undefined;
        var argumentLen = 0;

        if (isSeparator && !escaped) {
            var argIndex = parseNextInt(_.drop(string, i+1));
            if (argIndex.integer === undefined) {
                argument = argumentList[placeHolderCount++];
            } else {
                argument = argumentList[argIndex.integer-1];
                argumentLen = argIndex.length;
            }
        } else if (escaped) {
            argument = separator;
            argumentLen = 1;
        }

        if (argument !== undefined) {
            result.push(argument);
            i += argumentLen;
        } else {
            result.push(c);
        }
    }
    return result.join("");
}