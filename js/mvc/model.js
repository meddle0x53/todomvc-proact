(function( window, ProAct ) {
	'use strict';

  ProAct.Model = ProAct.Model || {};

  ProAct.Model.create = function (data) {
    var instance = ProAct.prob(data);

    return instance;
  };

  ProAct.Model.extend = function (data) {
    return {
      create: function (initData) {
        var actualData = ProAct.Utils.ex(ProAct.Utils.ex({}, data), initData);

        return ProAct.Model.create(actualData);
      },
      extend: function (extendData) {
        var actualData = ProAct.Utils.ex(ProAct.Utils.ex({}, data), extendData);

        return ProAct.Model.extend(actualData);
      }
    };
  };

})( window, ProAct );

