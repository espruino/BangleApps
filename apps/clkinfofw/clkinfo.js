(function() {
  return {
    name: "Bangle",
    items: [
      { name : "FW",
        get : () => {
          return {
            text : process.env.VERSION,
            img : atob("GBjC////AADve773VWmmmmlVVW22nnlVVbLL445VVwAAAADVWAAAAAAlrAAAAAA6sAAAAAAOWAAAAAAlrAD//wA6sANVVcAOWANVVcAlrANVVcA6rANVVcA6WANVVcAlsANVVcAOrAD//wA6WAAAAAAlsAAAAAAOrAAAAAA6WAAAAAAlVwAAAADVVbLL445VVW22nnlVVWmmmmlV")
          };
        },
        show : function() {},
        hide : function() {}
      }
    ]
  };
})
