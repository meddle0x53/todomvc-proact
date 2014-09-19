(function(window, ProAct) {
	'use strict';

  window.app = window.app || {};

  window.app.storage = new ProAct.LocalStorage();

  window.app.getTaskListView = function (filter) {
    if (!window.app.views) {
      window.app.views = new window.app.TasksView();
      window.app.models = ProAct.Models.create(window.app.Task, window.app.storage);
      window.app.views.render(window.app.models);

      window.app.newView = new window.app.NewTaskView();
      window.app.newView.render(window.app.Task.create({}, window.app.storage));
    }

    window.app.views.setFilter(filter);

    return window.app.views;
  };

  window.app.router = new ProAct.Router('/labs/architecture-examples/proact/');
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
