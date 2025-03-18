(function(back) {
  let settings = Object.assign({
    showConfirm : true,
    showAutoSnooze : true,
    showHidden : true
  }, require('Storage').readJSON('alarm.json',1)||{});

  const save = () => require('Storage').write('alarm.json', settings);
  const DATE_FORMATS = ['default', 'mmdd'];
  const DATE_FORMATS_LABELS = [/*LANG*/'Default', /*LANG*/'MMDD'];

  const appMenu = {
      '': {title: 'alarm'}, '< Back': back,
      /*LANG*/'Menu Date Format': {
        value: DATE_FORMATS.indexOf(settings.menuDateFormat || 'default'),
        format: v => DATE_FORMATS_LABELS[v],
        min: 0,
        max: DATE_FORMATS.length - 1,
        onchange : v => {
          if(v > 0) {
            settings.menuDateFormat=DATE_FORMATS[v];
          } else {
            delete settings.menuDateFormat;
          }
          save();
        }
      },
      /*LANG*/'Show Menu Auto Snooze': {
        value : !!settings.showAutoSnooze,
        onchange : v => { settings.showAutoSnooze=v; save();}
      },
      /*LANG*/'Show Menu Confirm': {
        value : !!settings.showConfirm,
        onchange : v => { settings.showConfirm=v; save();}
      },
      /*LANG*/'Show Menu Hidden': {
        value : !!settings.showHidden,
        onchange : v => { settings.showHidden=v; save();}
      },
      /*LANG*/'Show Menu Group': {
        value : !!settings.showGroup,
        onchange : v => { settings.showGroup=v; save();}
      },
      /*LANG*/'Show Text Overflow': {
        value : !!settings.showOverflow,
        onchange : v => { settings.showOverflow=v; save();}
      },
  };

  E.showMenu(appMenu);
})
