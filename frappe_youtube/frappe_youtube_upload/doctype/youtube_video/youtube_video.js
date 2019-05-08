// Copyright (c) 2019, Dirk van der Laarse and contributors
// For license information, please see license.txt

//JS Files required for using Google API
frappe.require("/assets/frappe_youtube/js/api.js");

frappe.ui.form.on('YouTube Video', {
   refresh: function(frm) {
     //Add HTML for embedded video
     var html_string_view = '<h5>View Video</h5><iframe width="560" height="315" src="https://www.youtube.com/embed/' + cur_frm.doc.video_url + '?cc_load_policy=1&modestbranding=1" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
     cur_frm.set_df_property('view_video', 'options', html_string_view);
     cur_frm.refresh_field('view_video');
     //Add HTML for upload file input
     var html_string_placeholder = '<input id="input_file" type="file" name="name" style="display: none;" />';
     cur_frm.set_df_property('upload_file_placeholder', 'options', html_string_placeholder);
     cur_frm.refresh_field('upload_file_placeholder');
     //Add HTML for link to editing video subtitles on YouTube website
     var html_string_sublink = '<h5><a target="_blank" href="https://studio.youtube.com/video/' + cur_frm.doc.video_url + '/translations?utm_campaign=upgrade&utm_medium=redirect&utm_source=%2Fmy_videos">Click here to edit the subtitles for this video</a></h5>';
     cur_frm.set_df_property('link_to_subtitles', 'options', html_string_sublink);
     cur_frm.refresh_field('link_to_subtitles');
 	},
  onload: function() {
    // Get Client ID from YouTube Upload Settings single doctype
    frappe.model.get_value('YouTube Upload Settings', {'name': 'YouTube Upload Settings'}, 'clientid',
      function(d) {
        clientID = d.clientid;
        if (clientID.length <= 0){
          frappe.msgprint("Error: Please check settings in YouTube Upload Settings");
          return;
        }
    });
  },
  onload_post_render: function() {
    handleClientLoad();
  },
  authorise: function() {
	    handleAuthClick(null);
	},
	select_file: function() {
	   document.getElementById('input_file').click();
	},
	upload_video: function() {
    // Get file name and show on form
    var fullPath = document.getElementById('input_file').value;
    if (fullPath) {
      var startIndex = (fullPath.indexOf('\\') >= 0 ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/'));
      var filename = fullPath.substring(startIndex);
      if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
        filename = filename.substring(1);
      }
      cur_frm.set_value('selected_file_name', filename);
    }

    // Set file and start upload
    selectedFile = document.getElementById('input_file').files[0];
    defineRequest();
	}
});

// Hide upload fields if the doc hasn't been saved yet
 cur_frm.cscript.custom_refresh = function(doc) {
   var isSavedDoc = doc.__islocal ? 0 : 1;
   cur_frm.toggle_display("upload_video_section", isSavedDoc);
 }


  /***** START BOILERPLATE CODE: Load client library, authorize user. *****/

  // Global variables for GoogleAuth object, auth status.
