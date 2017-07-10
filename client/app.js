var projectModel = (function() {
  'use strict';

  function create(name) {
    var url = '/api/projects';
    return $.ajax({
      url: url,
      method: 'POST',
      data: JSON.stringify({
        name: name
      }),
      contentType: 'application/json; charset=utf-8',
      processData: false
    });
  }

  function get() {
    var url = '/api/projects';
    return $.ajax({
      url: url,
      dataType: 'json'
    });
  }

  return {
    get: get,
    create: create
  };
})();

var project = (function() {
  'use strict';

  var $projectCreate;
  var $projectName;
  var $projectList;

  function init() {
    $projectCreate = $('#projectCreate');
    $projectName = $('#projectName');
    $projectList = $('#projectList');

    projectModel.get()
      .done(function(projects) {
        renderList(projects);
      });

    $projectCreate.on('click', function() {
      var name = $projectName.val();
      projectModel.create(name)
        .done(function(project) {
          $projectList.append(renderItem(project));
        });
    });
  }

  function renderItem(project) {
    var $li = $('<li>');
    var $a = $('<a href="javascript:void(0)">');
    $a.text(project.name);
    $li.append($a);
    return $li;
  }

  function renderList(projects) {
    projects.forEach(function(project) {
      $projectList.append(renderItem(project));
    });
  }

  return {
    init: init
  };
})();

$(document).ready(function() {
  project.init();
});
