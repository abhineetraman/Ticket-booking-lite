from flask import Flask, send_from_directory, session
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import scoped_session, sessionmaker
from flask_restful import Resource, Api,  fields, marshal_with, reqparse
from applications.validation import NotFoundError, BusinessValidationError, AuthorisationError
from flask_cors import CORS
from matplotlib import use
from datetime import timedelta
from os import path
from flask_caching import Cache
from matplotlib.pyplot import bar, xlabel, ylabel, savefig, xlim, ylim
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, JWTManager

from applications.models import db, User, Theatre, Profile, Show, Bookings, Seats
from applications import workers, celery_task


app = Flask(__name__, template_folder="templates")
app.config['SECRET_KEY'] = "21f1005523"
app.config["JWT_SECRET_KEY"] ="21f1005523"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=5)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///ticketDB.sqlite3'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

app.config["CACHE_TYPE"] = "redis"
app.config['CACHE_REDIS_HOST'] = "localhost"
app.config['CACHE_REDIS_PORT'] = 6379
app.config['CACHE_REDIS_DB'] = 0
app.config["CACHE_REDIS_URL"] = "redis://localhost:6379"  
app.config['CACHE_DEFAULT_TIMEOUT'] = 500
app.config['WTF_CSRF_ENABLED'] = False

db.init_app(app)
api = Api(app)
app.app_context().push()
CORS(app)
jwt = JWTManager(app)
cash = Cache(app)

celery = workers.celery
celery.conf.update(
    broker_url='redis://localhost:6379',
    result_backend='redis://localhost:6379',
    timezone = 'Asia/Kolkata'
)

celery.Task = workers.ContextTask
app.app_context().push()
use("Agg")



output_fields = {
    "username": fields.String,
    "password": fields.String,
    "urole": fields.String,
    "accessToken": fields.String
}

create_user_parser = reqparse.RequestParser()
create_user_parser.add_argument('email')
create_user_parser.add_argument('pwd')

class LoginAPI(Resource):
    @cash.cached(timeout=10)
    @marshal_with(output_fields)
    def post(self, email, pwd):
        user = db.session.query(User).filter(User.email==email).first()
        print(user)
        if user:
            if pwd == user.password:
                access_token = create_access_token(identity=email)
                user.accessToken = access_token
                db.session.commit()
                session["cust"] = user.username
            else:
                raise BusinessValidationError(status_code=400, error_code="BE0001", error_message="Incorrect Password")
        else:
            raise NotFoundError(status_code=404)
        
        user = db.session.query(User).filter(User.email==email).first()
        return user, 200


class SignupAPI(Resource):
    def post(self):
        args = create_user_parser.parse_args()
        email = args.get("email", None)
        password = args.get("pwd", None)

        if email is None:
            raise BusinessValidationError(status_code=400, error_code="BE1001", error_message="Email is Required")

        if password is None:
            raise BusinessValidationError(status_code=400, error_code="BE1002", error_message="Password is Required")

        if '@' not in email:
            raise BusinessValidationError(status_code=400, error_code="BE1003", error_message="Invalid email")

        user = db.session.query(User).filter(User.email == email).first()
        if user:
            raise BusinessValidationError(status_code=402, error_code="BE1004", error_message="Duplicate Value")

        uname = ""
        for i in email:
            if i != '@':
                uname += i
            if i == '@':
                break
        
        temp_user = User(email=email, password = password, username=uname, urole="user")
        db.session.add(temp_user)
        db.session.commit()

        return "Account Created", 200


create_theatre_parser = reqparse.RequestParser()
create_theatre_parser.add_argument('vname')
create_theatre_parser.add_argument('capacity')
create_theatre_parser.add_argument('location')
create_theatre_parser.add_argument('place')

update_theatre_parser = reqparse.RequestParser()
update_theatre_parser.add_argument("name")

theatre_output = {
    "id": fields.Integer,
    "name": fields.String,
    "place": fields.String,
    "location": fields.String,
    "capacity": fields.Integer
}


