VMC = (function(code){	
Parser = (function(){
  /*
   * Generated by PEG.js 0.7.0.
   *
   * http://pegjs.majda.cz/
   */
  
  function quote(s) {
    /*
     * ECMA-262, 5th ed., 7.8.4: All characters may appear literally in a
     * string literal except for the closing quote character, backslash,
     * carriage return, line separator, paragraph separator, and line feed.
     * Any character may appear in the form of an escape sequence.
     *
     * For portability, we also escape escape all control and non-ASCII
     * characters. Note that "\0" and "\v" escape sequences are not used
     * because JSHint does not like the first and IE the second.
     */
     return '"' + s
      .replace(/\\/g, '\\\\')  // backslash
      .replace(/"/g, '\\"')    // closing quote character
      .replace(/\x08/g, '\\b') // backspace
      .replace(/\t/g, '\\t')   // horizontal tab
      .replace(/\n/g, '\\n')   // line feed
      .replace(/\f/g, '\\f')   // form feed
      .replace(/\r/g, '\\r')   // carriage return
      .replace(/[\x00-\x07\x0B\x0E-\x1F\x80-\uFFFF]/g, escape)
      + '"';
  }
  
  var result = {
    /*
     * Parses the input with a generated parser. If the parsing is successfull,
     * returns a value explicitly or implicitly specified by the grammar from
     * which the parser was generated (see |PEG.buildParser|). If the parsing is
     * unsuccessful, throws |PEG.parser.SyntaxError| describing the error.
     */
    parse: function(input, startRule) {
      var parseFunctions = {
        "program": parse_program,
        "space": parse_space,
        "ospace": parse_ospace,
        "label": parse_label,
        "labelend": parse_labelend,
        "integer": parse_integer,
        "digits": parse_digits,
        "zero_param_command": parse_zero_param_command,
        "one_param_command": parse_one_param_command,
        "one_label_command": parse_one_label_command,
        "command": parse_command,
        "instruction": parse_instruction
      };
      
      if (startRule !== undefined) {
        if (parseFunctions[startRule] === undefined) {
          throw new Error("Invalid rule name: " + quote(startRule) + ".");
        }
      } else {
        startRule = "program";
      }
      
      var pos = 0;
      var reportFailures = 0;
      var rightmostFailuresPos = 0;
      var rightmostFailuresExpected = [];
      
      function padLeft(input, padding, length) {
        var result = input;
        
        var padLength = length - input.length;
        for (var i = 0; i < padLength; i++) {
          result = padding + result;
        }
        
        return result;
      }
      
      function escape(ch) {
        var charCode = ch.charCodeAt(0);
        var escapeChar;
        var length;
        
        if (charCode <= 0xFF) {
          escapeChar = 'x';
          length = 2;
        } else {
          escapeChar = 'u';
          length = 4;
        }
        
        return '\\' + escapeChar + padLeft(charCode.toString(16).toUpperCase(), '0', length);
      }
      
      function matchFailed(failure) {
        if (pos < rightmostFailuresPos) {
          return;
        }
        
        if (pos > rightmostFailuresPos) {
          rightmostFailuresPos = pos;
          rightmostFailuresExpected = [];
        }
        
        rightmostFailuresExpected.push(failure);
      }
      
      function parse_program() {
        var result0, result1;
        
        result1 = parse_command();
        if (result1 !== null) {
          result0 = [];
          while (result1 !== null) {
            result0.push(result1);
            result1 = parse_command();
          }
        } else {
          result0 = null;
        }
        return result0;
      }
      
      function parse_space() {
        var result0, result1;
        
        if (/^[ \n\x08\t\r]/.test(input.charAt(pos))) {
          result1 = input.charAt(pos);
          pos++;
        } else {
          result1 = null;
          if (reportFailures === 0) {
            matchFailed("[ \\n\\x08\\t\\r]");
          }
        }
        if (result1 !== null) {
          result0 = [];
          while (result1 !== null) {
            result0.push(result1);
            if (/^[ \n\x08\t\r]/.test(input.charAt(pos))) {
              result1 = input.charAt(pos);
              pos++;
            } else {
              result1 = null;
              if (reportFailures === 0) {
                matchFailed("[ \\n\\x08\\t\\r]");
              }
            }
          }
        } else {
          result0 = null;
        }
        return result0;
      }
      
      function parse_ospace() {
        var result0, result1;
        
        result0 = [];
        result1 = parse_space();
        while (result1 !== null) {
          result0.push(result1);
          result1 = parse_space();
        }
        return result0;
      }
      
      function parse_label() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (/^[aA-zZ_]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[aA-zZ_]");
          }
        }
        if (result0 !== null) {
          result1 = [];
          result2 = parse_labelend();
          while (result2 !== null) {
            result1.push(result2);
            result2 = parse_labelend();
          }
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, v, w) {return v+w.join("");})(pos0, result0[0], result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_labelend() {
        var result0;
        
        if (/^[aA-zZ_0-9]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[aA-zZ_0-9]");
          }
        }
        return result0;
      }
      
      function parse_integer() {
        var result0, result1;
        var pos0, pos1;
        
        result0 = parse_digits();
        if (result0 === null) {
          pos0 = pos;
          pos1 = pos;
          if (input.charCodeAt(pos) === 45) {
            result0 = "-";
            pos++;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("\"-\"");
            }
          }
          if (result0 !== null) {
            result1 = parse_digits();
            if (result1 !== null) {
              result0 = [result0, result1];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
          if (result0 !== null) {
            result0 = (function(offset, d) {return -d;})(pos0, result0[1]);
          }
          if (result0 === null) {
            pos = pos0;
          }
          if (result0 === null) {
            pos0 = pos;
            pos1 = pos;
            if (input.charCodeAt(pos) === 43) {
              result0 = "+";
              pos++;
            } else {
              result0 = null;
              if (reportFailures === 0) {
                matchFailed("\"+\"");
              }
            }
            if (result0 !== null) {
              result1 = parse_digits();
              if (result1 !== null) {
                result0 = [result0, result1];
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
            if (result0 !== null) {
              result0 = (function(offset, d) {return d;})(pos0, result0[1]);
            }
            if (result0 === null) {
              pos = pos0;
            }
          }
        }
        return result0;
      }
      
      function parse_digits() {
        var result0, result1;
        var pos0;
        
        pos0 = pos;
        if (/^[0-9]/.test(input.charAt(pos))) {
          result1 = input.charAt(pos);
          pos++;
        } else {
          result1 = null;
          if (reportFailures === 0) {
            matchFailed("[0-9]");
          }
        }
        if (result1 !== null) {
          result0 = [];
          while (result1 !== null) {
            result0.push(result1);
            if (/^[0-9]/.test(input.charAt(pos))) {
              result1 = input.charAt(pos);
              pos++;
            } else {
              result1 = null;
              if (reportFailures === 0) {
                matchFailed("[0-9]");
              }
            }
          }
        } else {
          result0 = null;
        }
        if (result0 !== null) {
          result0 = (function(offset, digits) { return parseInt(digits.join(""), 10); })(pos0, result0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_zero_param_command() {
        var result0;
        
        if (input.substr(pos, 4) === "halt") {
          result0 = "halt";
          pos += 4;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"halt\"");
          }
        }
        if (result0 === null) {
          if (input.substr(pos, 3) === "add") {
            result0 = "add";
            pos += 3;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("\"add\"");
            }
          }
          if (result0 === null) {
            if (input.substr(pos, 3) === "sub") {
              result0 = "sub";
              pos += 3;
            } else {
              result0 = null;
              if (reportFailures === 0) {
                matchFailed("\"sub\"");
              }
            }
            if (result0 === null) {
              if (input.substr(pos, 3) === "mul") {
                result0 = "mul";
                pos += 3;
              } else {
                result0 = null;
                if (reportFailures === 0) {
                  matchFailed("\"mul\"");
                }
              }
              if (result0 === null) {
                if (input.substr(pos, 3) === "leq") {
                  result0 = "leq";
                  pos += 3;
                } else {
                  result0 = null;
                  if (reportFailures === 0) {
                    matchFailed("\"leq\"");
                  }
                }
              }
            }
          }
        }
        return result0;
      }
      
      function parse_one_param_command() {
        var result0;
        
        if (input.substr(pos, 3) === "con") {
          result0 = "con";
          pos += 3;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"con\"");
          }
        }
        if (result0 === null) {
          if (input.substr(pos, 4) === "peek") {
            result0 = "peek";
            pos += 4;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("\"peek\"");
            }
          }
          if (result0 === null) {
            if (input.substr(pos, 4) === "poke") {
              result0 = "poke";
              pos += 4;
            } else {
              result0 = null;
              if (reportFailures === 0) {
                matchFailed("\"poke\"");
              }
            }
          }
        }
        return result0;
      }
      
      function parse_one_label_command() {
        var result0;
        
        if (input.substr(pos, 2) === "jp") {
          result0 = "jp";
          pos += 2;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"jp\"");
          }
        }
        if (result0 === null) {
          if (input.substr(pos, 3) === "cjp") {
            result0 = "cjp";
            pos += 3;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("\"cjp\"");
            }
          }
        }
        return result0;
      }
      
      function parse_command() {
        var result0, result1, result2, result3;
        var pos0, pos1;
        
        result0 = parse_instruction();
        if (result0 === null) {
          pos0 = pos;
          pos1 = pos;
          result0 = parse_ospace();
          if (result0 !== null) {
            result1 = parse_label();
            if (result1 !== null) {
              if (input.charCodeAt(pos) === 58) {
                result2 = ":";
                pos++;
              } else {
                result2 = null;
                if (reportFailures === 0) {
                  matchFailed("\":\"");
                }
              }
              if (result2 !== null) {
                result3 = parse_instruction();
                if (result3 !== null) {
                  result0 = [result0, result1, result2, result3];
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
          if (result0 !== null) {
            result0 = (function(offset, l, c) {
          	c["label"] = l;
          	return c;
          })(pos0, result0[1], result0[3]);
          }
          if (result0 === null) {
            pos = pos0;
          }
        }
        return result0;
      }
      
      function parse_instruction() {
        var result0, result1, result2, result3, result4;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_ospace();
        if (result0 !== null) {
          result1 = parse_one_param_command();
          if (result1 !== null) {
            result2 = parse_space();
            if (result2 !== null) {
              result3 = parse_integer();
              if (result3 !== null) {
                result4 = parse_ospace();
                if (result4 !== null) {
                  result0 = [result0, result1, result2, result3, result4];
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, c, i) {
        	return {"command": c, "params": {"type": "integer", "value": [i]}, "length": 2};
        })(pos0, result0[1], result0[3]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        if (result0 === null) {
          pos0 = pos;
          pos1 = pos;
          result0 = parse_ospace();
          if (result0 !== null) {
            result1 = parse_zero_param_command();
            if (result1 !== null) {
              result2 = parse_ospace();
              if (result2 !== null) {
                result0 = [result0, result1, result2];
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
          if (result0 !== null) {
            result0 = (function(offset, c) {
          	return {"command": c, "params": {"type": "integer", "value": []}, "length": 1};
          })(pos0, result0[1]);
          }
          if (result0 === null) {
            pos = pos0;
          }
          if (result0 === null) {
            pos0 = pos;
            pos1 = pos;
            result0 = parse_ospace();
            if (result0 !== null) {
              result1 = parse_one_label_command();
              if (result1 !== null) {
                result2 = parse_space();
                if (result2 !== null) {
                  result3 = parse_label();
                  if (result3 !== null) {
                    result4 = parse_ospace();
                    if (result4 !== null) {
                      result0 = [result0, result1, result2, result3, result4];
                    } else {
                      result0 = null;
                      pos = pos1;
                    }
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
            if (result0 !== null) {
              result0 = (function(offset, c, l) {
            	return {"command": c, "params": {"type": "label", "value": [l]}, "length": 2}
            })(pos0, result0[1], result0[3]);
            }
            if (result0 === null) {
              pos = pos0;
            }
            if (result0 === null) {
              pos0 = pos;
              pos1 = pos;
              result0 = parse_ospace();
              if (result0 !== null) {
                result1 = parse_one_label_command();
                if (result1 !== null) {
                  result2 = parse_space();
                  if (result2 !== null) {
                    result3 = parse_integer();
                    if (result3 !== null) {
                      result4 = parse_ospace();
                      if (result4 !== null) {
                        result0 = [result0, result1, result2, result3, result4];
                      } else {
                        result0 = null;
                        pos = pos1;
                      }
                    } else {
                      result0 = null;
                      pos = pos1;
                    }
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
              if (result0 !== null) {
                result0 = (function(offset, c, i) {
              	return {"command": c, "params": {"type": "relative", "value": [i]}, "length": 2}
              })(pos0, result0[1], result0[3]);
              }
              if (result0 === null) {
                pos = pos0;
              }
            }
          }
        }
        return result0;
      }
      
      
      function cleanupExpected(expected) {
        expected.sort();
        
        var lastExpected = null;
        var cleanExpected = [];
        for (var i = 0; i < expected.length; i++) {
          if (expected[i] !== lastExpected) {
            cleanExpected.push(expected[i]);
            lastExpected = expected[i];
          }
        }
        return cleanExpected;
      }
      
      function computeErrorPosition() {
        /*
         * The first idea was to use |String.split| to break the input up to the
         * error position along newlines and derive the line and column from
         * there. However IE's |split| implementation is so broken that it was
         * enough to prevent it.
         */
        
        var line = 1;
        var column = 1;
        var seenCR = false;
        
        for (var i = 0; i < Math.max(pos, rightmostFailuresPos); i++) {
          var ch = input.charAt(i);
          if (ch === "\n") {
            if (!seenCR) { line++; }
            column = 1;
            seenCR = false;
          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
            line++;
            column = 1;
            seenCR = true;
          } else {
            column++;
            seenCR = false;
          }
        }
        
        return { line: line, column: column };
      }
      
      
      var result = parseFunctions[startRule]();
      
      /*
       * The parser is now in one of the following three states:
       *
       * 1. The parser successfully parsed the whole input.
       *
       *    - |result !== null|
       *    - |pos === input.length|
       *    - |rightmostFailuresExpected| may or may not contain something
       *
       * 2. The parser successfully parsed only a part of the input.
       *
       *    - |result !== null|
       *    - |pos < input.length|
       *    - |rightmostFailuresExpected| may or may not contain something
       *
       * 3. The parser did not successfully parse any part of the input.
       *
       *   - |result === null|
       *   - |pos === 0|
       *   - |rightmostFailuresExpected| contains at least one failureUncaught
       *
       * All code following this comment (including called functions) must
       * handle these states.
       */
      if (result === null || pos !== input.length) {
        var offset = Math.max(pos, rightmostFailuresPos);
        var found = offset < input.length ? input.charAt(offset) : null;
        var errorPosition = computeErrorPosition();
        
        throw new this.SyntaxError(
          cleanupExpected(rightmostFailuresExpected),
          found,
          offset,
          errorPosition.line,
          errorPosition.column
        );
      }
      
      return result;
    },
    
    /* Returns the parser source code. */
    toSource: function() { return this._source; }
  };
  
  /* Thrown when a parser encounters a syntax error. */
  
  result.SyntaxError = function(expected, found, offset, line, column) {
    function buildMessage(expected, found) {
      var expectedHumanized, foundHumanized;
      
      switch (expected.length) {
        case 0:
          expectedHumanized = "end of input";
          break;
        case 1:
          expectedHumanized = expected[0];
          break;
        default:
          expectedHumanized = expected.slice(0, expected.length - 1).join(", ")
            + " or "
            + expected[expected.length - 1];
      }
      
      foundHumanized = found ? quote(found) : "end of input";
      
      return "Expected " + expectedHumanized + " but " + foundHumanized + " found.";
    }
    
    this.name = "SyntaxError";
    this.expected = expected;
    this.found = found;
    this.message = buildMessage(expected, found);
    this.offset = offset;
    this.line = line;
    this.column = column;
  };
  
  result.SyntaxError.prototype = Error.prototype;
  
  return result;
})();
	return function(code){
		var parsed = Parser.parse(code.toLowerCase());
	
		var commands = [];
		var labels = {};
		var counter = 0;
		for(var i=0;i<parsed.length;i++){
			var command = parsed[i];
		
			if(command.hasOwnProperty("label")){
				var label = command.label;
				if(labels.hasOwnProperty(label)){
					throw {"message": "Encountered double label '"+label+"'"};
				} else {
					labels[label] = counter;				
				}
			}
			command["pos"] = counter;
			counter += command.length;
			commands.push(command);
		}

		for(var i=0;i<commands.length;i++){
			var command = commands[i];
			if(command.params.type == "label"){
				var label = command.params.value[0];
				if(labels.hasOwnProperty(label)){
					command.params.type = "absolute";
					command.params.value[0] = labels[label]-command["pos"]; //jump to the label at position
				} else {
					throw {"message": "Undefined label '"+label+"'", "id": label};	
				}
				command.params.type = "absolute";
		
			}
		}

		var outs = [];

		for(var i=0;i<commands.length;i++){
			var command = commands[i];
			var text = command.command;
			var args = [];
			for(var j=0;j<command.params.value.length;j++){
				args.push(command.params.value[j].toString())
			}
			if(args.length > 0){
				text += " "+args.join(" ");
			}
			outs.push(text);
		}
	
		return outs.join("\n"); 
	};
})();