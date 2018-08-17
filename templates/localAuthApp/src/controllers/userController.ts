import passport from "passport";
import { Request, Response, NextFunction } from "express";
import { default as User, UserModel } from "../models/User";

const login = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("local", (err: Error, user: UserModel) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(404).send("Username and password not found");
    }
    req.logIn(user, (err: Error) => {
      if (err) {
        return next(err);
      }
      res.status(200).send("Logged in");
    });
  })(req, res, next);
};

const logout = (req: Request, res: Response) => {
  req.logout();
  res.status(200).send("Logged out");
};

const signup = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  const user = new User({ email, password });

  console.log("user", user);

  User.findOne({ email }, (err, existingUser) => {
    if (err) {
      return next(err);
    }
    if (existingUser) {
      return res
        .status(409)
        .send("Email already registered to an existing user");
    }
    user.save(err => {
      if (err) {
        return next(err);
      }
      req.logIn(user, (err: Error) => {
        if (err) {
          return next(err);
        }
        const { id } = user;
        res.status(201).send({ id });
      });
    });
  });
};

export default {
  login,
  logout,
  signup
};
