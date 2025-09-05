// src/repository/service-detail.repository.js
import ServiceDetail from "../model/service-detail.model.js";

const create = (data) => ServiceDetail.create(data);

const find = (query = {}, skip = 0, limit = 20) =>
  ServiceDetail.find(query)
    // .populate("serviceOrder sparepart serviceItem")
    .populate([
      {
        path: "serviceOrder",
        populate: [
          {
            path: "technician",
          },
        ],
      },
      {
        path: "sparepart",
      },
      {
        path: "serviceItem",
      },
    ])
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

const findOne = (filter) =>
  ServiceDetail.findOne(filter).populate("serviceOrder");

const count = (query = {}) => ServiceDetail.countDocuments(query);

const findById = (id) => ServiceDetail.findById(id);

const update = (id, data) =>
  ServiceDetail.findByIdAndUpdate(id, data, { new: true }).populate(
    "serviceOrder"
  );

const remove = (id) => ServiceDetail.findByIdAndDelete(id);

export default {
  create,
  find,
  findOne,
  count,
  findById,
  update,
  remove,
};
