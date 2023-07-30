from flask_sqlalchemy import SQLAlchemy
from flask import current_app as app

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = "user"
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    email = db.Column(db.String, unique=True)
    password = db.Column(db.String, nullable=False)
    username = db.Column(db.String, nullable=False)
    active = db.Column(db.Boolean)
    accessToken = db.Column(db.String(255), unique=True, nullable=False)
    urole = db.Column(db.String, nullable=False)


class Theatre(db.Model):
    __tablename__ = "Theatre"
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    name = db.Column(db.String, nullable=False)
    place = db.Column(db.String, nullable=False)
    capacity = db.Column(db.String, nullable=False)
    location = db.Column(db.String, nullable=False)

class Show(db.Model):
    __tablename__ = "Show"
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    name = db.Column(db.String, nullable=False)
    img_link = db.Column(db.String, nullable=False)
    tags = db.Column(db.String, nullable=False)
    price = db.Column(db.Integer, nullable=False)
    rating = db.Column(db.Float)
    timing = db.Column(db.String, nullable=False)
    t_id = db.Column(db.Integer, db.ForeignKey("Theatre.id"), nullable=False)
    seats = db.Column(db.Integer, nullable=False)


class Bookings(db.Model):
    __tablename__ = "Bookings"
    b_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    uname = db.Column(db.String, db.ForeignKey("User.username"))
    t_name = db.Column(db.String, db.ForeignKey("Theatre.name"), nullable=False)
    s_name = db.Column(db.String, db.ForeignKey("Show.name"))
    timing = db.Column(db.String, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    date = db.Column(db.String, nullable=False)
    rating = db.Column(db.String, nullable=False)


class Seats(db.Model):
    __tablename__ ="Seats"
    sl_no = db.Column(db.Integer, autoincrement=True, primary_key=True)
    sid = db.Column(db.Integer, db.ForeignKey("Show.id"), nullable=False)
    sname = db.Column(db.String, db.ForeignKey("Show.name"), nullable=False)
    total_seats = db.Column(db.Integer, db.ForeignKey("Show.seats"), nullable=False)
    booked = db.Column(db.Integer, nullable=False)
    available = db.Column(db.Integer, nullable=False)


class Profile(db.Model):
    __tablename__ = "Profile"
    uname = db.Column(db.String, db.ForeignKey("User.username"), primary_key=True)
    fname = db.Column(db.String)
    lname = db.Column(db.String)
    dob = db.Column(db.String)
    phone = db.Column(db.Integer)
