import { Request, Response, NextFunction } from "express";

module.exports = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).send({ error: "You must log in!" });
  }
  return next();
};
