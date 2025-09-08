// models/user.ts
import mongoose, { Schema, Document, Model, Types } from "mongoose"; // add Types
import bcrypt from "bcryptjs";

export type Role = "user" | "admin";

export interface IUser extends Document {
  _id: Types.ObjectId; // explicitly add _id type
  fullName: string;
  email: string;
  username: string;
  password: string;
  role: Role;
  emailVerified: boolean;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  verificationTokenPurpose?: "signup" | "password-reset";

  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    emailVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationTokenExpiry: { type: Date },
    verificationTokenPurpose: { type: String, enum: ["signup", "password-reset"] },
  },
  { timestamps: true }
);

// Pre-save hook to hash password if it’s new or modified
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err as any);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
