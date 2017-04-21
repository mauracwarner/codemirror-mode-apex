# codemirror-mode-apex

A CodeMirror mode for Salesforce Apex development

## Installation instructions

+ Install from NPM: `npm install codemirror-mode-apex`
+ Include the new mode into your project, e.g.
```
<script src="./node_modules/codemirror/lib/codemirror.js"></script>
<script src="./node_modules/codemirror/mode/clike/clike.js"></script>
<script src="./apex.js"></script>
```
or
```
import CodeMirror from 'codemirror'
import getCLikeMode from 'codemirror-mode-apex'
import registerApexMode from 'codemirror-mode-apex'
```
The `index.html` file in this project includes a simple example.  Note that CodeMirror must be installed through NPM as a dependency of codemirror-mode-apex for that page to display correctly.

*NB:* `apex.js` *depends on* CodeMirror's `clike` mode in order to function.  If your application cannot access the `clike` CodeMirror mode, Apex syntax highlighting will not work!
