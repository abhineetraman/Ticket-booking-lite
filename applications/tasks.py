from .workers import celery
from .models import *
from .mailer import sendMail, sendMemer
from celery.schedules import crontab
from flask import current_app as app
from flask import render_template
from jinja2 import Template
from datetime import datetime

date = datetime.now().strftime("%b %d %Y")


def report_generator(filename, data, uname):
    with open(filename) as file_:
        template = Template(file_.read())
        return template.render(data=data, uname=uname)

'''
def create_pdf_report(data, uname):
    message = report_generator("monthlyreport.html", data=data, uname=uname)
    html = weasyprint.HTML(string=message)
    file_name = str(uuid.uuid4()) + ".pdf"
    print(file_name)
    html.write_pdf(target=file_name)
    return message, file_name '''

def data():
    user = User.query.all()
    print('hi')
    for u in user:
        book = Bookings.query.filter_by(uname = u.username).order_by(Bookings.bid.desc()).first()
        if book:
            if book.date != date:
                email = u.email
                sendMail(email, subject="Show Booking Reminder", message="You have not booked the show today. Book one and Enjoy")
                print('hi')
    print('hi')


@celery.task
def send_task(id):
    file = open('static/abhineetraman_details.csv', 'w')
    shows = Show.query.filter_by(t_id = id).all()
    file.write('Show Name, Booked Tickets, Total Revenue \n')
    for s in shows:
        s_name = s.name
        sid = s.id
        seats = Seats.query.filter_by(sid = sid).first()
        if seats:
            book = seats.booked
            rev = book * s.price
            data = str(s_name) + "," + str(book) + "," + str(rev) + "\n"
            file.write(data)
    
    return "CSV file Exported"


@celery.on_after_finalize.connect
def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(crontab(minute=0, hour=0), seat_update_task.s(), name="seat_update_task")

    sender.add_periodic_task(crontab(minute=36, hour=14), daily_reminder.s(), name="daily_reminder")

    sender.add_periodic_task(crontab(minute=0, hour=14, day_of_month="1"), month_report.s(), name="month_report")


@celery.task
def daily_reminder():
    user = User.query.filter_by(urole = "user").all()
    print('hi')
    for u in user:
        book = Bookings.query.filter_by(uname = u.username).order_by(Bookings.b_id.desc()).first()
        if book:
            if book.date != date:
                email = u.email
                sendMail(email, subject="Show Booking Reminder", message="You have not booked the show today. Book one and Enjoy")
                print('hi')
    print('hi')
    #data()
    return "daily reminder done!"

@celery.task
def month_report():
    user = User.query.all()[1::]
    for u in user:
        uname = u.username
        email = u.email
        book = Bookings.query().filter_by(uname = u.username).all()
        if book is not None:
            message, attachment = report_generator("templates/monthreport.html", book, uname)
            sendMemer(email, subject="Monthly Engagement Report", message=message, attachment=attachment)
    return "Monthly Engagement Report Sent!"

@celery.task
def seat_update_task():
    seats = Seats.query.all()
    print(seats)
    for s in seats:
        ts = s.total_seats
        print(ts)
        s.available = ts
    db.session.commit()

    return "seats updated"