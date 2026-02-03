import mongoose, { Document, Schema } from 'mongoose';

export interface IIncident extends Document {
  title: string;
  description: string;
  category: 'theft' | 'assault' | 'harassment' | 'accident' | 'suspicious_activity' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
    address?: string;
  };
  reportedBy?: mongoose.Types.ObjectId;
  isAnonymous: boolean;
  reporterName?: string; // For anonymous reports or override
  photos?: string[];
  dateOfIncident: Date;
  comments: {
    user?: mongoose.Types.ObjectId;
    isAnonymous: boolean;
    commentorName?: string;
    comment: string;
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const incidentSchema = new Schema<IIncident>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    category: {
      type: String,
      enum: ['theft', 'assault', 'harassment', 'accident', 'suspicious_activity', 'other'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: function (v: number[]) {
            return v.length === 2 && v[0] >= -180 && v[0] <= 180 && v[1] >= -90 && v[1] <= 90;
          },
          message: 'Invalid coordinates',
        },
      },
      address: {
        type: String,
        trim: true,
      },
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    reporterName: {
      type: String,
      trim: true,
    },
    photos: [{
      type: String,
    }],
    dateOfIncident: {
      type: Date,
      required: true,
    },
    comments: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      isAnonymous: {
        type: Boolean,
        default: false,
      },
      commentorName: {
        type: String,
      },
      comment: {
        type: String,
        required: true,
        maxlength: 500,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  {
    timestamps: true,
  }
);

// Create geospatial index for location queries
incidentSchema.index({ location: '2dsphere' });
incidentSchema.index({ createdAt: -1 });
incidentSchema.index({ category: 1 });

export default mongoose.model<IIncident>('Incident', incidentSchema);
