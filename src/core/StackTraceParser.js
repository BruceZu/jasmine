getJasmineRequireObj().StackTraceParser = function(j$) {
  function StackTraceParser() {
    this.parse = function(rawTrace) {
      var message = null;
      var lines = rawTrace
        .split('\n')
        .filter(function(line) { return line !== ''; });

      if (lines[0].match(/^Error/)) {
        message = lines.shift();
      }

      return {
        message: message,
        frames: tryParseFrames(lines) || null
      };
    };
  }

  var framePatterns = [
    // PhantomJS on Linux, Node, Chrome, IE, Edge
    // e.g. "   at QueueRunner.run (http://localhost:8888/__jasmine__/jasmine.js:4320:20)"
    // Note that the "function name" can include a surprisingly large set of
    // characters, including angle brackets and square brackets.
    { re: /^\s*at ([^\)]+) \(([^\)]+)\)$/, fnIx: 1, fileLineColIx: 2 },

    // NodeJS alternate form, often mixed in with the Chrome style
    // e.g. "  at /some/path:4320:20
    { re: /\s*at (.+)$/, fileLineColIx: 1 },

    // PhantomJS on OS X, Safari, Firefox
    // e.g. "run@http://localhost:8888/__jasmine__/jasmine.js:4320:27"
    // or "http://localhost:8888/__jasmine__/jasmine.js:4320:27"
    { re: /^(([^@\s]+)@)?([^\s]+)$/, fnIx: 2, fileLineColIx: 3 }
  ];

  // regexes should capture the function name (if any) as group 1
  // and the file, line, and column as group 2.
  function tryParseFrames(lines) {
    return lines.map(function(line) {
      var convertedLine = first(framePatterns, function(pattern) {
        var overallMatch = line.match(pattern.re),
          fileLineColMatch;
        if (!overallMatch) { return null; }

        fileLineColMatch = overallMatch[pattern.fileLineColIx].match(
          /^(.*):(\d+):\d+$/);
        if (!fileLineColMatch) { return null; }

        return {
          raw: line,
          file: fileLineColMatch[1],
          line: parseInt(fileLineColMatch[2], 10),
          func: overallMatch[pattern.fnIx]
        };
      });

      return convertedLine || { raw: line };
    });
  }

  function first(items, fn) {
    var i, result;

    for (i = 0; i < items.length; i++) {
      result = fn(items[i]);

      if (result) {
        return result;
      }
    }
  }
  
  return StackTraceParser;
};
