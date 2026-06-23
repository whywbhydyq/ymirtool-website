'use strict';

module.exports = function goneHandler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET, HEAD');
    res.setHeader('Content-Type', 'text/plain; charset=UTF-8');
    res.end('Method Not Allowed');
    return;
  }

  res.statusCode = 410;
  res.setHeader('Content-Type', 'text/plain; charset=UTF-8');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  res.end('Gone');
};
