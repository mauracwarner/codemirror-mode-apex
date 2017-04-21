function words(str) {
  var obj = {},
      words = str.split(" ");
  for (var i = 0; i < words.length; ++i) {
    obj[words[i]] = true;
  }return obj;
}

CodeMirror.defineMIME("text/x-apex", {
  name: "clike",
  keywords: words( // From Java
  "abstract assert break catch class const continue default " + "do else enum extends final finally float for if implements " + "instanceof interface new package private protected public " + "return static super this throw try while " +
  // Apex only
  "global continue decimal default future tolabel webservice " + "virtual with sharing test " +
  // SOQL
  "and AND as AS asc ASC bulk BULK by BY commit COMMIT delete " + "DELETE from FROM insert INSERT last_90_days last_month " + "last_n_days last_week LAST_90_DAYS LAST_MONTH LAST_N_DAYS " + "LAST_WEEK like LIKE limit LIMIT merge MERGE not NOT on ON " + "or OR rollback ROLLBACK select SELECT set SET sort SORT " + "this_week THIS_WEEK today TODAY tomorrow TOMORROW undelete " + "UNDELETE update UPDATE upsert UPSERT where WHERE yesterday " + "YESTERDAY using USING convertcurrency CONVERTCURRENCY after " + "AFTER before BEFORE count COUNT excludes EXCLUDES first FIRST " + "includes INCLUDES last LAST order ORDER"),
  types: words("byte short int long float double boolean void Boolean Byte " + "Character Double Float Integer Long Number Object Short String " + "Void blob Blob RestContext System system"),
  blockKeywords: words("catch class do else finally for if try while"),
  defKeywords: words("class interface package enum"),
  typeFirstDefinitions: true,
  atoms: words("true false null nulls TRUE FALSE NULL NULLS"),
  hooks: {
    "@": function _(stream) {
      stream.eatWhile(/[\w\$_]/);
      return "meta";
    }
  },
  modeProps: { fold: ["brace"] }
});
