+ function(){
    if(typeof vis !== 'undefined'){
        var formats = {
            minorLabels: {
              millisecond:'SSS',
              second:     's',
              minute:     'HH:mm',
              hour:       'HH:mm',
              weekday:    'ddd jD',
              day:        'jD',
              week:       'jw',
              month:      'jMMM',
              year:       'jYYYY'
            },
            majorLabels: {
              millisecond:'HH:mm:ss',
              second:     'jD jMMMM HH:mm',
              minute:     'ddd jD jMMMM',
              hour:       'ddd jD jMMMM',
              weekday:    'jMMMM jYYYY',
              day:        'jMMMM jYYYY',
              week:       'jMMMM jYYYY',
              month:      'jYYYY',
              year:       ''
            }
          }
        vis.timeline.TimeStep.FORMAT = {
            minorLabels: function (date, scale, step){
                return moment(date).format(formats.minorLabels[scale]);
            },
            majorLabels: function (date, scale, step){
                return moment(date).format(formats.majorLabels[scale]);
            }
        }
    }
}()