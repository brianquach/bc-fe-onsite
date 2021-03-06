var projectModel = (function() {
  'use strict';

  var url = '/api/projects';

  function create(name) {
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

var fileModel = (function() {
  'use strict';

  var baseUrl = '/api/files';

  function get(projectId) {
    var url = `${baseUrl}?projectId=${projectId}`;
    return $.ajax({
      url: url,
      contentType: 'application/json; charset=utf-8',
      dataType: 'json'
    });
  }

  function create(projectId, file, parentId) {
    parentId = parentId || projectId;

    var data = new FormData();
    data.append('file', file);
    data.append('filename', file.name);
    data.append('size', file.size);

    var url = `${baseUrl}?projectId=${projectId}&parentId=${parentId}`;
    return $.ajax({
      url: url,
      method: 'POST',
      data: data,
      processData: false,
      contentType: false
    });
  }

  return {
    get: get,
    create: create
  }
})();

var folderModel = (function() {
  'use strict';

  var baseUrl = '/api/folders';

  function create(projectId, name, parentId) {
    parentId = parentId || projectId;

    if (name.trim() === '') {
      throw new Error('Name required');
    }

    var url = `${baseUrl}?projectId=${projectId}&parentId=${parentId}`;
    return $.ajax({
      url: url,
      method: 'POST',
      data: JSON.stringify({
        name: name
      }),
      processData: false,
      contentType: 'application/json; charset=utf-8'
    });
  }

  return {
    create: create
  }
})();

var project = (function() {
  'use strict';

  var $projectCreate;
  var $projectName;
  var $projectList;
  var $projectAdminView;
  var $projectFileView;

  function init() {
    $projectCreate = $('#projectCreate');
    $projectName = $('#projectName');
    $projectList = $('#projectList');
    $projectAdminView = $('#projectAdminView');
    $projectFileView = $('#projectFileView');

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

    // Switch to project file view
    $projectList.on('click', 'a', function(event) {
      var projectData = $(event.target).data();
      $projectAdminView.addClass('hide');
      $projectFileView.addClass('show');
      projectView.initFileView(projectData);
    });
  }

  function renderItem(project) {
    var $li = $('<li>');
    var $a = $('<a href="javascript:void(0)">');
    $a.text(project.name);
    $a.data('name', project.name);
    $a.data('id', project._id);
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

var projectView = (function() {
  'use strict';

  var $form;
  var $backBtn;
  var $projectAdminView;
  var $projectFileView;
  var $projectName;
  var $fileUpload;
  var $newFolderBtn;
  var $folderName;
  var $directory;

  function init() {
    $projectAdminView = $('#projectAdminView');
    $projectFileView = $('#projectFileView');
    $projectName = $('#projectFileViewName');
    $backBtn = $('#backBtn');
    $form = $('#form');
    $newFolderBtn = $('#newFolderBtn');
    $fileUpload = $('#fileUpload');
    $directory = $('#directory');
    $folderName = $('#folderName');

    $backBtn.on('click', function() {
      $projectAdminView.removeClass('hide');
      $projectFileView.removeClass('show');

      $directory.html('');
      $fileUpload.val('');
      $folderName.val('');
    });

    $form.on('submit', function(event) {
      var projectId = $form.data('projectId');
      var files = $fileUpload[0].files;
      fileModel.create(projectId, files[0])
        .done(function(file) {
          renderFileItem($directory, file);
          $fileUpload.val('');
        });

      return false;
    });

    $newFolderBtn.on('click', function(event) {
      var projectId = $form.data('projectId');
      var name = $folderName.val();
      folderModel.create(projectId, name)
        .done(function(folder) {
          renderFileItem($directory, folder);
        });
    });
  }

  function initFileView(project) {
    $form.data('projectId', project.id);
    $projectName.text(project.name);
    fileModel.get(project.id)
      .done(function(files) {
        renderDirectory($directory, files);
      });
  }

  function renderDirectory($parentFolder, files) {
    files.forEach(function(file) {
      renderFileItem($parentFolder, file);
    });
  }

  function renderFileItem($parentFolder, file) {
    var $li = $('<li>');
    var $a = $('<a href="javascript:void(0)">')
    var info = [`Name: ${file.name}`];
    if (file.size) {
      info.push(`Size: ${file.size}`);
    }
    info = info.join(' ');
    $a.text(info)
    $li.append($a);
    $li.addClass(file.type.toLowerCase());
    $parentFolder.append($li);
  }

  return {
    init: init,
    initFileView: initFileView
  };
})();

$(document).ready(function() {
  project.init();
  projectView.init();
});