class TheatreAPI(Resource):
    @jwt_required()
    @marshal_with(theatre_output)
    def get(self):
        theatre = db.session.query(Theatre).all()
        return theatre, 200

    @jwt_required()
    def post(self, uname):
        if uname != "abhineetraman":
            raise AuthorisationError(status_code=500, error_message="You are not Authorised")
        args = create_theatre_parser.parse_args()
        vname = args.get("vname", None)
        capacity = args.get("capacity", None)
        location = args.get("location", None)
        place = args.get("place", None)

        if vname is None:
            raise BusinessValidationError(status_code=400, error_code="BE2001", error_message="Venue Name is Required")
        
        if capacity is None:
            raise BusinessValidationError(status_code=400, error_code="BE2002", error_message="Capacity is Required")
        
        if place is None:
            raise BusinessValidationError(status_code=400, error_code="BE2003", error_message="Place is Required")
        
        if location is None:
            raise BusinessValidationError(status_code=400, error_code="BE2004", error_message="Location is Required")
        
        theatre = db.session.query(Theatre).filter(Theatre.name == vname and Theatre.place == place).first()
        if theatre:
            raise BusinessValidationError(status_code=402, error_code="BE1004", error_message="Duplicate Value")
        
        temp_theatre = Theatre(name=vname, place=place, location=location, capacity=capacity)
        db.session.add(temp_theatre)
        db.session.commit()

        return "Venue added", 200
    
    @jwt_required()
    def put(self, id, uname):
        if uname != "abhineetraman":
            raise AuthorisationError(status_code=500, error_message="You are not Authorised")
        theatre = db.session.query(Theatre).filter(Theatre.id==id).first()
        args = update_theatre_parser.parse_args()
        name = args.get("name", None)

        if theatre is None:
            raise NotFoundError(status_code=404)
        
        elif name is None:
            raise BusinessValidationError(status_code=400, error_code="BE2005", error_message="Name is Required")
        
        elif theatre:
            theatre.name = name
            db.session.commit()

            return "Updated", 200

    @jwt_required()
    def delete(self, id, uname):
        if uname != "abhineetraman":
            raise AuthorisationError(status_code=500, error_message="You are not Authorised")
        temp_theatre = db.session.query(Theatre).filter(Theatre.id==id).first()

        if temp_theatre is None:
            raise NotFoundError(status_code=404)
        
        temp_show = db.session.query(Show).filter(Show.t_id == id).all()
        for i in temp_show:
            db.session.delete(i)
        
        db.session.delete(temp_theatre)
        db.session.commit()

        return "Theatre and it shows deleted", 200


create_show_parser = reqparse.RequestParser()
create_show_parser.add_argument('vid')
create_show_parser.add_argument('sname')
create_show_parser.add_argument('img_link')
create_show_parser.add_argument('tags')
create_show_parser.add_argument('price')
create_show_parser.add_argument('stime')
create_show_parser.add_argument('etime')
create_show_parser.add_argument('seats')

create_show_update_parser = reqparse.RequestParser()
create_show_update_parser.add_argument('name')
create_show_update_parser.add_argument('img_link')
create_show_update_parser.add_argument('rating')

show_output = {
    "id": fields.Integer,
    "name": fields.String,
    "tags": fields.String,
    "price": fields.String,
    "timing": fields.String,
    "img_link": fields.String,
    "rating": fields.Integer,
    "t_id": fields.Integer
}

class ShowAPI(Resource):
    @jwt_required()
    @marshal_with(show_output)
    def get(self):
        shows = db.session.query(Show).all()
        return shows, 200

    @jwt_required() 
    def post(self, tid, uname):
        if uname != "abhineetraman":
            raise AuthorisationError(status_code=500, error_message="You are not Authorised")
        args = create_show_parser.parse_args()
        sname = args.get("sname", None)
        tags = args.get("tags", None)
        price = args.get("price", None)
        stime = args.get("stime", None)
        etime = args.get("etime", None)
        img_link = args.get("img_link", None)
        seats = args.get("seats", None)
        vid = args.get("vid")
        print(args)

        if sname is None:
            raise BusinessValidationError(status_code=400, error_code="BE3001", error_message="Show Name is Required")
        
        if tags is None:
            raise BusinessValidationError(status_code=400, error_code="BE3002", error_message="Tags is Required")
        
        if price is None:
            raise BusinessValidationError(status_code=400, error_code="BE3003", error_message="Price is Required")
                
        if stime is None:
            raise BusinessValidationError(status_code=400, error_code="BE3004", error_message="Start timing is required")
        
        if etime is None:
            raise BusinessValidationError(status_code=400, error_code="BE3005", error_message="End timing is required")

        if seats is None:
            raise BusinessValidationError(status_code=400, error_code="BE3006", error_message="Seats is Required")

        show = db.session.query(Show).filter(Show.t_id == vid).first()
        if show:
            if show[1] == sname:
                raise BusinessValidationError(status_code=402, error_code="BE1004", error_message="Duplicate Value")
        
        timing = str(stime) + " - " + str(etime)
        temp_show = Show(name=sname, tags=tags, price=price, timing=timing, rating=0, t_id=vid, img_link=img_link, seats=seats)
        db.session.add(temp_show)
        db.session.commit()

        return "Show added", 200

    @jwt_required()
    def put(self, id, uname):
        if uname != "abhineetraman":
            raise AuthorisationError(status_code=500, error_message="You are not Authorised")
        show = db.session.query(Show).filter(Show.id==id).first()
        args = create_show_update_parser.parse_args()
        name = args.get("name", None)
        img_link = args.get("img_link", None)
        rating = args.get("rating", None)
        print(args)

        if show is None:
            raise NotFoundError(status_code=404)
        elif show:
            if name is not None:
                print("here")
                show.name = name
            if img_link is not None:
                print("here")
                show.img_link = img_link
            if rating is not None:
                print("here")
                show.rating = rating
            db.session.commit()

            return "Updated", 200

    @jwt_required()
    def delete(self, sid, uname):
        if uname != "abhineetraman":
            raise AuthorisationError(status_code=500, error_message="You are not Authorised")
        
        temp_show = db.session.query(Show).filter(Show.id == sid).first()

        if temp_show is None:
            raise NotFoundError(status_code=404)
        
        db.session.delete(temp_show)
        db.session.commit()

        return "Show is Deleted", 200


