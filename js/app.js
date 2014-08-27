(function( window ) {
	'use strict';

  window.app = window.app || {};

  app.Task = ProAct.Model.extend({
    done: false,
    description: ''
  });

  var template = '<li id="test">' +
                  '<div class="view">' +
                    '<input class="toggle" type="checkbox" pro-bind="done">' +
                    '<label class="description" pro-bind="description">Rule the web</label>' +
                    '<button class="destroy"></button>' +
                  '</div>' +
                  '<input class="edit" value="Rule the web" pro-bind="one-way:description">' +
                '</li>';

  app.TaskView = ProAct.View.extend({
    $parent: $('ul#todo-list'),
    template: template,
    lambdas: {
      editing: function () {
        return 'editing';
      },
      complete: function (val) {
        if (val) {
          return 'completed';
        }

        return ProAct.Event.simple('array', 'pop');
      },
      enter: function (event) {
        return event.keyCode === 13;
      },
      val: function (event) {
        return $(event.target).prop('value');
      }
    },
    streams: {
      'label.description': {
        dblclick: ['map(l:editing)|>>($1)', 'classes']
      },
      'input.edit': {
        keydown: [
          ['filter(l:enter)|map(pop)|>>($1)', 'classes'],
          ['filter(l:enter)|map(l:val)|>>($1)', 'description']
        ]
      },
      'button.destroy': {
        click: ['map(true)|>>($1)', 'isDestroyed']
      }
    },
    pipes: [
      ['done', 'map(eventToVal)|map(l:complete)', 'classes']
    ]
  });

  app.TaskViews = ProAct.Views.extend({
    el: 'ul',
    id: 'todo-list',
    childType: app.TaskView
  });

  app.storage = new ProAct.MemStorage();

  app.model = app.Task.create({
    done: false,
    description: 'Feed Dally with 60ml milk.'
  }, app.storage);

  app.model2 = app.Task.create({
    done: true,
    description: 'Return to tanya'
  }, app.storage);

  app.model.save();
  app.model2.save();

  app.views = new app.TaskViews();
  app.views.render(ProAct.Models.create(app.Task, app.storage));


})( window );
