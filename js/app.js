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
      esc: function (event) {
        return event.keyCode === 27;
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
          ['filter(l:esc)|map(pop)|>>($1)', 'classes'],
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
    el: 'section',
    id: 'todoapp',
    itemsEl: 'ul',
    itemsId: 'todo-list',
    childType: app.TaskView,
    completedItems: function () {
      return this.items.filter(function (item) {
        return item.done;
      });
    },
    leftItems: function () {
      return this.items.filter(function (item) {
        return !item.done;
      });
    },
    completed: function () {
      var ln = this.completedItems.length;
      return 'Clear completed (' + ln + ')';
    },
    left: function () {
      var ln = this.leftItems.length,
          text = (ln === 1) ? ' item left' : ' items left';
      return '<strong>' + ln + '</strong>' + text;
    },
    lambdas: {
      completedCountToClass: function (e) {
        if (e.args[0].completedItems.length === 0) {
          return 'hidden';
        }

        return ProAct.Event.simple('array', 'del', 'hidden');
      }
    },
    pipes: [
      ['completedItems', 'map(l:completedCountToClass)', 'btnCompletedClasses']
    ]
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

  app.model3 = app.Task.create({
    done: false,
    description: 'Dring beer.'
  }, app.storage);

  app.model4 = app.Task.create({
    done: false,
    description: 'Fighting...'
  }, app.storage);

  app.model.save();
  app.model2.save();
  app.model3.save();
  app.model4.save();

  app.views = new app.TaskViews();
  app.models = ProAct.Models.create(app.Task, app.storage);
  app.views.render(app.models);

})( window );
