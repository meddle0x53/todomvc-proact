(function( window ) {
	'use strict';

  window.app = window.app || {};

  app.Task = ProAct.Model.extend({
    done: false,
    description: ''
  });

  app.View = ProAct.View.extend({
    el: 'li',
    id: 'test'
  });

  app.model = app.Task.create({
    done: false,
    description: 'Feed Dally with 60ml milk.'
  });

  app.view = new app.View();
  app.view.render(app.model);


})( window );