create_booking_parser = reqparse.RequestParser()
create_booking_parser.add_argument('quantity')
create_booking_parser.add_argument('uname')
create_booking_parser.add_argument('booking_date')
create_booking_parser.add_argument('sid')

update_booking_parser = reqparse.RequestParser()
update_booking_parser.add_argument('rating')
update_booking_parser.add_argument('bid')

output_data = {
    "b_id" : fields.Integer,
    "quantity" : fields.Integer,
    "date" : fields.String,
    "s_name" : fields.String,
    "t_name" : fields.String,
    "timing" : fields.String,
    "rating" : fields.String
}


class BookingsAPI(Resource):
    @jwt_required()
    @marshal_with(output_data)
    def get(self, uname):
        user = db.session.query(User).filter(User.username == uname).filter(User.urole == "user").first()
        if user is None:
            raise AuthorisationError(status_code=500, error_message="You are not Authorised")
        data = db.session.query(Bookings).filter(uname == uname).all()
        return data, 200
    
    @jwt_required()
    def post(self, uname):
        user = db.session.query(User).filter(User.username == uname).filter(User.roles == "user").first()
        if user is None:
            raise AuthorisationError(status_code=500, error_message="You are not Authorised")
        args = create_booking_parser.parse_args()
        uname = args.get("uname")
        booking_date = args.get("booking_date", None)
        quantity = args.get("quantity", None)
        sid = args.get("sid")

        t_name, s_name, timing, tid = "", "", "", 0

        show = db.session.query(Show).filter(Show.id == sid).first()
        if show:
            s_name = show.name
            timing = show.timing
            tid = show.t_id
        
        theatre = db.session.query(Theatre).filter(Theatre.id == tid).first()
        if theatre:
            t_name = theatre.name
        
        if booking_date is None:
            raise BusinessValidationError(status_code=400, error_code="BE4001", error_message="Booking Date is Required")
        
        if quantity is None:
            raise BusinessValidationError(status_code=400, error_code="BE4002", error_message="Quantity is Required")
        
        temp_booking = Bookings(uname=uname, s_name=s_name, t_name=t_name, timing=timing, date=booking_date, quantity=quantity, rating="-")
        db.session.add(temp_booking)
        db.session.commit()

        seats = db.session.query(Seats).filter(Seats.sid == sid).first()
        if seats:
            seats.booked += int(quantity)
            seats.available -= int(quantity)

        db.session.commit() 

        return "bookings added", 200
    
    @jwt_required()
    def put(self,uname):
        user = db.session.query(User).filter(User.username == uname).filter(User.roles == "user").first()
        if user is None:
            raise AuthorisationError(status_code=500, error_message="You are not Authorised")
        args = update_booking_parser.parse_args()
        rating = args.get("rating", None)
        bid = args.get("bid")
        
        book = db.session.query(Bookings).filter(Bookings.b_id == bid).first()
        sname = ""
        if book:
            book.rating = rating
            sname = book.s_name
        
        db.session.commit()

        booking = db.session.query(Bookings).filter(Bookings.s_name == sname).group_by(Bookings.s_name).having(db.func.avg(Bookings.rating)).first()
        avg_rating = 0
        if booking:
            avg_rating = booking.rating
        
        show = db.session.query(Show).filter(Show.name == sname).all()
        for i in show:
            i.rating = avg_rating
        
        db.session.commit()

        return "Rated", 200

summary_output = {
    "sname" : fields.String,
    "booked" : fields.Integer
}


class SummaryAPI(Resource):
    @jwt_required()
    @marshal_with(summary_output)
    def get(self, uname):
        if uname != "abhineetraman":
            raise AuthorisationError(status_code=500, error_message="You are not Authorised")
        data = db.session.query(Seats).group_by(Seats.sname).having(db.func.sum(Seats.booked)).all()
        l1, l2 = [], []

        for i in data:
            l1.append(i.sname)
            l2.append(i.booked)

        bar(l1, l2)
        savefig("static/graph.png")
        return data, 200


