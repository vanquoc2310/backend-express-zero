var DataTypes = require("sequelize").DataTypes;
var _appointment = require("./appointment");
var _clinic = require("./clinic");
var _clinic_schedule = require("./clinic_schedule");
var _clinic_service = require("./clinic_service");
var _dentist_info = require("./dentist_info");
var _examination_result = require("./examination_result");
var _feedback = require("./feedback");
var _notification = require("./notification");
var _reappointment = require("./reappointment");
var _role = require("./role");
var _service = require("./service");
var _slot = require("./slot");
var _user = require("./user");

function initModels(sequelize) {
  var appointment = _appointment(sequelize, DataTypes);
  var clinic = _clinic(sequelize, DataTypes);
  var clinic_schedule = _clinic_schedule(sequelize, DataTypes);
  var clinic_service = _clinic_service(sequelize, DataTypes);
  var dentist_info = _dentist_info(sequelize, DataTypes);
  var examination_result = _examination_result(sequelize, DataTypes);
  var feedback = _feedback(sequelize, DataTypes);
  var notification = _notification(sequelize, DataTypes);
  var reappointment = _reappointment(sequelize, DataTypes);
  var role = _role(sequelize, DataTypes);
  var service = _service(sequelize, DataTypes);
  var slot = _slot(sequelize, DataTypes);
  var user = _user(sequelize, DataTypes);

  examination_result.belongsTo(appointment, { as: "appointment", foreignKey: "appointment_id"});
  appointment.hasOne(examination_result, { as: "examination_result", foreignKey: "appointment_id"});
  notification.belongsTo(appointment, { as: "appointment", foreignKey: "appointment_id"});
  appointment.hasOne(notification, { as: "notification", foreignKey: "appointment_id"});
  appointment.belongsTo(clinic, { as: "clinic", foreignKey: "clinic_id"});
  clinic.hasMany(appointment, { as: "appointments", foreignKey: "clinic_id"});
  clinic_schedule.belongsTo(clinic, { as: "clinic", foreignKey: "clinic_id"});
  clinic.hasMany(clinic_schedule, { as: "clinic_schedules", foreignKey: "clinic_id"});
  clinic_service.belongsTo(clinic, { as: "clinic", foreignKey: "clinic_id"});
  clinic.hasMany(clinic_service, { as: "clinic_services", foreignKey: "clinic_id"});
  dentist_info.belongsTo(clinic, { as: "clinic", foreignKey: "clinic_id"});
  clinic.hasMany(dentist_info, { as: "dentist_infos", foreignKey: "clinic_id"});
  reappointment.belongsTo(clinic, { as: "clinic", foreignKey: "clinic_id"});
  clinic.hasMany(reappointment, { as: "reappointments", foreignKey: "clinic_id"});
  feedback.belongsTo(examination_result, { as: "examination_result", foreignKey: "examination_result_id"});
  examination_result.hasOne(feedback, { as: "feedback", foreignKey: "examination_result_id"});
  examination_result.belongsTo(reappointment, { as: "reappointment", foreignKey: "reappointment_id"});
  reappointment.hasOne(examination_result, { as: "examination_result", foreignKey: "reappointment_id"});
  notification.belongsTo(reappointment, { as: "reappointment", foreignKey: "reappointment_id"});
  reappointment.hasOne(notification, { as: "notification", foreignKey: "reappointment_id"});
  user.belongsTo(role, { as: "role", foreignKey: "role_id"});
  role.hasMany(user, { as: "users", foreignKey: "role_id"});
  appointment.belongsTo(service, { as: "service", foreignKey: "service_id"});
  service.hasMany(appointment, { as: "appointments", foreignKey: "service_id"});
  clinic_service.belongsTo(service, { as: "service", foreignKey: "service_id"});
  service.hasMany(clinic_service, { as: "clinic_services", foreignKey: "service_id"});
  reappointment.belongsTo(service, { as: "service", foreignKey: "service_id"});
  service.hasMany(reappointment, { as: "reappointments", foreignKey: "service_id"});
  appointment.belongsTo(slot, { as: "slot", foreignKey: "slot_id"});
  slot.hasMany(appointment, { as: "appointments", foreignKey: "slot_id"});
  reappointment.belongsTo(slot, { as: "slot", foreignKey: "slot_id"});
  slot.hasMany(reappointment, { as: "reappointments", foreignKey: "slot_id"});
  appointment.belongsTo(user, { as: "customer", foreignKey: "customer_id"});
  user.hasMany(appointment, { as: "appointments", foreignKey: "customer_id"});
  appointment.belongsTo(user, { as: "dentist", foreignKey: "dentist_id"});
  user.hasMany(appointment, { as: "dentist_appointments", foreignKey: "dentist_id"});
  clinic.belongsTo(user, { as: "clinic_owner", foreignKey: "clinic_owner_id"});
  user.hasOne(clinic, { as: "clinic", foreignKey: "clinic_owner_id"});
  dentist_info.belongsTo(user, { as: "dentist", foreignKey: "dentist_id"});
  user.hasOne(dentist_info, { as: "dentist_info", foreignKey: "dentist_id"});
  examination_result.belongsTo(user, { as: "customer", foreignKey: "customer_id"});
  user.hasMany(examination_result, { as: "examination_results", foreignKey: "customer_id"});
  feedback.belongsTo(user, { as: "customer", foreignKey: "customer_id"});
  user.hasMany(feedback, { as: "feedbacks", foreignKey: "customer_id"});
  reappointment.belongsTo(user, { as: "customer", foreignKey: "customer_id"});
  user.hasMany(reappointment, { as: "reappointments", foreignKey: "customer_id"});
  reappointment.belongsTo(user, { as: "dentist", foreignKey: "dentist_id"});
  user.hasMany(reappointment, { as: "dentist_reappointments", foreignKey: "dentist_id"});
  slot.belongsTo(user, { as: "dentist", foreignKey: "dentist_id"});
  user.hasMany(slot, { as: "slots", foreignKey: "dentist_id"});

  return {
    appointment,
    clinic,
    clinic_schedule,
    clinic_service,
    dentist_info,
    examination_result,
    feedback,
    notification,
    reappointment,
    role,
    service,
    slot,
    user,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
