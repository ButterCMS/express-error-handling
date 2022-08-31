const { default: axios } = require("axios");

module.exports = async ({ uri, method = "get", data }) => {
  method = ["get", "post", "put", "patch", "delete"].includes(method.toLocaleLowerCase()) ? method : "get";
  const response = await axios({
    url: "https://api.buttercms.com/v2/posts" + (uri || ""),
    method: method,
    data: data,
    headers: {
      Authorization: "Token " + process.env.BUTTER_CMS_API_TOKEN,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};
