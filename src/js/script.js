const debug = true;

var app = angular.module('myApp', []);
app.controller('myCtrl', function ($scope) {
  /**
   * OnInit
  **/
  this.$onInit = function () {
    // En Document Ready.. load FanOut:
    $scope.onDocReady();

    // Cargamos el JSON de S3 con el dato a editar
    $scope.bucket = 'concurrency';
    $scope.keyFile = 'src/data/data.json';
    var fileParams = {Bucket: $scope.bucket, Key: $scope.keyFile};
    s3 = new AWS.S3();
    s3.getObject(fileParams, function (errGetObject, fileData) {
      if (errGetObject) {
        if (debug) console.log('El fichero ' + $scope.keyFile + ' NO existe en el bucket o no tiene permisos.');
        if (debug) console.log(errGetObject);
        // expiredToken();
      } else {
        var data = fileData.Body.toString('utf-8');
        $scope.data = data;
        $scope.$apply();
      }
    });
  }

  $scope.base64urlEscape = function (str) {
      return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  };

  $scope.jwt_encode = function (payload, key) {
      var header = { typ: 'JWT', alg: 'HS256' };
      var segments = [];
      segments.push($scope.base64urlEscape(btoa(JSON.stringify(header))));
      segments.push($scope.base64urlEscape(btoa(JSON.stringify(payload))));
      var hash = CryptoJS.HmacSHA256(segments.join('.'), key);
      segments.push($scope.base64urlEscape(hash.toString(CryptoJS.enc.Base64)));
      return segments.join('.');
  };

  /** On Document Ready (jQuery) **/
  $scope.onDocReady = function () {

    // Alias de: $(document).ready( function() {
    $(function () {
      if(!('EventSource' in window)) {
          $('#test-header').text('Error: Realm domain is still setting up. This can happen if your realm or account was very recently created. Try again in a minute or so.');
          return;
      }

      var connected = false;
      var openedOnce = false;
      var isNavigating = false;
      var sending = false;

      $(window).on('beforeunload', function () {
          isNavigating = true;
      });

      // preflight request to API
      $.get('//api.fanout.io/').done(function () {
          var es = new EventSource('//99310e5d.fanoutcdn.com/test/sse');
          es.onopen = function () {
              connected = true;
              openedOnce = true;

              $('#test-header').text('To push, write some text below and press the send button to have it pushed over the test channel:');
              $('#test-elements').css('visibility', 'visible');
              if(!sending) {
                  $('#test-send').removeAttr('disabled');
              }
          };
          es.onerror = function () {
              connected = false;

              if(isNavigating) {
                  return;
              }

              if(openedOnce) {
                  $('#test-header').text('Disconnected from SSE test endpoint. Refresh page to reconnect.');
                  $('#test-send').attr('disabled', 'true');
              } else {
                  $('#test-header').text('Failed to connect to SSE test endpoint.');
              }
          };
          es.addEventListener('message', function (event) {
              $('#output').text(event.data);
          }, false);
      }).fail(function () {
          $('#test-header').text('Failed to connect to API.');
      });

      var form = $('#test-form');
      form.find('button.btn-primary').click(function() {
          var token = $scope.jwt_encode({
              iss: '99310e5d',
              exp: Math.floor(new Date().getTime() / 1000) + 3600
          }, CryptoJS.enc.Base64.parse('PeWRmV+qhqcB5q88aHTiog=='));

          sending = true;

          var text = form.find('input[name=text]').val();
          $('#test-text').attr('disabled', 'true');
          $('#test-send').attr('disabled', 'true');
          $('#test-send').text('Sending...');
          $.ajax({
              url: '//api.fanout.io/realm/99310e5d/publish/',
              type: 'POST',
              headers: {
                  'Authorization': 'Bearer ' + token
              },
              data: JSON.stringify({
                  'items': [
                      {
                          'channel': 'test',
                          'formats': {
                              'http-stream': {
                                  'content': 'event: message\ndata: ' + text + '\n\n'
                              }
                          }
                      }
                  ]
              }),
              contentType: 'application/json',
              error: function (xhr, textStatus, errorThrown) {
                  alert('Error publishing to Fanout Cloud API. Status=' + xhr.status);
              },
              complete: function () {
                  sending = false;

                  $('#test-text').removeAttr('disabled');
                  $('#test-send').text('Send');
                  if(connected) {
                      $('#test-send').removeAttr('disabled');
                  }
                  $('#test-text').focus();
              },
          });
          return false;
      });
    });
  };

});
