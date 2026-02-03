import { Request, Response } from "express";
import SOS from "../models/SOS";
import FavoriteContact from "../models/FavoriteContact";
import { sendSMSNotification } from "../services/notificationService";

export async function createSOS(req: Request & any, res: Response) {
  try {
    const { message, location, contactIds } = req.body;

    const sos = await SOS.create({
      user: req.userId,
      message: message || "Emergency SOS Alert!",
      location: {
        type: "Point",
        coordinates: location ? JSON.parse(location).coordinates : [0, 0]
      },
      contactsSentTo: contactIds ? JSON.parse(contactIds) : [],
      mediaUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
      status: "pending"
    });

    await sos.populate("user", "name email");
    await sos.populate({
      path: 'contactsSentTo',
      model: 'FavoriteContact',
      select: 'name phone email'
    });

    // Send notifications
    const googleMapsLink = `https://www.google.com/maps?q=${sos.location.coordinates[1]},${sos.location.coordinates[0]}`;
    const user: any = sos.user;

    if (sos.contactsSentTo) {
      for (const contact of sos.contactsSentTo as any[]) {
        if (contact.phone) {
          await sendSMSNotification(contact.phone, user.name, googleMapsLink);
        }
      }
      sos.status = "notified";
      await sos.save();
    }

    res.status(201).json(sos);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

export async function getSOSHistory(req: Request & any, res: Response) {
  try {
    const sosList = await SOS.find({ user: req.userId })
      .populate("user", "name email")
      .populate("contactsSentTo", "name phone email")
      .sort({ createdAt: -1 });

    res.json(sosList);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateSOSStatus(req: Request & any, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const sos = await SOS.findOne({ _id: id, user: req.userId });
    if (!sos) return res.status(404).json({ message: "SOS not found" });

    sos.status = status;
    await sos.save();

    res.json(sos);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}
