const Volunteer = require("../models/VolunteerModel");

const { body, validationResult } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");

var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

const {
  parseFormData,
  parseQueryData,
  buildQuery,
  VolunteerData,
  formatStatusData
} = require("./utils");

// handle generic errors
const valErrorHandler = (res, errors) =>
  apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());

// create a new volunteer record
exports.VolunteerStore = [
  //auth,
  body("mobile", "Mobile must not be empty.")
    .isLength({ min: 1 })
    .trim()
    .custom((value, { req }) => {
      return Volunteer.findOne({ mobile: value }).then((record) => {
        if (record) {
          return Promise.reject("This mobile number is already registered.");
        }
      });
    }),
  body("name", "Name must not be empty.")
    .isLength({ min: 1 })
    .trim(),
  //sanitizeBody("*").escape(),
  (req, res) => {
    console.log("Volunteer Signup", req.body);
    try {
      const errors = validationResult(req);
      console.log("errors", errors);

      const parsedData = parseFormData(req.body);
      let volObj = new Volunteer(parsedData);
      console.log("volunteer", volObj);

      if (!errors.isEmpty()) {
        return valErrorHandler(res, errors);
      } else {
        //Save feature
        volObj.save(function(err) {
          if (err) {
            return apiResponse.ErrorResponse(res, err);
          }
          let resData = new VolunteerData(volObj);
          return apiResponse.successResponseWithData(
            res,
            "Volunteer added Successfully.",
            resData
          );
        });
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  }
];

exports.search = [
  auth,
  function(req, res) {
    try {
      const parsedData = parseQueryData(req.body);
      const query = buildQuery(parsedData);

      console.log("query", query);
      console.log("user info", req.user);

      Volunteer.find(query, { _id: 0 })
        //.sort({ updatedAt: -1 })
        .then((records) => {
          if (records.length > 0) {
            return apiResponse.successResponseWithData(
              res,
              "Operation success",
              records
            );
          } else {
            return apiResponse.successResponseWithData(
              res,
              "Operation success",
              []
            );
          }
        });
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  }
];

exports.status = [
  function(req, res) {
    try {
      const query = [{ $group: { _id: "$mode", nov: { $sum: 1 } } }];

      Volunteer.aggregate(query).then((records) => {
        if (records.length > 0) {
          return apiResponse.successResponseWithData(
            res,
            "Operation success",
            formatStatusData(records)
          );
        } else {
          return apiResponse.successResponseWithData(
            res,
            "Operation success",
            []
          );
        }
      });
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  }
];
