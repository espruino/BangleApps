exports = {
  color_options: ['Cyan', 'Green', 'Orange', 'Purple', 'Lavender', 'Red', 'Blue', 'Blk/Wht'],
  fg_code: ['#0ff', '#0f0', '#ff0', '#80f', '#f0f', '#f00', '#00f', null],
  gy_code: ['#022', '#020', '#220', '#202', '#202', '#200', '#002', null],
  fg_code_font: [null, null].concat(color_options),
  getDefaultSettings: function () {
    return {
      fruitful: [
        {
          color: 'Green',
          fg: '#0f0',
          gy: '#020',
          title: 'Work',
          target_min: 480,
        },
        {
          color: 'Blue',
          fg: '#00f',
          gy: '#002',
          title: 'Relationships',
          target_min: 45,
        },
      ],
      hour_color: 'Purple',
      hour_fg: '#80f',
      fallow_denominator: '3',
    }
  }
}
