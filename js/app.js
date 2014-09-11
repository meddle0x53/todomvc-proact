(function(window, ProAct) {
	'use strict';
  // TODO There should be applicatio class - setting up the routing, fixing types, etc.

  window.app = window.app || {};

  window.app.Task = ProAct.Model.extend({
    done: false,
    description: ''
  });
  window.app.Task['type'] = 'Task';

  var template = '<li id="test">' +
                  '<div class="view">' +
                    '<input class="toggle" type="checkbox" pro-bind="done">' +
                    '<label class="description" pro-bind="description">Rule the web</label>' +
                    '<button class="destroy"></button>' +
                  '</div>' +
                  '<input class="edit" value="Rule the web" pro-bind="one-way:description">' +
                '</li>';

  window.app.TaskView = ProAct.View.extend({
    template: template,
    lambdas: {
      editing: function () {
        return 'editing';
      },
      isEditing: function (e) {
        if (e.proView) {
          return e.proView.classes._array.indexOf('editing') !== -1;
        }
        return e.target._array.indexOf('editing') !== -1;
      },
      isNotEditing: function (e) {
        return e.target._array.indexOf('editing') === -1;
      },
      complete: function (val) {
        if (val) {
          return 'completed';
        }

        return ProAct.Event.simple('array', 'del', 'completed');
      },
      enter: function (event) {
        return event.keyCode === 13;
      },
      esc: function (event) {
        return event.keyCode === 27;
      },
      val: function (event) {
        return $(event.target).prop('value');
      },
      focus: function () {
        this.$el.find('input.edit').focus();
      },
      restore: function () {
        this.$el.find('input.edit').val(this.description);
      }
    },
    streams: {
      'label.description': {
        dblclick: ['map(l:editing)', 'classes']
      },
      'input.edit': {
        keydown: [
          ['filter(l:enter)|map(l:val)', 'description'],
          ['filter(l:enter)|map(pop)', 'classes'],
          ['filter(l:esc)|map(pop)', 'classes'],
          ['filter(l:enter)', 'model.doSave']
        ],
        blur: ['filter(l:isEditing)|map(pop)', 'classes']
      },
      'button.destroy': {
        click: ['map(true)', 'model.shouldDestroy']
      }
    },
    pipes: [
      ['done', 'map(eventToVal)|map(l:complete)', 'classes'],
      ['done', '', 'model.doSave'],
      ['classes', 'filter(l:isEditing)', 'l:focus'],
      ['classes', 'filter(l:isNotEditing)', 'l:restore'],
    ]
  });

  window.app.NewTaskView = ProAct.NewView.extend({
    el: 'header',
    id: 'header',
    lambdas: {
      enter: function (event) {
        return event.keyCode === 13;
      },
    },
    streams: {
      'input#new-todo': {
        keydown: [
          ['filter(l:enter)|map(true)', 'shouldCreate'],
        ]
      },
    },
    pipes: [
    ]
  });

  window.app.TaskViews = ProAct.Views.extend({
    el: 'section',
    id: 'todoapp',
    itemsEl: 'ul',
    itemsId: 'todo-list',
    childType: app.TaskView,
    doneAll: function () {
      return this.models.every(this.regRead('l:done'));
    },
    completedItems: function () {
      return this.models.filter(function (item) {
        return item.done;
      });
    },
    leftItems: function () {
      return this.models.filter(function (item) {
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
        if (e.target.length === 0) {
          return 'hidden';
        }

        return ProAct.Event.simple('array', 'del', 'hidden');
      },
      itemsCountToClass: function (e) {
        if (e.target.length === 0) {
          return 'hidden';
        }

        return ProAct.Event.simple('array', 'del', 'hidden');
      },
      done: function (model) {
        return model.done;
      },
      active: function (model) {
        return !model.done;
      },
      doneFilter: function (e) {
        if (e.args[2] === 'l:done') {
          return 'selected';
        }
        return ProAct.Event.simple('array', 'del', 'selected');
      },
      activeFilter: function (e) {
        if (e.args[2] === 'l:active') {
          return 'selected';
        }
        return ProAct.Event.simple('array', 'del', 'selected');
      },
      allFilter: function (e) {
        if (e.args[2] === 'l:truth') {
          return 'selected';
        }
        return ProAct.Event.simple('array', 'del', 'selected');
      },
      toggleAllValue: function (e) {
        return $(e.target).prop('checked');
      }
    },
    streams: {
      'button#clear-completed': {
        click: [
          ['map(true)', 'models.[l:done].shouldDestroy']
        ]
      },
      'input#toggle-all': {
        change: [
          ['map(l:toggleAllValue)', 'models.[l:truth].done']
        ]
      }
    },
    pipes: [
      ['completedItems', 'map(l:completedCountToClass)', 'btnCompletedClasses'],
      ['models', 'map(l:itemsCountToClass)', 'footerClass'],
      ['filter', 'map(l:doneFilter)', 'completedSelected'],
      ['filter', 'map(l:activeFilter)', 'activeSelected'],
      ['filter', 'map(l:allFilter)', 'allSelected']
    ]
  });

  window.app.storage = new ProAct.LocalStorage();

  window.app.getTaskListView = function (filter) {
    if (!window.app.views) {
      window.app.views = new window.app.TaskViews();
      window.app.models = ProAct.Models.create(window.app.Task, window.app.storage);
      window.app.views.render(window.app.models);

      window.app.newView = new window.app.NewTaskView();
      window.app.newView.render(window.app.Task.create({
        done: false,
        description: ''
      }, window.app.storage));
    }

    if (filter) {
      if (P.U.isFunction(filter)) {
        window.app.views.items.core.filteringListener(filter);
      } else {
        window.app.views.filter = filter;
      }
    }

    return window.app.views;
  };


  window.app.router = new ProAct.Router();
  window.app.router
    .route(function () {
      window.app.getTaskListView('l:truth');
    })
    .route(/completed/, function () {
      window.app.getTaskListView('l:done');
    })
    .route(/active/, function () {
      window.app.getTaskListView('l:active');
    }).start();

})(window, ProAct);