create_profile_parser = reqparse.RequestParser()
create_profile_parser.add_argument('uname')
create_profile_parser.add_argument('fname')
create_profile_parser.add_argument('lname')
create_profile_parser.add_argument('dob')
create_profile_parser.add_argument('phone')

prof_output = {
    "fname" : fields.String,
    "lname" : fields.String,
    "dob" : fields.String,
    "phone" : fields.Integer
}

class ProfileAPI(Resource):
    @jwt_required()
    @marshal_with(prof_output)
    def get(self, uname):
        user = db.session.query(User).filter(User.username == uname).filter(User.urole == "user").first()
        if user is None:
            raise AuthorisationError(status_code=500, error_message="You are not Authorised")
        prof = db.session.query(Profile).filter(uname == uname).first()
        return prof, 200

    @jwt_required()
    def post(self, uname):
        user = db.session.query(User).filter(User.username == uname).filter(User.roles == "user").first()
        if user is None:
            raise AuthorisationError(status_code=500, error_message="You are not Authorised")
        args = create_profile_parser.parse_args()
        fname = args.get("fname", None)
        lname = args.get("lname", None)
        dob = args.get("dob", None)
        phone = args.get("phone", None)
        uname = args.get("uname", None)

        print(args)

        if fname is None:
            raise BusinessValidationError(status_code=400, error_code="BE5001", error_message="First Name is Required")
        
        if lname is None:
            raise BusinessValidationError(status_code=400, error_code="BE5002", error_message="Last Name is Required")
        
        if dob is None:
            raise BusinessValidationError(status_code=400, error_code="BE5003", error_message="Date of Birth is Required")
        
        if phone is None:
            raise BusinessValidationError(status_code=400, error_code="BE5004", error_message="Phone number is required")

        profile = db.session.query(Profile).filter(Profile.uname == uname).first()
        if profile:
            if fname is not None:
                profile.fname =fname
            
            if lname is not None:
                profile.lname = lname
            
            if dob is not None:
                print(uname)
                profile.dob = dob
                print(profile.dob)

            if phone is not None:
                profile.phone = phone
            
            db.session.commit()
        
        else:
            temp_prof = Profile(uname=uname, fname=fname, lname=lname, dob=dob, phone=phone)
            db.session.add(temp_prof)
            db.session.commit()

        return "Profile Updated", 200


seat_output = {
    "available" : fields.Integer
}


class SeatsAPI(Resource):
    @jwt_required()
    @marshal_with(seat_output)
    def get(self, id, uname):
        user = db.session.query(User).filter(User.username == uname).filter(User.roles == "user").first()
        if user is None:
            raise AuthorisationError(status_code=500, error_message="You are not Authorised")
        seat = db.session.query(Seats).filter(Seats.sid == id).first()

        return seat, 200

    @jwt_required()
    def post(self, id, uname):
        user = db.session.query(User).filter(User.username == uname).filter(User.roles == "user").first()
        if user is None:
            raise AuthorisationError(status_code=500, error_message="You are not Authorised")
        show = db.session.query(Show).filter(Show.id == id).first()
        seat = db.session.query(Seats).filter(Seats.sid == id).first()
        if seat:
            return "Already added", 200
        sname = show.name
        total_seats = show.seat
        booked = 0
        available = show.seat

        tmp_seat = Seats(sid=id, sname=sname, total_seats=total_seats, booked=booked, available=available)
        db.session.add(tmp_seat)
        db.session.commit()

        return "Added", 200
        

class CSVReportAPI(Resource):
    @jwt_required()
    def get(self, id, uname):
        if uname != "abhineetraman":
            raise AuthorisationError(status_code=500, error_message="You are not Authorised")
        message = celery_task.send_task(id) #.apply_async()
        #result = message.wait()
        return send_from_directory("static",f'abhineetraman_details.csv')

from applications.controllers import *

api.add_resource(LoginAPI, "/api/login/<string:email>/<string:pwd>")
api.add_resource(SignupAPI, "/api/signup/POST")
api.add_resource(TheatreAPI, "/api/Theatre/GET", "/api/Theatre/POST/<string:uname>", "/api/Theatre/<int:id>/<string:uname>")
api.add_resource(ShowAPI, "/api/show/GET", "/api/show/post/<int:tid>/<string:uname>", "/api/show/put/<int:id>/<string:uname>", "/api/show/DELETE/<string:sid>/<string:uname>")
api.add_resource(BookingsAPI, "/api/bookings/<string:uname>")
api.add_resource(SummaryAPI, "/api/summary/GET/<string:uname>")
api.add_resource(ProfileAPI, "/api/profile/<string:uname>")
api.add_resource(SeatsAPI, "/api/seats/<int:id>/<string:uname>")
api.add_resource(CSVReportAPI, "/api/export/<int:id>/<string:uname>")

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5000)