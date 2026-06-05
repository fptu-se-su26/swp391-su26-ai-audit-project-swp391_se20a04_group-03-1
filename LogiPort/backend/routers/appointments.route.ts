import { Router } from "express";
import * as appointmentController from "../controllers/appointment.controller";
import * as appointmentValidator from "../validators/appointment.validator";

const router = Router();

router.post(
  "/create",
  appointmentValidator.appointmentPost,
  appointmentController.createAppointmentPost,
);

router.get("/", appointmentController.appointmentsGet);

router.get("/detail/:id", appointmentController.appointmentDetailGet);

router.patch(
  "/edit",
  appointmentValidator.appointmentEdit,
  appointmentController.appointmentEditPatch,
);

router.patch("/status/:id", appointmentController.appointmentStatusPatch);

router.patch("/delete/:id", appointmentController.appointmentDeletePatch);

router.get("/trash", appointmentController.appointmentsTrashGet);

router.patch("/restore/:id", appointmentController.appointmentRestorePatch);

router.delete("/hard-delete/:id", appointmentController.appointmentHardDelete);

export default router;
