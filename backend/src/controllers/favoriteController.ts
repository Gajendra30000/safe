import { Request, Response } from "express";
import FavoriteContact from "../models/FavoriteContact";

export async function listFavorites(req: Request & any, res: Response) {
  try {
    const contacts = await FavoriteContact.find({ user: req.userId });
    res.json(contacts);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

export async function addFavorite(req: Request & any, res: Response) {
  try {
    const { name, phone, email, relationship } = req.body;

    const contact = await FavoriteContact.create({
      user: req.userId,
      name,
      phone,
      email,
      relationship
    });

    res.status(201).json(contact);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateFavorite(req: Request & any, res: Response) {
  try {
    const { id } = req.params;
    const { name, phone, email, relationship } = req.body;

    const contact = await FavoriteContact.findOne({ _id: id, user: req.userId });
    if (!contact) return res.status(404).json({ message: "Contact not found" });

    if (name) contact.name = name;
    if (phone) contact.phone = phone;
    if (email) contact.email = email;
    if (relationship) contact.relationship = relationship;

    await contact.save();
    res.json(contact);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

export async function deleteFavorite(req: Request & any, res: Response) {
  try {
    const { id } = req.params;

    const contact = await FavoriteContact.findOneAndDelete({ _id: id, user: req.userId });
    if (!contact) return res.status(404).json({ message: "Contact not found" });

    res.json({ message: "Contact deleted" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}
