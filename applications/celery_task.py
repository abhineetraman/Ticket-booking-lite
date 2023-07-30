from .workers import celery
from .models import *
from .mailer import *
from celery.schedules import crontab
from flask import current_app as app
from flask import render_template
from jinja2 import Template
from datetime import datetime

date = datetime.now().strftime("%b %d %Y")

def report_genrator(filename, data, uname):
    with open(filename) as file:
        template =Template(file.read())
        return template.render(data=data, uname=uname)

@celery.task
def send_task(id):
    file = open("/static/theatre_details.csv", 'w')
    shows = Show.query.filter_by(t_id = id).all()
    file.write("Show Name, Booked Tickets, Total Revenue \n")
    for s in shows:
        sname = s.name
        sid = s.id
        seats = Seats.query.filter_by(sid = sid).first()
        if seats:
            book = seats.booked
            rev = book * s.price
            data = str(sname) + "," + str(book) + "," + str(rev) + "\n"
            file.write(data)
        
    return "CSV File Imported"

@celery.on_after_finalize.connect
def setup_perodic_tasks(sender, **kwargs):
    sender.add_periodic_task(crontab(minute=0, hour=0), seat_update_task.s(), name="seat_update_daily")

    sender.add_periodic_task(crontab(minute=52, hour=22), daily_reminder.s(), name="daily_reminder_task")

    sender.add_periodic_task(crontab(minute=0, hour=16, day_of_month="1"), month_report.s(), name="month_reporting_task")


@celery.task
def daily_reminder():
    user = User.query.filter_by(urole="user").all()
    for u in user:
        book = Bookings.query.filter_by(uname = u.username).order_by(Bookings.b_id.desc()).first()
        if book:
            if book.date != date:
                email = u.email
                sendMail(email, subject="Show Booking Reminder", message="Book your show Now")
    
    return "Daily Reminder Sent"

@celery.task
def month_report():
    user = User.query.filter_by(urole="user").all()
    for u in user:
        uname = u.username
        email = u.email
        book = Bookings.query.filter_by(uname=uname).all()
        if book is not None:
            message, attachment = report_genrator("templates/monthreport.html", book, uname)
            sendMemer(email, subject="Monthly Engagement Report", attachment=attachment)
    
    return "Monthly Report Sent"

@celery.task
def seat_update_task():
    seats = Seats.query.all()
    for s in seats:
        ts = s.total_seats
        s.available = ts
    
    db.session.commit()
    return "Seat Updated"