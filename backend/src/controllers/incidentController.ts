import { Request, Response } from 'express';
import Incident from '../models/Incident';
import { AuthRequest } from '../types/types';

// Create a new incident report
export const createIncident = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      category,
      severity,
      location,
      isAnonymous,
      reporterName,
      dateOfIncident,
      photos,
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !severity || !location || !dateOfIncident) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const incidentData: any = {
      title,
      description,
      category,
      severity,
      location,
      dateOfIncident,
      isAnonymous: isAnonymous || false,
      photos: photos || [],
    };

    // If anonymous, don't link to user
    if (isAnonymous) {
      incidentData.reporterName = reporterName || 'Anonymous';
    } else {
      incidentData.reportedBy = req.user?.userId;
      incidentData.reporterName = reporterName || req.user?.name;
    }

    const incident = new Incident(incidentData);
    await incident.save();

    res.status(201).json({
      message: 'Incident reported successfully',
      incident,
    });
  } catch (error: any) {
    console.error('Error creating incident:', error);
    res.status(500).json({ message: 'Error creating incident', error: error.message });
  }
};

// Get all incidents with filters
export const getIncidents = async (req: Request, res: Response) => {
  try {
    const {
      category,
      severity,
      latitude,
      longitude,
      radius, // in kilometers
      limit = 50,
      skip = 0,
    } = req.query;

    const filter: any = {};

    if (category) filter.category = category;
    if (severity) filter.severity = severity;

    // Geospatial query if location provided
    if (latitude && longitude) {
      const radiusInMeters = radius ? parseFloat(radius as string) * 1000 : 5000; // default 5km
      filter.location = {
        $geoWithin: {
          $centerSphere: [
            [parseFloat(longitude as string), parseFloat(latitude as string)],
            radiusInMeters / 6378100, // Convert to radians (Earth radius in meters)
          ],
        },
      };
    }

    const incidents = await Incident.find(filter)
      .populate('reportedBy', 'name email')
      .populate('comments.user', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string))
      .skip(parseInt(skip as string));

    // Hide sensitive info for anonymous reports
    const sanitizedIncidents = incidents.map((incident) => {
      const incidentObj = incident.toObject();
      if (incidentObj.isAnonymous) {
        delete incidentObj.reportedBy;
      }
      // Sanitize comments
      if (incidentObj.comments) {
        incidentObj.comments = incidentObj.comments.map((comment: any) => {
          if (comment.isAnonymous) {
            delete comment.user;
          }
          return comment;
        });
      }
      return incidentObj;
    });

    res.json({
      incidents: sanitizedIncidents,
      total: await Incident.countDocuments(filter),
    });
  } catch (error: any) {
    console.error('Error fetching incidents:', error);
    res.status(500).json({ message: 'Error fetching incidents', error: error.message });
  }
};

// Get single incident by ID
export const getIncidentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const incident = await Incident.findById(id)
      .populate('reportedBy', 'name email')
      .populate('comments.user', 'name');

    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    const incidentObj = incident.toObject();
    if (incidentObj.isAnonymous) {
      delete incidentObj.reportedBy;
    }
    // Sanitize comments
    if (incidentObj.comments) {
      incidentObj.comments = incidentObj.comments.map((comment: any) => {
        if (comment.isAnonymous) {
          delete comment.user;
        }
        return comment;
      });
    }

    res.json(incidentObj);
  } catch (error: any) {
    console.error('Error fetching incident:', error);
    res.status(500).json({ message: 'Error fetching incident', error: error.message });
  }
};

// Add comment to incident
export const addComment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { comment, isAnonymous, commentorName } = req.body;

    if (!comment) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const incident = await Incident.findById(id);
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    const newComment: any = {
      comment,
      isAnonymous: isAnonymous || false,
      createdAt: new Date(),
    };

    if (isAnonymous) {
      newComment.commentorName = commentorName || 'Anonymous';
    } else {
      newComment.user = req.user?.userId;
      newComment.commentorName = commentorName || req.user?.name;
    }

    incident.comments.push(newComment);
    await incident.save();

    res.json({
      message: 'Comment added successfully',
      incident,
    });
  } catch (error: any) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Error adding comment', error: error.message });
  }
};

// Get incidents by user
export const getUserIncidents = async (req: AuthRequest, res: Response) => {
  try {
    const incidents = await Incident.find({ reportedBy: req.user?.userId })
      .sort({ createdAt: -1 });

    res.json({ incidents });
  } catch (error: any) {
    console.error('Error fetching user incidents:', error);
    res.status(500).json({ message: 'Error fetching user incidents', error: error.message });
  }
};