var GoogleAuth;
var selectedFile;
var clientID = "";

  /**
   * Load the API's client and auth2 modules.
   * Call the initClient function after the modules load.
   */
  function handleClientLoad() {
    gapi.load('client:auth2', initClient);
  }

  function initClient() {
    // Initialize the gapi.client object, which app uses to make API requests.
    // Get API key and client ID from API Console.
    // 'scope' field specifies space-delimited list of access scopes
    gapi.client.init({
        'clientId': clientID,
        'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'],
        'scope': 'https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/youtubepartner'
    }).then(function () {
      GoogleAuth = gapi.auth2.getAuthInstance();

      // Listen for sign-in state changes.
      GoogleAuth.isSignedIn.listen(updateSigninStatus);

      // Handle initial sign-in state. (Determine if user is already signed in.)
      setSigninStatus();

    });
  }

  function handleAuthClick(event) {
    // Sign user in after click on auth button.
    GoogleAuth.signIn();
  }

  function setSigninStatus() {
    var user = GoogleAuth.currentUser.get();
    var isAuthorized = user.hasGrantedScopes('https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/youtubepartner');
    // Toggle button text and displayed statement based on current auth status.
    if (isAuthorized) {
      //defineRequest();
    }
    else {
      frappe.msgprint("You need to authorize the request to proceed");
      cur_frm.toggle_display("authorise", true);
      return;
    }
  }

  function updateSigninStatus(isSignedIn) {
    setSigninStatus();
  }

  function createResource(properties) {
    var resource = {};
    var normalizedProps = properties;
    for (var p in properties) {
      var value = properties[p];
      if (p && p.substr(-2, 2) == '[]') {
        var adjustedName = p.replace('[]', '');
        if (value) {
          normalizedProps[adjustedName] = value.split(',');
        }
        delete normalizedProps[p];
      }
    }
    for (var p in normalizedProps) {
      // Leave properties that don't have values out of inserted resource.
      if (normalizedProps.hasOwnProperty(p) && normalizedProps[p]) {
        var propArray = p.split('.');
        var ref = resource;
        for (var pa = 0; pa < propArray.length; pa++) {
          var key = propArray[pa];
          if (pa == propArray.length - 1) {
            ref[key] = normalizedProps[p];
          } else {
            ref = ref[key] = ref[key] || {};
          }
        }
      };
    }
    return resource;
  }

  function removeEmptyParams(params) {
    for (var p in params) {
      if (!params[p] || params[p] == 'undefined') {
        delete params[p];
      }
    }
    return params;
  }

  function executeRequest(request) {
    request.execute(function(response) {
      console.log(response);
    });
  }

  function buildApiRequest(requestMethod, path, params, properties) {
    params = removeEmptyParams(params);
    var request;
    if (properties) {
      var resource = createResource(properties);
      request = gapi.client.request({
          'body': resource,
          'method': requestMethod,
          'path': path,
          'params': params
      });
    } else {
      request = gapi.client.request({
          'method': requestMethod,
          'path': path,
          'params': params
      });
    }
    executeRequest(request);
  }

