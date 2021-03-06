const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");

const Schema = mongoose.Schema;

const AppealModel = new Schema(
  {
    act: { type: String, required: true },
    region: { type: [String], required: true },
    pin: { type: String, required: true },
    services: {
      type: [
        {
          id: { type: String, required: true },
          values: {
            type: [
              {
                id: { type: String, required: true },
                attributes: { type: Object, required: false, default: {} },
              },
            ],
            required: false,
            default: [],
          },
        },
      ],
      required: true,
    },
    desc: { type: String, required: false },
    tags: { type: [String], required: false },
    status: { type: String, required: true, default: "open" },
  },
  { timestamps: true }
);

AppealModel.plugin(mongoosePaginate);

module.exports = mongoose.model("Appeal", AppealModel);
