var static = require('node-static');
var url = require('url');
var qs = require('querystring');
var bencode = require('bencoding');
var fs = require('fs');
//
// Create a node-static server instance to serve the './public' folder
//
var file = new(static.Server)();

require('http').createServer(function (request, response) {

    var path = url.parse(request.url);
    if (path.pathname.slice(0,4) !== '/app') {
        console.log('serving '+request.url);
        request.addListener('end', function () {
            file.serve(request, response);
        });
    } else {
        console.log('fun stuff');
        request.setEncoding('utf8');
        request.addListener('data', function(data) {
            var data = qs.parse(data);
            var buf = new Buffer(data.pieces, 'base64');

            var torrent = {
                announce: data.announce
            };
            torrent['created by'] = 'uTorrent/3130';
            torrent['creation date'] = 1344685800;
            torrent.encoding = 'UTF-8';
            torrent.info = {
                length: parseInt(data.length),
                name: data.name
            };
            torrent.info['piece length'] = parseInt(data['piece length']);
            torrent.info.pieces = buf;    

            var torrent = bencode.encode(torrent);
            fs.writeFile('torrent.torrent', new Buffer(torrent), function(err) {
                if(err) {
                    console.log(err);
                } else {
                    console.log("The file was saved!");
                }
            });

            console.log('yay');
        });
    }
}).listen(8000);