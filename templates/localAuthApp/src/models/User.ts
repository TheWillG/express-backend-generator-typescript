import mongoose from "mongoose";
import { Schema } from "mongoose";
import bcrypt from "bcrypt";

export type UserModel = mongoose.Document & {
  email: string,
  password: string
};

type comparePasswordFunction = (candidatePassword: string, cb: (err: any, isMatch: any) => {}) => void;


const userSchema = new Schema({
  email: String,
  password: String,
});

userSchema.pre("save", function save(next) {
  const user: any = this;
  if (!user.isModified("password")) { return next(); }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }
    bcrypt.hash(user.password, salt, (err: mongoose.Error, hash) => {
      if (err) { return next(err); }
      user.password = hash;
      next();
    });
  });
});

const comparePassword: comparePasswordFunction = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err: mongoose.Error, isMatch: boolean) => {
    cb(err, isMatch);
  });
};

userSchema.methods.comparePassword = comparePassword;

const User = mongoose.model("User", userSchema);
export default User;