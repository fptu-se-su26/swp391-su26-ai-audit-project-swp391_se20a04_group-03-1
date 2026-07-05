import { Router } from "express";
import * as appointmentController from "../controllers/appointment.controller";
import * as appointmentValidator from "../validators/appointment.validator";
import { requirePermission } from "../middlewares/rbac.middleware";

const router = Router();

const P = (action: string) => requirePermission("appointments", action);

router.post(
  "/create",
  P("create"),
  appointmentValidator.appointmentPost,
  appointmentController.createAppointmentPost,
);

router.get("/", P("view"), appointmentController.appointmentsGet);

router.get("/detail/:id", P("view"), appointmentController.appointmentDetailGet);

router.patch(
  "/edit",
  P("update"),
  appointmentValidator.appointmentEdit,
  appointmentController.appointmentEditPatch,
);

router.patch("/status/:id", P("update"), appointmentController.appointmentStatusPatch);

router.patch("/delete/:id", P("delete"), appointmentController.appointmentDeletePatch);

router.get("/trash", P("view"), appointmentController.appointmentsTrashGet);

router.patch("/restore/:id", P("delete"), appointmentController.appointmentRestorePatch);

router.delete("/hard-delete/:id", P("delete"), appointmentController.appointmentHardDelete);

export default router;
