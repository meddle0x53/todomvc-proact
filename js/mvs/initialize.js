(function( window, ProAct ) {
  'use strict';

  ProAct.flow = new ProAct.Flow(['proq', 'model', 'view'], {
    err: function (e) {
      if (P.flow.errStream) {
        P.flow.errStream().triggerErr(e);
      } else {
        console.log(e);
      }
    },
    flowInstance: {
      queue: {
        err: function (queue, e) {
          if (P.flow.errStream) {
            P.flow.errStream().triggerErr(e);
          } else {
            console.log(e);
          }
        }
      }
    }
  });

});

