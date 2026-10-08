window.WusoolApi = {
  request: (path, options) => WusoolServices.request(path, options),
  get: path => WusoolServices.request(path),
  post: (path, body) => WusoolServices.request(path, {
    method: "POST",
    body
  }),
  put: (path, body) => WusoolServices.request(path, {
    method: "PUT",
    body
  }),
  delete: path => WusoolServices.request(path, {
    method: "DELETE"
  })
};
