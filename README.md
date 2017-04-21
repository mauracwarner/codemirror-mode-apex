# codemirror-mode-apex

A CodeMirror mode for Salesforce Apex development

## Installation instructions

+ Install from NPM: `npm install codemirror-mode-apex`
+ Include the new mode into your project, e.g.
```
<script src="./node_modules/codemirror/lib/codemirror.js"></script>
<script src="./apex.js"></script>
```
or
```
import CodeMirror from 'codemirror'
import registerApexMode from 'codemirror-mode-apex'
```
+ Set the mode to `text/x-apex` in your editor, e.g.
```
var editor = CodeMirror.fromTextArea(document.getElementById("code"), {
        mode: "text/x-apex"
      });
```
The `index.html` file in this project includes a simple example.  Note that CodeMirror must be installed through NPM as a dependency of codemirror-mode-apex for that page to display correctly.

