if (HASSIO === undefined) {
  loadHassio();
}

function noHassio() {
  let Layout = require('Layout');
  let layout = new Layout( {
    type:"v", c: [
      {
        type: "txt",
        font: "10%",
        label: "No settings",
      },
    ],
    halign: -1
  });
  g.clear();
  layout.render();
}

const templateGui = () => {
  if (HASSIO === undefined) {
    noHassio();
    return;
  }

  let selectedTemplate = 0;

  let Layout = require('Layout');
  let layout = new Layout( {
    type:"v", c: [
      {
        type: "txt",
        font: "8%",
        id: "name",
        label: HASSIO.templates[selectedTemplate].name,
      },
      {
        type: 'txt',
        font:"10%",
        id: "data",
        label: "data",
        wrap: true,
        width: g.getWidth(),
        height: g.getHeight()-80,
        halign: -1
      },
      {
        type: "txt",
        font: "8%",
        id: "loc",
        label: (selectedTemplate+1) + "/" + HASSIO.templates.length,
      }
    ],
    halign: -1
  });

  const fetchTemplate = (template) => {
    const url = `${HASSIO.host}/api/template`;
    return Bangle.http(url, {
        method: "POST",
        timeout: 2000,
        body: JSON.stringify({template: template}),
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${HASSIO.api_key}`,
        }
    });
  };

  const draw = (selected) => {
    setTimeout(() => {
      if (selected != selectedTemplate)
        return;

      fetchTemplate(HASSIO.templates[selectedTemplate].temp).then((data) => {
        if (selected != selectedTemplate)
          return;

        layout.data.label = data.resp;
        layout.clear(layout.data);
        layout.render();
      }, (data) => {
        if (selected != selectedTemplate)
          return;

        layout.data.label = "failed " + JSON.stringify(data);
        layout.clear(layout.data);
        layout.render();
      });
    }, 1000);
  };

  Bangle.on('touch', function(button, xy) {
    if (xy.type === 0) {
      selectedTemplate++;
      if (selectedTemplate >= HASSIO.templates.length)
        selectedTemplate = 0;
      layout.loc.label = (selectedTemplate+1) + "/" + HASSIO.templates.length;
      layout.name.label = HASSIO.templates[selectedTemplate].name
    }

    layout.data.label = "loading";
    g.clear();
    layout.render();
    draw(selectedTemplate)
  });


  g.clear();
  layout.data.label = "loading";
  layout.render();
  draw(selectedTemplate);
};

templateGui();