/**
   * Retrieve the access token for the currently authorized user.
   */
  function getAccessToken(event) {
    return GoogleAuth.currentUser.get().getAuthResponse(true).access_token;
  }

  /**
   * Helper for implementing retries with backoff. Initial retry
   * delay is 1 second, increasing by 2x (+jitter) for subsequent retries
   *
   * @constructor
   */
  var RetryHandler = function() {
    this.interval = 1000; // Start at one second
    this.maxInterval = 60 * 1000; // Don't wait longer than a minute
  };

  /**
   * Invoke the function after waiting
   *
   * @param {function} fn Function to invoke
   */
  RetryHandler.prototype.retry = function(fn) {
    setTimeout(fn, this.interval);
    this.interval = this.nextInterval_();
  };

  /**
   * Reset the counter (e.g. after successful request.)
   */
  RetryHandler.prototype.reset = function() {
    this.interval = 1000;
  };

  /**
   * Calculate the next wait time.
   * @return {number} Next wait interval, in milliseconds
   *
   * @private
   */
  RetryHandler.prototype.nextInterval_ = function() {
    var interval = this.interval * 2 + this.getRandomInt_(0, 1000);
    return Math.min(interval, this.maxInterval);
  };

  /**
   * Get a random int in the range of min to max. Used to add jitter to wait times.
   *
   * @param {number} min Lower bounds
   * @param {number} max Upper bounds
   * @private
   */
  RetryHandler.prototype.getRandomInt_ = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  /**
   * Helper class for resumable uploads using XHR/CORS. Can upload any
   * Blob-like item, whether files or in-memory constructs.
   *
   * @example
   * var content = new Blob(["Hello world"], {"type": "text/plain"});
   * var uploader = new MediaUploader({
   *   file: content,
   *   token: accessToken,
   *   onComplete: function(data) { ... }
   *   onError: function(data) { ... }
   * });
   * uploader.upload();
   *
   * @constructor
   * @param {object} options Hash of options
   * @param {string} options.token Access token
   * @param {blob} options.file Blob-like item to upload
   * @param {string} [options.fileId] ID of file if replacing
   * @param {object} [options.params] Additional query parameters
   * @param {string} [options.contentType] Content-type, if overriding the
   *    type of the blob.
   * @param {object} [options.metadata] File metadata
   * @param {function} [options.onComplete] Callback for when upload is complete
   * @param {function} [options.onProgress] Callback for status of in-progress
   *    upload
   * @param {function} [options.onError] Callback if upload fails
   */
  var MediaUploader = function(options) {
    var noop = function() {};
    this.file = options.file;
    this.contentType = options.contentType || this.file.type || 'application/octet-stream';
    this.metadata = options.metadata || {
      'title': this.file.name,
      'mimeType': this.contentType
    };
    this.token = options.token;
    this.onComplete = options.onComplete || noop;
    this.onProgress = options.onProgress || noop;
    this.onError = options.onError || noop;
    this.offset = options.offset || 0;
    this.chunkSize = options.chunkSize || 0;
    this.retryHandler = new RetryHandler();

    this.url = options.url;
    if (!this.url) {
      var params = options.params || {};
      params.uploadType = 'resumable';
      this.url = this.buildUrl_(options.fileId, params, options.baseUrl);
    }
    this.httpMethod = options.fileId ? 'PUT' : 'POST';
  };

  /**
   * Initiate the upload.
   */
  MediaUploader.prototype.upload = function() {
    var self = this;
    var xhr = new XMLHttpRequest();

    xhr.open(this.httpMethod, this.url, true);
    xhr.setRequestHeader('Authorization', 'Bearer ' + this.token);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('X-Upload-Content-Length', this.file.size);
    xhr.setRequestHeader('X-Upload-Content-Type', this.contentType);

    xhr.onload = function(e) {
      if (e.target.status < 400) {
        var location = e.target.getResponseHeader('Location');
        this.url = location;
        this.sendFile_();
      } else {
        this.onUploadError_(e);
      }
    }.bind(this);
    xhr.onerror = this.onUploadError_.bind(this);
    xhr.send(JSON.stringify(this.metadata));
  };

  /**
   * Send the actual file content.
   *
   * @private
   */
  MediaUploader.prototype.sendFile_ = function() {
    var content = this.file;
    var end = this.file.size;

    if (this.offset || this.chunkSize) {
      // Only slice the file if we're either resuming or uploading in chunks
      if (this.chunkSize) {
        end = Math.min(this.offset + this.chunkSize, this.file.size);
      }
      content = content.slice(this.offset, end);
    }

    var xhr = new XMLHttpRequest();
    xhr.open('PUT', this.url, true);
    xhr.setRequestHeader('Content-Type', this.contentType);
    xhr.setRequestHeader('Content-Range', 'bytes ' + this.offset + '-' + (end - 1) + '/' + this.file.size);
    xhr.setRequestHeader('X-Upload-Content-Type', this.file.type);
    if (xhr.upload) {
      xhr.upload.addEventListener('progress', this.onProgress);
    }
    xhr.onload = this.onContentUploadSuccess_.bind(this);
    xhr.onerror = this.onContentUploadError_.bind(this);
    xhr.send(content);
  };

  /**
   * Query for the state of the file for resumption.
   *
   * @private
   */
  MediaUploader.prototype.resume_ = function() {
    var xhr = new XMLHttpRequest();
    xhr.open('PUT', this.url, true);
    xhr.setRequestHeader('Content-Range', 'bytes */' + this.file.size);
    xhr.setRequestHeader('X-Upload-Content-Type', this.file.type);
    if (xhr.upload) {
      xhr.upload.addEventListener('progress', this.onProgress);
    }
    xhr.onload = this.onContentUploadSuccess_.bind(this);
    xhr.onerror = this.onContentUploadError_.bind(this);
    xhr.send();
  };

  /**
   * Extract the last saved range if available in the request.
   *
   * @param {XMLHttpRequest} xhr Request object
   */
  MediaUploader.prototype.extractRange_ = function(xhr) {
    var range = xhr.getResponseHeader('Range');
    if (range) {
      this.offset = parseInt(range.match(/\d+/g).pop(), 10) + 1;
    }
  };

  /**
   * Handle successful responses for uploads. Depending on the context,
   * may continue with uploading the next chunk of the file or, if complete,
   * invokes the caller's callback.
   *
   * @private
   * @param {object} e XHR event
   */
  MediaUploader.prototype.onContentUploadSuccess_ = function(e) {
    if (e.target.status == 200 || e.target.status == 201) {
      this.onComplete(e.target.response);
    } else if (e.target.status == 308) {
      this.extractRange_(e.target);
      this.retryHandler.reset();
      this.sendFile_();
    }
  };

  /**
   * Handles errors for uploads. Either retries or aborts depending
   * on the error.
   *
   * @private
   * @param {object} e XHR event
   */
  MediaUploader.prototype.onContentUploadError_ = function(e) {
    if (e.target.status && e.target.status < 500) {
      this.onError(e.target.response);
    } else {
      this.retryHandler.retry(this.resume_.bind(this));
    }
  };

  /**
   * Handles errors for the initial request.
   *
   * @private
   * @param {object} e XHR event
   */
  MediaUploader.prototype.onUploadError_ = function(e) {
    this.onError(e.target.response); // TODO - Retries for initial upload
  };

  /**
   * Construct a query string from a hash/object
   *
   * @private
   * @param {object} [params] Key/value pairs for query string
   * @return {string} query string
   */
  MediaUploader.prototype.buildQuery_ = function(params) {
    params = params || {};
    return Object.keys(params).map(function(key) {
      return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
    }).join('&');
  };

  /**
   * Build the upload URL
   *
   * @private
   * @param {string} [id] File ID if replacing
   * @param {object} [params] Query parameters
   * @return {string} URL
   */
  MediaUploader.prototype.buildUrl_ = function(id, params, baseUrl) {
    var url = baseUrl;
    if (id) {
      url += id;
    }
    var query = this.buildQuery_(params);
    if (query) {
      url += '?' + query;
    }
    return url;
  };
  /***** END BOILERPLATE CODE *****/


  function defineRequest() {
        var metadata = createResource({'snippet.categoryId': '22',
                 'snippet.defaultLanguage': '',
                 'snippet.description': cur_frm.doc.description,
                 'snippet.tags[]': '',
                 'snippet.title': cur_frm.doc.title,
                 'status.embeddable': '',
                 'status.license': '',
                 'status.privacyStatus': 'unlisted',
                 'status.publicStatsViewable': ''
      });
    var token = getAccessToken();
    if (!token) {
      // alert("You need to authorize the request to proceed.");
      frappe.msgprint("You need to authorize the request to proceed");
      cur_frm.toggle_display("authorise", true);
      return;
    }

    if (!selectedFile) {
      // alert("You need to select a file to proceed.");
      frappe.msgprint("You need to select a file to proceed");
      return;
    }
    var params = {'part': 'snippet,status'};

    var uploader = new MediaUploader({
        baseUrl: 'https://www.googleapis.com/upload/youtube/v3/videos',
        file: selectedFile,
        token: token,
        metadata: metadata,
        params: params,
        onError: function(data) {
          var message = data;
          try {
            var errorResponse = JSON.parse(data);
            message = errorResponse.error.message;
          } finally {
            // alert(message);
            frappe.msgprint(message);
          }
        }.bind(this),
        onProgress: function(data) {
          var currentTime = Date.now();
          console.log('Progress: ' + data.loaded + ' bytes loaded out of ' + data.total);
          var totalBytes = data.total;
        }.bind(this),
        onComplete: function(data) {
          var uploadResponse = JSON.parse(data);
          console.log('Upload complete for video ' + uploadResponse.id);
          cur_frm.set_value('video_url', uploadResponse.id);
          cur_frm.save();
          frappe.msgprint("Upload Successful. YouTube may take a minute to process the new video")
        }.bind(this)
      });

    uploader.upload();
  }
