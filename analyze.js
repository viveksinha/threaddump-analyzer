function analyze_textfield() {
    var text = document.getElementById("TEXTAREA").value;

    var analyzer = new Analyzer(text);
    setOutputText(analyzer.toString());
}

function setOutputText(unescaped) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(unescaped));
    var escaped = div.innerHTML;

    var outputDiv = document.getElementById("OUTPUT");
    outputDiv.innerHTML = escaped;
}

function ThreadHeader(line) {
    this.toString = function() {
        return '"' + this.name + '": ' + (this.daemon ? "daemon, " : "") + this.state;
    };

    this.isValid = function() {
        return this.hasOwnProperty('name');
    };

    THREAD_HEADER = /"(.*)" (daemon )?prio=([0-9]+) tid=(0x[0-9a-f]+) nid=(0x[0-9a-f]+) (.*)\[(0x[0-9a-f]+)\]/;
    var match = THREAD_HEADER.exec(line);
    if (match === null) {
        return undefined;
    }

    this.name = match[1];
    this.daemon = (match[2] !== undefined);
    this.prio = parseInt(match[3]);
    this.tid = match[4];
    this.nid = match[5];
    this.state = match[6].trim();
    this.dontknow = match[7];
}

// Create an analyzer object
function Analyzer(text) {
    this._analyze = function(text) {
        var lines = text.split('\n');
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            while (line.charAt(0) == '"' && line.indexOf(' prio=') == -1) {
                // Multi line thread name
                i++;
                if (i >= lines.length) {
                    break;
                }

                // Replace thread name newline with ", "
                line += ', ' + lines[i];
            }

            var threadHeader = new ThreadHeader(line);
            if (threadHeader.isValid()) {
                this.threads.push(threadHeader);
            }
        }
    };

    this.toString = function() {
        var asString = "";
        asString += "" + this.threads.length + " threads found:\n";
        for (var i = 0; i < this.threads.length; i++) {
            header = this.threads[i];
            asString += '\n' + header;
        }
        return asString;
    };

    this.threads = [];
    this._analyze(text);
}
