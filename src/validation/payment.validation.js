import Joi from "joi";

export const addPaymentSchema = Joi.object({
  paymentMethod: Joi.string().valid("cash", "transfer").required(),
  // amount: Joi.number().min(1).required(),
  paymentProof: Joi.string().uri().when("paymentMethod", {
    is: "transfer",
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
});
export const addPaymentDPSchema = Joi.object({
  amount: Joi.number().positive().required(),
  method: Joi.string().valid("CASH", "TRANSFER").required(),
});
export const addPaymentFinalSchema = Joi.object({
  method: Joi.string().valid("CASH", "TRANSFER").required(),
});
export const updatePaymentSchema = Joi.object({
  amount: Joi.number().positive(),
  payment_type: Joi.string().valid("DP", "FULL"),
  method: Joi.string().valid("CASH", "TRANSFER"),
  proof_url: Joi.string().uri().when("method", {
    is: "TRANSFER",
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  status: Joi.string().valid("PENDING", "PAID", "FAILED"),
});
